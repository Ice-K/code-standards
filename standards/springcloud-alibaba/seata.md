# Spring Cloud Alibaba - Seata 分布式事务规范

## 适用范围
- 适用于所有 Spring Cloud Alibaba 微服务中需要保证分布式数据一致性的场景
- 与微服务设计规范中的最终一致性方案（MQ + 本地消息表）配合使用
- 涵盖 AT 模式、TCC 模式、事务配置、补偿机制等场景

## 规则

### R1: AT 模式适用场景
**级别**: 推荐
**描述**: AT 模式是 Seata 的默认模式，适用于大多数业务场景（侵入性低）。它通过拦截 SQL 自动生成回滚日志（undo_log），适合 CRUD 类的常规业务操作。
**正例**:
```java
// AT 模式——下单扣库存（最常见的分布式事务场景）
@Service
@RequiredArgsConstructor
public class OrderApplicationService {

    private final OrderMapper orderMapper;
    private final ProductClient productClient;
    private final AccountClient accountClient;

    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        // 1. 创建订单（本地事务）
        Order order = Order.create(dto);
        orderMapper.insert(order);

        // 2. 扣减库存（远程调用，Product 服务也有 undo_log）
        productClient.deductStock(dto.getProductId(), dto.getQuantity());

        // 3. 扣减账户余额（远程调用，Account 服务也有 undo_log）
        accountClient.deductBalance(dto.getUserId(), dto.getTotalAmount());

        return order.getId();
        // 任何一步失败，Seata 自动通过 undo_log 回滚所有参与者
    }
}
```
```sql
-- 每个参与事务的数据库都需要 undo_log 表
CREATE TABLE IF NOT EXISTS `undo_log` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT,
    `branch_id`        BIGINT       NOT NULL,
    `xid`              VARCHAR(128) NOT NULL,
    `context`          VARCHAR(128) NOT NULL,
    `rollback_info`    LONGBLOB     NOT NULL,
    `log_status`       INT          NOT NULL,
    `log_created`      DATETIME     NOT NULL,
    `log_modified`     DATETIME     NOT NULL,
    `ext`              VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4;
```
**反例**:
```java
// 不使用分布式事务，各服务各自提交，中间失败无法回滚
@Service
public class OrderService {

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        // 本地事务只保证订单表的原子性
        Order order = Order.create(dto);
        orderMapper.insert(order);

        // 远程调用不受本地事务控制
        productClient.deductStock(dto.getProductId(), dto.getQuantity());
        // 如果下面调用失败，库存已扣但订单无法回滚
        accountClient.deductBalance(dto.getUserId(), dto.getTotalAmount());
        // 如果这里抛异常：订单回滚了，但库存没回滚——数据不一致
        return order.getId();
    }
}
```

### R2: TCC 模式适用场景
**级别**: 建议
**描述**: TCC（Try-Confirm-Cancel）模式适用于非关系型数据库、复杂业务逻辑、需要精细化控制资源的场景。需要手动实现 Try、Confirm、Cancel 三个阶段。
**正例**:
```java
// TCC 模式——转账场景（需要冻结资金）
// Try：冻结转账金额
// Confirm：扣除冻结金额
// Cancel：解冻金额

public interface AccountTccService {

    @TwoPhaseBusinessAction(
        name = "deductBalance",
        commitMethod = "confirm",
        rollbackMethod = "cancel"
    )
    boolean tryDeduct(
        @BusinessActionContextParameter(paramName = "userId") Long userId,
        @BusinessActionContextParameter(paramName = "amount") BigDecimal amount
    );

    boolean confirm(BusinessActionContext context);

    boolean cancel(BusinessActionContext context);
}

@Service
@Slf4j
public class AccountTccServiceImpl implements AccountTccService {

    @Autowired
    private AccountMapper accountMapper;
    @Autowired
    private FreezeRecordMapper freezeRecordMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean tryDeduct(Long userId, BigDecimal amount) {
        // 1. 检查余额是否充足
        Account account = accountMapper.selectByUserId(userId);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }

        // 2. 冻结金额（而非直接扣除）
        accountMapper.freezeBalance(userId, amount);

        // 3. 记录冻结记录（用于 Cancel 时解冻）
        FreezeRecord record = new FreezeRecord();
        record.setUserId(userId);
        record.setAmount(amount);
        record.setStatus("FROZEN");
        freezeRecordMapper.insert(record);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirm(BusinessActionContext context) {
        Long userId = (Long) context.getActionContext("userId");
        BigDecimal amount = new BigDecimal(
            context.getActionContext("amount").toString());

        // 确认扣款：扣除冻结金额
        accountMapper.deductFrozenBalance(userId, amount);
        freezeRecordMapper.updateStatusByUser(userId, "FROZEN", "CONFIRMED");
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancel(BusinessActionContext context) {
        Long userId = (Long) context.getActionContext("userId");
        BigDecimal amount = new BigDecimal(
            context.getActionContext("amount").toString());

        // 取消：解冻金额
        accountMapper.unfreezeBalance(userId, amount);
        freezeRecordMapper.updateStatusByUser(userId, "FROZEN", "CANCELLED");
        return true;
    }
}
```
**反例**:
```java
// 简单 CRUD 场景使用 TCC——过度设计，增加开发成本
// TCC 需要手动实现三个阶段，且需要额外的冻结表
// 对于简单的"创建订单 + 扣库存"，AT 模式更合适

// TCC 的 Cancel 方法没有幂等处理
@Override
public boolean cancel(BusinessActionContext context) {
    Long userId = (Long) context.getActionContext("userId");
    // 没有检查冻结记录状态，可能重复解冻
    accountMapper.unfreezeBalance(userId, amount);
    return true;
}
```

### R3: @GlobalTransactional 正确使用
**级别**: 必须
**描述**: @GlobalTransactional 标注在分布式事务的发起方（TM），控制全局事务的开始、提交和回滚。必须指定 rollbackFor 和 name 属性。
**正例**:
```java
@Service
@RequiredArgsConstructor
public class OrderApplicationService {

    @GlobalTransactional(
        name = "create-order-tx",                 // 事务名称，便于监控
        rollbackFor = Exception.class,             # 所有异常都回滚
        timeoutMills = 30000                       # 超时 30 秒
    )
    public Long createOrder(OrderCreateDTO dto) {
        // 1. 本地操作
        Order order = Order.create(dto);
        orderMapper.insert(order);

        // 2. 远程调用（RM 操作）
        productClient.deductStock(dto.getProductId(), dto.getQuantity());
        accountClient.deductBalance(dto.getUserId(), dto.getTotalAmount());

        return order.getId();
    }
}
```
**反例**:
```java
// 不指定 rollbackFor，默认只回滚 RuntimeException
@GlobalTransactional(name = "create-order-tx")
public Long createOrder(OrderCreateDTO dto) throws IOException {
    // IOException 不会触发回滚
    // 如果远程调用抛出 IOException，事务不会回滚
}

// 超时时间不设置，可能长时间持有全局锁
@GlobalTransactional(name = "create-order-tx", rollbackFor = Exception.class)
// 缺少 timeoutMills，事务可能长时间不提交

// @GlobalTransactional 标注在内部方法上（不生效）
@Service
public class OrderService {

    public Long createOrder(OrderCreateDTO dto) {
        return doCreateOrder(dto);    // 外部方法调用内部方法
    }

    @GlobalTransactional(name = "create-order")  // 不生效！同一类内部调用
    public Long doCreateOrder(OrderCreateDTO dto) {
        // ...
    }
}
```

### R4: 全局锁与本地锁配合
**级别**: 必须
**描述**: AT 模式下 Seata 通过全局锁保证隔离性，本地事务提交前需要获取全局锁。避免在全局事务外直接修改被全局锁保护的数据，造成脏写。
**正例**:
```yaml
# Seata AT 模式隔离级别配置
seata:
  client:
    rm:
      async-commit-buffer-limit: 10000
      report-retry-count: 5
      table-meta-check-enable: true
      report-success-enable: false
      lock:
        retry-interval: 10           # 获取全局锁重试间隔 10ms
        retry-times: 30              # 获取全局锁重试次数 30 次
        lock-policy: branch-type     # 锁策略
```
```java
// 正确：全局事务内操作受保护的数据
@GlobalTransactional(name = "order-tx", rollbackFor = Exception.class)
public void updateOrderStatus(Long orderId, String status) {
    // 在全局事务内修改，Seata 自动获取全局锁
    orderMapper.updateStatus(orderId, status);
}
```
**反例**:
```java
// 错误：在全局事务外直接修改被保护的数据
@Transactional(rollbackFor = Exception.class)
public void manualUpdateOrder(Long orderId) {
    // 没有 @GlobalTransactional，不获取全局锁
    // 如果此时有全局事务也在操作这条数据，可能造成脏写
    orderMapper.updateStatus(orderId, "MANUAL_UPDATE");
}

// 全局锁重试次数配置过大，阻塞时间过长
seata:
  client:
    rm:
      lock:
        retry-interval: 100          # 重试间隔 100ms
        retry-times: 300             # 重试 300 次 = 最多阻塞 30 秒
```

### R5: undo_log 表维护
**级别**: 必须
**描述**: 每个参与 AT 模式分布式事务的数据库都必须创建 undo_log 表。Seata 通过 undo_log 记录数据修改前的快照用于回滚。事务完成后 undo_log 应由 Seata 自动清理。
**正例**:
```sql
-- undo_log 建表语句（每个参与的数据库都要创建）
CREATE TABLE IF NOT EXISTS `undo_log` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT,
    `branch_id`        BIGINT       NOT NULL,
    `xid`              VARCHAR(128) NOT NULL,
    `context`          VARCHAR(128) NOT NULL,
    `rollback_info`    LONGBLOB     NOT NULL,
    `log_status`       INT          NOT NULL,
    `log_created`      DATETIME     NOT NULL,
    `log_modified`     DATETIME     NOT NULL,
    `ext`              VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4;
```
```yaml
# undo_log 清理配置
seata:
  client:
    rm:
      undo:
        data-validation: true       # 开启回滚数据校验
        log-serialization: jackson   # 序列化方式
        log-table: undo_log          # 表名（默认 undo_log）
```
**反例**:
```sql
-- 遗漏某个参与者的 undo_log 表
-- 库存服务数据库创建了 undo_log，但账户服务数据库忘记创建
-- 下单流程执行到账户扣款时，报错找不到 undo_log 表

-- 修改 undo_log 表结构
ALTER TABLE undo_log ADD COLUMN extra_info TEXT;   # 不要修改 Seata 管理的表
```

### R6: 超时配置
**级别**: 必须
**描述**: 全局事务和分支事务必须配置合理的超时时间。全局事务超时不宜过长（建议 30~60 秒），避免长时间占用全局锁导致其他事务等待。
**正例**:
```yaml
# Seata 超时配置
seata:
  client:
    tm:
      commit-retry-count: 3              # 提交重试次数
      rollback-retry-count: 3            # 回滚重试次数
      default-global-transaction-timeout: 30000  # 全局事务默认超时 30 秒
    rm:
      lock:
        retry-interval: 10               # 获取全局锁重试间隔
        retry-times: 30                  # 获取全局锁重试次数
      async-commit-buffer-limit: 10000
      report-retry-count: 5
```
```java
// 关键事务指定超时时间
@GlobalTransactional(
    name = "payment-tx",
    rollbackFor = Exception.class,
    timeoutMills = 60000                    # 支付场景允许 60 秒
)
public PaymentResult pay(PayRequest request) {
    // ...
}
```
**反例**:
```yaml
# 全局事务超时设置过长
seata:
  client:
    tm:
      default-global-transaction-timeout: 300000  # 5 分钟超时太长

# 问题：
# 1. 全局锁被占用 5 分钟，其他事务等待
# 2. 数据库连接长时间不释放
# 3. 用户等待时间过长
```

### R7: 补偿机制设计
**级别**: 推荐
**描述**: 对于无法使用 Seata 自动补偿的场景（如调用第三方 API），设计手动补偿机制。记录操作日志，定时任务检查未完成操作并执行补偿。
**正例**:
```java
// 补偿操作记录表
@Data
@TableName("compensation_log")
public class CompensationLog {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String bizType;              // 业务类型
    private String bizId;                // 业务ID
    private Integer status;              // 0-待补偿 1-已补偿 2-已取消
    private Integer retryCount;
    private Integer maxRetry;
    private String operation;            // 操作描述
    private String requestData;          // 请求参数
    private LocalDateTime nextRetryTime;
    private LocalDateTime createTime;
}

// 在 TCC Cancel 中实现补偿
@Override
@Transactional(rollbackFor = Exception.class)
public boolean cancel(BusinessActionContext context) {
    Long userId = (Long) context.getActionContext("userId");
    BigDecimal amount = new BigDecimal(context.getActionContext("amount").toString());

    // 幂等检查
    FreezeRecord record = freezeRecordMapper
        .selectByUserAndStatus(userId, "FROZEN");
    if (record == null) {
        log.info("冻结记录已处理，无需补偿, userId={}", userId);
        return true;
    }

    // 执行补偿：解冻
    accountMapper.unfreezeBalance(userId, amount);
    record.setStatus("CANCELLED");
    freezeRecordMapper.updateById(record);
    return true;
}

// 定时任务补偿未完成的事务
@Component
@RequiredArgsConstructor
@Slf4j
public class CompensationTask {

    private final CompensationLogMapper compensationLogMapper;

    @Scheduled(fixedDelay = 60000)
    public void compensate() {
        List<CompensationLog> pendingLogs = compensationLogMapper
            .selectPendingLogs(LocalDateTime.now());

        for (CompensationLog log : pendingLogs) {
            try {
                executeCompensation(log);
                log.setStatus(1);
            } catch (Exception e) {
                log.setRetryCount(log.getRetryCount() + 1);
                if (log.getRetryCount() >= log.getMaxRetry()) {
                    log.setStatus(2);
                    this.log.error("补偿失败超过最大次数, id={}", log.getId(), e);
                    alertService.alert("分布式事务补偿失败", log);
                } else {
                    log.setNextRetryTime(LocalDateTime.now()
                        .plusMinutes((long) Math.pow(2, log.getRetryCount())));
                }
            }
            compensationLogMapper.updateById(log);
        }
    }
}
```
**反例**:
```java
// 没有补偿机制，事务失败后数据永久不一致
@GlobalTransactional(name = "order-tx", rollbackFor = Exception.class)
public Long createOrder(OrderCreateDTO dto) {
    orderMapper.insert(order);
    productClient.deductStock(...);
    // 调用第三方短信 API（不受 Seata 管控）
    smsClient.sendNotification(...);    // 失败了但无法回滚短信
}

// Cancel 方法没有幂等处理
@Override
public boolean cancel(BusinessActionContext context) {
    // 没有检查状态直接执行，可能重复补偿
    accountMapper.unfreezeBalance(userId, amount);
    return true;
}
```

### R8: 避免长事务
**级别**: 必须
**描述**: 全局事务应尽量短小，避免在事务中执行耗时操作（如外部 HTTP 调用、文件上传、复杂计算）。长事务会长时间占用全局锁和数据库连接，严重影响系统吞吐量。
**正例**:
```java
// 正确：事务内只做必要的数据库操作和 RPC 调用
@GlobalTransactional(
    name = "order-tx",
    rollbackFor = Exception.class,
    timeoutMills = 30000
)
public Long createOrder(OrderCreateDTO dto) {
    // 快速操作：插入订单
    Order order = Order.create(dto);
    orderMapper.insert(order);

    // 快速操作：扣库存（RPC）
    productClient.deductStock(dto.getProductId(), dto.getQuantity());

    // 快速操作：扣余额（RPC）
    accountClient.deductBalance(dto.getUserId(), dto.getTotalAmount());

    return order.getId();
    // 事务外处理：发短信、发 MQ 消息、记录操作日志
}

// 非事务操作在事务提交后执行
@Service
@RequiredArgsConstructor
public class OrderApplicationService {

    @Autowired
    private OrderTxService orderTxService;

    private final ApplicationEventPublisher eventPublisher;

    public Long createOrder(OrderCreateDTO dto) {
        // 事务操作
        Long orderId = orderTxService.createOrderInTx(dto);

        // 事务外操作——通过事件机制异步处理
        eventPublisher.publishEvent(new OrderCreatedEvent(orderId));
        return orderId;
    }
}

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedEventListener {

    private final SmsService smsService;
    private final MQProducer mqProducer;

    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        // 异步发送短信
        smsService.sendOrderNotification(event.getOrderId());
        // 异步发送 MQ 消息
        mqProducer.sendOrderCreatedMessage(event.getOrderId());
    }
}
```
**反例**:
```java
// 在全局事务中执行大量耗时操作
@GlobalTransactional(name = "order-tx", rollbackFor = Exception.class)
public Long createOrder(OrderCreateDTO dto) {
    orderMapper.insert(order);
    productClient.deductStock(...);
    accountClient.deductBalance(...);

    // 在事务内发送邮件（耗时 2-5 秒）
    emailService.sendHtmlEmail(...);

    // 在事务内生成报表（耗时 5-10 秒）
    reportService.generateOrderReport(orderId);

    // 在事务内上传文件到 OSS（耗时 3-8 秒）
    ossService.uploadOrderAttachment(...);

    // 总事务时间：20-40 秒，全局锁被占用导致其他事务等待
    return orderId;
}
```