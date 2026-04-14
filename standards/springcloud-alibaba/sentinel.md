# Spring Cloud Alibaba - Sentinel 限流降级规范

## 适用范围
- 适用于所有 Spring Cloud Alibaba 微服务的限流、熔断、降级策略
- 与微服务设计规范、网关设计规范配合使用
- 涵盖流控规则、降级规则、热点参数限流、系统保护、规则持久化等场景

## 规则

### R1: 流控规则（QPS / 线程数）
**级别**: 必须
**描述**: 关键接口必须配置 QPS 流控或线程数流控。QPS 流控适用于可预估吞吐量的接口，线程数流控适用于处理时间不确定的接口。
**正例**:
```java
// 方式一：代码定义流控规则
@PostConstruct
public void initFlowRules() {
    List<FlowRule> rules = new ArrayList<>();

    // QPS 流控——限制每秒请求数
    FlowRule orderCreateRule = new FlowRule();
    orderCreateRule.setResource("order-create");
    orderCreateRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    orderCreateRule.setCount(100);            // 每秒最多 100 个请求
    orderCreateRule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);
    orderCreateRule.setWarmUpPeriodSec(10);   // 预热 10 秒
    rules.add(orderCreateRule);

    // 线程数流控——限制并发处理线程数
    FlowRule paymentRule = new FlowRule();
    paymentRule.setResource("payment-process");
    paymentRule.setGrade(RuleConstant.FLOW_GRADE_THREAD);
    paymentRule.setCount(20);                 // 最多 20 个并发线程
    rules.add(paymentRule);

    FlowRuleManager.loadRules(rules);
}
```
```java
// 方式二：@SentinelResource 注解
@Service
public class OrderService {

    @SentinelResource(
        value = "order-create",
        blockHandler = "createOrderBlock",
        fallback = "createOrderFallback"
    )
    public Order createOrder(OrderCreateDTO dto) {
        return orderRepository.save(Order.create(dto));
    }

    // 限流处理
    public Order createOrderBlock(OrderCreateDTO dto, BlockException ex) {
        throw new BusinessException(429, "订单创建繁忙，请稍后重试");
    }

    // 异常降级处理
    public Order createOrderFallback(OrderCreateDTO dto, Throwable ex) {
        log.error("创建订单异常", ex);
        throw new BusinessException(500, "创建订单失败");
    }
}
```
**反例**:
```java
// 接口无任何限流保护
@PostMapping("/orders")
public Result<Long> createOrder(@RequestBody OrderCreateDTO dto) {
    // 促销活动时大量请求涌入，直接打垮数据库
    return Result.success(orderService.createOrder(dto));
}

// 手动实现限流——不精确，无法动态调整
@Service
public class OrderService {

    private final AtomicLong counter = new AtomicLong(0);

    public Order createOrder(OrderCreateDTO dto) {
        if (counter.incrementAndGet() > 100) {   // 粗糙的限流
            throw new BusinessException(429, "限流");
        }
        // 问题：不是滑动窗口，每秒重置不可靠
    }
}
```

### R2: 降级规则（慢调用比例 / 异常比例）
**级别**: 必须
**描述**: 对依赖外部服务（RPC、数据库、第三方 API）的接口配置降级规则，当慢调用比例或异常比例超过阈值时触发熔断，快速失败。
**正例**:
```java
// 降级规则配置
@PostConstruct
public void initDegradeRules() {
    List<DegradeRule> rules = new ArrayList<>();

    // 慢调用比例降级
    DegradeRule slowCallRule = new DegradeRule("payment-process");
    slowCallRule.setGrade(CircuitBreakerStrategy.SLOW_REQUEST_RATIO.getType());
    slowCallRule.setCount(3000);               // 慢调用阈值：3 秒
    slowCallRule.setSlowRatioThreshold(0.5);   // 慢调用比例阈值：50%
    slowCallRule.setTimeWindow(30);            // 熔断持续时间：30 秒
    slowCallRule.setMinRequestAmount(10);       // 最小请求数：10
    slowCallRule.setStatIntervalMs(10000);      // 统计时间窗口：10 秒
    rules.add(slowCallRule);

    // 异常比例降级
    DegradeRule errorRatioRule = new DegradeRule("user-query");
    errorRatioRule.setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType());
    errorRatioRule.setCount(0.3);              // 异常比例阈值：30%
    errorRatioRule.setTimeWindow(30);           // 熔断持续时间：30 秒
    errorRatioRule.setMinRequestAmount(5);      // 最小请求数：5
    errorRatioRule.setStatIntervalMs(10000);    // 统计时间窗口：10 秒
    rules.add(errorRatioRule);

    DegradeRuleManager.loadRules(rules);
}
```
**反例**:
```java
// 没有降级规则，下游服务变慢时线程池被阻塞
@Service
public class OrderService {

    public OrderVO getOrder(Long orderId) {
        // 如果 user-service 变慢，所有调用线程被阻塞
        UserDTO user = userClient.getById(order.getUserId());  // 无超时无降级
        // 如果 product-service 异常，异常直接抛给用户
        ProductDTO product = productClient.getById(order.getProductId());
        return OrderVO.of(order, user, product);
    }
}
```

### R3: 热点参数限流 @SentinelResource
**级别**: 推荐
**描述**: 针对热点数据进行参数级别限流，如对某个热门商品 ID 限流，其他商品不受影响。使用 @SentinelResource 配合 ParamFlowRule 实现。
**正例**:
```java
// 热点参数限流注解
@Service
public class ProductService {

    @SentinelResource(
        value = "product-detail",
        blockHandler = "getProductDetailBlock"
    )
    public ProductVO getProductDetail(
            @RequestParam Long productId,     # 第 0 个参数
            @RequestParam Long userId) {
        return productRepository.findDetailById(productId);
    }

    public ProductVO getProductDetailBlock(Long productId, Long userId,
                                            BlockException ex) {
        // 返回简化版商品信息（从缓存获取）
        return productCacheService.getSimpleProduct(productId);
    }
}
```
```java
// 热点参数限流规则
@PostConstruct
public void initParamFlowRules() {
    ParamFlowRule rule = new ParamFlowRule("product-detail");
    rule.setParamIdx(0);                          // 对第 0 个参数（productId）限流
    rule.setCount(50);                            # 默认每秒 50
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);

    // 特定热点参数单独设置阈值
    ParamFlowItem hotItem = new ParamFlowItem();
    hotItem.setObject("10001");                   // 商品 ID=10001 是爆款
    hotItem.setClassType(long.class.getName());
    hotItem.setCount(200);                        // 爆款商品允许更高 QPS
    rule.setParamFlowItemList(List.of(hotItem));

    ParamFlowRuleManager.loadRules(List.of(rule));
}
```
**反例**:
```java
// 对整个接口限流，不区分参数
@SentinelResource(value = "product-detail")
public ProductVO getProductDetail(Long productId) {
    // 爆款商品和冷门商品限流阈值相同
    // 爆款商品被限流，冷门商品反而占用配额
}

// 不使用热点参数限流，为每个商品 ID 手动配置流控规则
// 商品数万种，无法手动逐个配置
```

### R4: 系统保护规则
**级别**: 推荐
**描述**: 配置系统级别的保护规则，从整体维度（Load、CPU 使用率、RT、线程数、入口 QPS）保护应用，防止系统过载崩溃。
**正例**:
```java
// 系统保护规则
@PostConstruct
public void initSystemRules() {
    List<SystemRule> rules = new ArrayList<>();

    // 系统 Load 保护（仅 Linux 生效）
    SystemRule loadRule = new SystemRule();
    loadRule.setHighestSystemLoad(4.0);           // 系统 Load 不超过 4
    rules.add(loadRule);

    // CPU 使用率保护
    SystemRule cpuRule = new SystemRule();
    cpuRule.setHighestCpuUsage(0.8);              // CPU 使用率不超过 80%
    rules.add(cpuRule);

    // 平均 RT 保护
    SystemRule rtRule = new SystemRule();
    rtRule.setAvgRt(1000);                        // 入口平均 RT 不超过 1 秒
    rules.add(rtRule);

    // 并发线程数保护
    SystemRule threadRule = new SystemRule();
    threadRule.setMaxThread(200);                  // 并发线程不超过 200
    rules.add(threadRule);

    // 入口 QPS 保护
    SystemRule qpsRule = new SystemRule();
    qpsRule.setQps(500);                          // 入口总 QPS 不超过 500
    rules.add(qpsRule);

    SystemRuleManager.loadRules(rules);
}
```
**反例**:
```java
// 没有系统级保护，流量突增时整个应用崩溃
// CPU 100%、OOM、线程耗尽

// 只配置接口级限流，忽略系统整体负载
// 单个接口限流没问题，但所有接口流量叠加后系统过载
```

### R5: blockHandler 与 fallback 区分使用
**级别**: 必须
**描述**: blockHandler 处理限流/熔断触发的情况（BlockException），fallback 处理业务异常（Throwable）。两者职责不同，必须分别实现。
**正例**:
```java
@Service
@Slf4j
public class OrderService {

    @SentinelResource(
        value = "order-create",
        blockHandler = "createOrderBlock",         // 限流/熔断时的处理
        fallback = "createOrderFallback"            // 业务异常时的处理
    )
    public Order createOrder(OrderCreateDTO dto) {
        // 业务逻辑，可能抛出 BusinessException
        validateOrder(dto);
        return orderRepository.save(Order.create(dto));
    }

    // blockHandler——限流/熔断时触发（参数末尾加 BlockException）
    public Order createOrderBlock(OrderCreateDTO dto, BlockException ex) {
        log.warn("订单创建被限流, rule={}", ex.getRule());
        // 返回友好提示，不抛异常
        throw new BusinessException(429, "系统繁忙，请稍后重试");
    }

    // fallback——业务异常时触发（参数末尾加 Throwable）
    public Order createOrderFallback(OrderCreateDTO dto, Throwable ex) {
        log.error("订单创建异常", ex);
        if (ex instanceof BusinessException) {
            throw (BusinessException) ex;           // 业务异常直接抛出
        }
        throw new BusinessException(500, "创建订单失败");
    }
}
```
**反例**:
```java
// blockHandler 和 fallback 混用
@SentinelResource(
    value = "order-create",
    blockHandler = "createOrderBlock",
    fallback = "createOrderFallback"
)
public Order createOrder(OrderCreateDTO dto) { ... }

// blockHandler 中处理了业务异常（职责混乱）
public Order createOrderBlock(OrderCreateDTO dto, BlockException ex) {
    if (ex instanceof DegradeException) {
        // 这里不应该处理业务逻辑
        return new Order();           // 返回空对象掩盖问题
    }
    throw new BusinessException(429, "限流");
}

// 没有 blockHandler，限流时直接抛出 BlockException 给用户
@SentinelResource(value = "order-create")  // 没有 blockHandler
public Order createOrder(OrderCreateDTO dto) { ... }
// 用户看到：{"code":500,"message":"com.alibaba.csp.sentinel.slots.block.flow.FlowException"}
```

### R6: Dashboard 规则持久化到 Nacos
**级别**: 必须
**描述**: Sentinel Dashboard 中配置的规则默认存储在内存中，服务重启后丢失。生产环境必须将规则持久化到 Nacos（或 Apollo/Zookeeper），实现规则的可视化管理和持久化。
**正例**:
```yaml
# Sentinel 规则持久化到 Nacos
spring:
  cloud:
    sentinel:
      transport:
        dashboard: sentinel-dashboard:8080
      datasource:
        flow:                                # 流控规则
          nacos:
            server-addr: ${NACOS_ADDR}
            namespace: ${NACOS_NAMESPACE}
            group-id: SENTINEL_GROUP
            data-id: ${spring.application.name}-flow-rules
            rule-type: flow
        degrade:                             # 降级规则
          nacos:
            server-addr: ${NACOS_ADDR}
            namespace: ${NACOS_NAMESPACE}
            group-id: SENTINEL_GROUP
            data-id: ${spring.application.name}-degrade-rules
            rule-type: degrade
        param-flow:                          # 热点参数限流规则
          nacos:
            server-addr: ${NACOS_ADDR}
            namespace: ${NACOS_NAMESPACE}
            group-id: SENTINEL_GROUP
            data-id: ${spring.application.name}-param-flow-rules
            rule-type: param-flow
        system:                              # 系统保护规则
          nacos:
            server-addr: ${NACOS_ADDR}
            namespace: ${NACOS_NAMESPACE}
            group-id: SENTINEL_GROUP
            data-id: ${spring.application.name}-system-rules
            rule-type: system
```
```json
// Nacos 中的规则数据（user-service-flow-rules）
[
  {
    "resource": "order-create",
    "grade": 1,
    "count": 100,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```
**反例**:
```yaml
# 不配置持久化，规则只存在内存中
spring:
  cloud:
    sentinel:
      transport:
        dashboard: sentinel-dashboard:8080
      # 没有 datasource 配置
      # 服务重启后所有规则丢失
      # 每次 JVM 重启都需要重新配置规则
```

### R7: 流控模式（直接 / 关联 / 链路）
**级别**: 推荐
**描述**: 根据业务场景选择合适的流控模式。直接模式限流自身，关联模式保护关联资源，链路模式控制入口流量。
**正例**:
```java
// 直接模式——限制自身 QPS（默认模式）
FlowRule directRule = new FlowRule("order-create");
directRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
directRule.setCount(100);
directRule.setStrategy(RuleConstant.STRATEGY_DIRECT);      // 直接模式

// 关联模式——写操作繁忙时限流读操作，保护写入
FlowRule relateRule = new FlowRule("order-query");          // 限流 order-query
relateRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
relateRule.setCount(50);
relateRule.setStrategy(RuleConstant.STRATEGY_RELATE);
relateRule.setRefResource("order-create");                  // 关联 order-create
// 当 order-create QPS > 50 时，触发 order-query 限流

// 链路模式——限制从指定入口进入的流量
FlowRule chainRule = new FlowRule("product-detail");
chainRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
chainRule.setCount(200);
chainRule.setStrategy(RuleConstant.STRATEGY_CHAIN);
chainRule.setRefResource("gateway-entry");                  // 仅限制网关入口
```
**反例**:
```java
// 所有场景都用直接模式，无法实现精细控制
// 例如：写操作繁忙时应该限流读操作，但直接模式只能限流自身

// 关联模式配置反了
FlowRule wrongRule = new FlowRule("order-create");          // 限流了写操作
wrongRule.setRefResource("order-query");                     // 关联了读操作
// 读操作繁忙时限流写操作——逻辑反了
```

### R8: 流控效果（快速失败 / 排队等待 / 预热）
**级别**: 推荐
**描述**: 根据场景选择合适的流控效果。快速失败适用于大多数接口，排队等待适用于突发流量削峰，预热适用于冷启动场景。
**正例**:
```java
// 快速失败（默认）——超出阈值直接拒绝
FlowRule fastFailRule = new FlowRule("user-query");
fastFailRule.setCount(100);
fastFailRule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);

// 排队等待——匀速通过，适合消息削峰
FlowRule queueRule = new FlowRule("order-create");
queueRule.setCount(50);
queueRule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER);
queueRule.setMaxQueueingTimeMs(3000);        // 排队最长等待 3 秒

// 预热模式——冷启动，逐步增加流量
FlowRule warmUpRule = new FlowRule("search-service");
warmUpRule.setCount(200);
warmUpRule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);
warmUpRule.setWarmUpPeriodSec(60);           // 预热 60 秒
// 刚启动时只允许少量请求，60 秒内逐步增加到 200 QPS
```
**反例**:
```java
// 所有接口都用快速失败，突发流量导致大量请求被拒绝
FlowRule rule = new FlowRule("order-create");
rule.setCount(50);
// CONTROL_BEHAVIOR_DEFAULT（快速失败）
// 秒杀场景下，瞬间 500 QPS -> 450 被拒绝
// 应该用排队等待模式匀速处理

// 预热模式配置在不需要预热的接口上
FlowRule warmUpRule = new FlowRule("user-query");
warmUpRule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);
warmUpRule.setWarmUpPeriodSec(300);           // 5 分钟预热太长
// 用户查询接口一直处于低流量状态，不合理
```

### R9: 熔断器状态机（Closed / Open / Half-Open）
**级别**: 推荐
**描述**: 理解熔断器的三个状态及其转换条件。Closed（正常）-> Open（熔断）-> Half-Open（探测）-> Closed/Open，合理配置各阶段参数。
**正例**:
```java
// 熔断器状态转换说明
// Closed -> Open: 统计时间内，慢调用比例/异常比例超过阈值
// Open -> Half-Open: 熔断持续时间结束后
// Half-Open -> Closed: 探测请求成功（恢复正常）
// Half-Open -> Open: 探测请求失败（继续熔断）

DegradeRule rule = new DegradeRule("payment-service");
rule.setGrade(CircuitBreakerStrategy.SLOW_REQUEST_RATIO.getType());
rule.setCount(3000);                         // 慢调用阈值：3 秒
rule.setSlowRatioThreshold(0.6);             // 慢调用比例：60%
rule.setTimeWindow(30);                      // Open 状态持续 30 秒
rule.setMinRequestAmount(10);                // 最少 10 个请求才开始统计
rule.setStatIntervalMs(10000);               // 统计窗口 10 秒
```
```java
// 半开状态探测示例
@SentinelResource(
    value = "payment-service",
    fallback = "payFallback"
)
public PaymentResult pay(PayRequest request) {
    // Half-Open 状态下，Sentinel 会放行少量请求进行探测
    // 如果这些请求成功 -> 状态转为 Closed
    // 如果这些请求失败 -> 状态转为 Open
    return paymentGateway.process(request);
}

public PaymentResult payFallback(PayRequest request, Throwable ex) {
    // Open 状态下直接走降级逻辑
    log.warn("支付服务熔断降级: {}", ex.getMessage());
    return PaymentResult.fail("支付服务暂时不可用，请稍后重试");
}
```
**反例**:
```java
// 熔断时间窗口配置过短，频繁在 Open/Closed 间切换
DegradeRule rule = new DegradeRule("payment-service");
rule.setTimeWindow(5);                       // 仅 5 秒就尝试恢复
// 下游可能还没恢复，反复触发熔断和恢复，造成请求抖动

// 最小请求数配置过小，少量请求就触发熔断
rule.setMinRequestAmount(1);                 // 1 个请求就触发统计
// 第一个请求慢了就直接熔断，过于敏感
```

### R10: 集群限流
**级别**: 建议
**描述**: 当需要精确控制整个集群的总 QPS 时，使用 Sentinel 集群限流模式。集群限流需要一个 Token Server 协调所有节点的流量。
**正例**:
```java
// 集群流控规则——整个集群总 QPS 不超过 100
FlowRule clusterRule = new FlowRule("order-create");
clusterRule.setCount(100);                        # 集群总 QPS
clusterRule.setClusterMode(true);                 # 开启集群限流

// Token Client 配置（每个服务节点）
ClusterClientConfig clientConfig = new ClusterClientConfig();
clientConfig.setRequestTimeout(300);              // 请求 Token Server 超时时间
ClusterClientConfigManager.applyConfig(clientConfig);

// Token Server 地址配置
ClusterClientAssignConfig assignConfig = new ClusterClientAssignConfig();
assignConfig.setServerHost("sentinel-token-server");
assignConfig.setServerPort(18730);
ClusterClientConfigManager.applyNewAssignConfig(assignConfig);
```
```yaml
# YAML 配置集群限流
spring:
  cloud:
    sentinel:
      transport:
        dashboard: sentinel-dashboard:8080
```
**反例**:
```java
// 单机限流无法精确控制集群总流量
// 假设需要集群总 QPS=100，部署了 5 个节点
FlowRule rule = new FlowRule("order-create");
rule.setCount(100);                          // 每个节点 100，集群总 QPS=500
rule.setClusterMode(false);                  // 单机模式

// 手动计算每节点阈值——扩缩容时阈值不自动调整
// 5 个节点：每节点 100/5 = 20
// 扩容到 10 个节点：每节点应该改为 10，但忘记调整
```