# Spring Cloud - 微服务设计规范

## 适用范围
- 适用于所有基于 Spring Cloud 的微服务架构设计与拆分
- 与服务注册与发现、网关设计、配置中心规范配合使用
- 微服务拆分、服务间通信、分布式事务等核心架构决策必须遵循

## 规则

### R1: 按业务域拆分微服务（DDD 限界上下文）
**级别**: 必须
**描述**: 微服务按业务域（Domain）拆分，每个服务对应 DDD 中的一个限界上下文（Bounded Context），而非按技术层或数据表拆分。限界上下文内的领域模型应高内聚，跨上下文通过接口契约通信。
**正例**:
```
# 按业务域拆分，每个服务对应一个限界上下文
user-service/         # 用户域：注册、认证、权限
order-service/        # 订单域：下单、支付、退款
product-service/      # 商品域：上架、库存、分类
logistics-service/    # 物流域：发货、配送、签收
```
```java
// order-service 内部按领域分层（高内聚）
com.example.order/
├── domain/           # 领域模型、领域服务、仓储接口
│   ├── model/
│   │   ├── Order.java
│   │   └── OrderItem.java
│   ├── service/
│   │   └── OrderDomainService.java
│   └── repository/
│       └── OrderRepository.java
├── application/      # 应用服务（编排）
│   └── OrderApplicationService.java
├── infrastructure/   # 基础设施（实现）
│   ├── persistence/
│   │   └── OrderRepositoryImpl.java
│   └── mq/
│       └── OrderMessageProducer.java
└── interfaces/       # 接口层（Controller / Feign Client）
    ├── controller/
    │   └── OrderController.java
    └── client/
        └── OrderFeignClient.java
```
**反例**:
```
# 按技术层拆分（错误）
api-gateway/          # 所有接口聚合在一起
service-layer/        # 所有业务逻辑在一起
dao-layer/            # 所有数据访问在一起

# 按数据表拆分（错误）
t-user-service/       # 对应 t_user 表
t-order-service/      # 对应 t_order 表
t-order-item-service/ # 对应 t_order_item 表（拆分过细）
```

### R2: 服务间通信优先使用 Feign 声明式调用
**级别**: 必须
**描述**: 服务间同步调用优先使用 OpenFeign 声明式客户端，定义明确的接口契约，避免硬编码 URL 和手动构建 HTTP 请求。
**正例**:
```java
// 1. 定义 Feign 接口（契约）
@FeignClient(
    name = "user-service",
    path = "/api/users",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {

    @GetMapping("/{id}")
    Result<UserDTO> getById(@PathVariable("id") Long id);

    @GetMapping("/batch")
    Result<List<UserDTO>> listByIds(@RequestParam("ids") List<Long> ids);
}

// 2. Fallback 工厂
@Component
@Slf4j
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {

    @Override
    public UserClient create(Throwable cause) {
        log.error("user-service 调用失败", cause);
        return new UserClient() {
            @Override
            public Result<UserDTO> getById(Long id) {
                return Result.fail(503, "用户服务不可用");
            }

            @Override
            public Result<List<UserDTO>> listByIds(List<Long> ids) {
                return Result.fail(503, "用户服务不可用");
            }
        };
    }
}

// 3. 在订单服务中使用
@Service
@RequiredArgsConstructor
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final UserClient userClient;

    public OrderDetailVO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId);
        Result<UserDTO> userResult = userClient.getById(order.getUserId());
        return OrderDetailVO.of(order, userResult.getData());
    }
}
```
**反例**:
```java
// 硬编码 URL + 手动构建请求
@Service
public class OrderService {

    private final RestTemplate restTemplate;

    public OrderDetailVO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId);
        // 硬编码地址，无法感知服务上下线
        String url = "http://192.168.1.100:8081/api/users/" + order.getUserId();
        UserDTO user = restTemplate.getForObject(url, UserDTO.class);
        return OrderDetailVO.of(order, user);
    }
}

// 使用 WebClient 但没有统一契约
@Service
public class OrderService {

    public OrderDetailVO getOrderDetail(Long orderId) {
        // 每次调用都需要手动拼装
        UserDTO user = webClient.get()
            .uri("http://user-service/api/users/{id}", userId)
            .retrieve()
            .bodyToMono(UserDTO.class)
            .block();
    }
}
```

### R3: 服务粒度控制——避免过细或过粗
**级别**: 推荐
**描述**: 单个微服务的代码量建议控制在 1万~5万行，团队人数 2~8 人负责一个服务。过细拆分导致运维成本激增，过粗则失去微服务意义。遵循"可独立部署、可独立替换、业务高内聚"三个标准。
**正例**:
```
# 合理粒度：订单服务包含订单核心 + 订单项 + 订单日志
order-service/                # 约 3 万行代码
├── order-core               # 订单核心（创建、取消、完成）
├── order-item               # 订单项（商品明细）
└── order-log                # 订单操作日志

# 合并原因：订单项和订单日志与订单生命周期强绑定，
# 无需独立部署，避免分布式事务
```
```yaml
# 单个服务的 pom.xml 依赖合理，模块精简
# 一个服务一般包含：web、数据访问、缓存、MQ、Feign Client
```
**反例**:
```
# 拆分过细：每张表一个服务，服务间调用链路长
order-service/           # 只有 t_order
order-item-service/      # 只有 t_order_item
order-log-service/       # 只有 t_order_log
order-status-service/    # 只有订单状态流转
# 创建一笔订单需要调用 4 个服务，产生分布式事务

# 拆分过粗：单体应用伪装成微服务
business-service/        # 包含用户、订单、商品、支付、物流
```

### R4: API 网关作为统一入口
**级别**: 必须
**描述**: 所有外部请求必须通过 API 网关统一进入，后端服务不直接对外暴露端口。网关负责路由转发、鉴权、限流、日志等横切关注点。
**正例**:
```yaml
# 网关路由配置——所有请求经过网关
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=0

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=0
```
```yaml
# K8s Service——后端服务仅集群内可达
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  type: ClusterIP          # 仅集群内部访问，不对外暴露
  ports:
    - port: 8081
      targetPort: 8081
  selector:
    app: user-service

---
# 网关对外暴露
apiVersion: v1
kind: Service
metadata:
  name: gateway
spec:
  type: LoadBalancer       # 对外暴露
  ports:
    - port: 80
      targetPort: 8080
```
**反例**:
```yaml
# 后端服务直接对外暴露端口
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  type: LoadBalancer       # 不应该直接对外
  ports:
    - port: 80
      targetPort: 8081
```
```java
// 前端直接调用后端各服务地址
// 前端配置：API_USER=http://user.example.com
// 前端配置：API_ORDER=http://order.example.com
// 问题：鉴权逻辑散落各服务，无法统一限流和监控
```

### R5: 分布式链路追踪（Sleuth + Zipkin）
**级别**: 推荐
**描述**: 微服务架构下必须接入分布式链路追踪，记录请求在多个服务间的调用链路，便于排查性能瓶颈和故障定位。
**正例**:
```yaml
# 各服务统一配置链路追踪
spring:
  sleuth:
    sampler:
      probability: 1.0     # 生产环境可降低采样率，如 0.1
  zipkin:
    base-url: http://zipkin:9411
    sender:
      type: web
```
```java
// 关键业务方法添加手动 Span
@Service
@RequiredArgsConstructor
public class OrderService {

    private final Tracer tracer;

    public Order createOrder(OrderCreateDTO dto) {
        Span span = tracer.nextSpan().name("create-order-validate").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span.start())) {
            // 校验逻辑
            validateOrder(dto);
        } finally {
            span.end();
        }
        return orderRepository.save(Order.create(dto));
    }
}
```
```yaml
# 日志格式包含 traceId 和 spanId
logging:
  pattern:
    level: "%5p [${spring.application.name},%X{traceId},%X{spanId}]"
```
**反例**:
```yaml
# 没有链路追踪配置
# 排查问题时只能在各服务日志中手动搜索
# 日志格式不含 traceId
logging:
  pattern:
    level: "%5p %d{yyyy-MM-dd HH:mm:ss}"
```
```java
// 手动传递 requestId，缺乏标准化
@GetMapping("/orders/{id}")
public Result<OrderVO> getOrder(@PathVariable Long id,
                                @RequestHeader("X-Request-Id") String requestId) {
    MDC.put("requestId", requestId);
    // 手动在每次 Feign 调用时传递 requestId
    // 容易遗漏，无法自动串联调用链
}
```

### R6: 服务间禁止共享数据库
**级别**: 必须
**描述**: 每个微服务拥有独立的数据库实例或 Schema，禁止跨服务直接访问数据库表。需要其他服务的数据时通过 API/Feign 调用获取，保证服务自治和数据封装。
**正例**:
```
# 每个服务独立数据库
user-service    -> db_user     (user, role, permission)
order-service   -> db_order    (orders, order_item, order_log)
product-service -> db_product  (product, category, inventory)
```
```java
// 订单服务需要用户信息，通过 Feign 调用用户服务
@Service
@RequiredArgsConstructor
public class OrderQueryService {

    private final UserClient userClient;
    private final OrderRepository orderRepository;

    public OrderDetailVO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId);
        // 通过 API 获取用户数据，而非直接查用户数据库
        Result<UserDTO> userResult = userClient.getById(order.getUserId());
        return OrderDetailVO.of(order, userResult.getData());
    }
}
```
**反例**:
```java
// 订单服务直接连接用户数据库查询
@Service
public class OrderQueryService {

    @Autowired
    @Qualifier("userJdbcTemplate")    // 直接注入用户库数据源
    private JdbcTemplate userJdbcTemplate;

    public OrderDetailVO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId);
        // 直接跨库查询——强耦合，用户表结构变更会导致订单服务报错
        String sql = "SELECT username, phone FROM t_user WHERE id = ?";
        Map<String, Object> user = userJdbcTemplate.queryForMap(sql, order.getUserId());
        return OrderDetailVO.of(order, user);
    }
}
```

### R7: 跨服务事务使用最终一致性（MQ + 本地消息表）
**级别**: 必须
**描述**: 微服务间禁止使用强一致性的分布式事务（如两阶段提交），采用基于消息队列 + 本地消息表的最终一致性方案。保证本地事务与消息发送的原子性。
**正例**:
```java
// 1. 本地消息表实体
@Data
@TableName("local_message")
public class LocalMessage {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String topic;
    private String messageKey;
    private String messageBody;
    private Integer status;      // 0-待发送 1-已发送 2-已消费 3-失败
    private Integer retryCount;
    private LocalDateTime createTime;
}

// 2. 业务操作与消息写入在同一个本地事务中
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final LocalMessageRepository messageRepository;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderCreateDTO dto) {
        // 业务操作
        Order order = Order.create(dto);
        orderRepository.save(order);

        // 同一事务写入本地消息表
        LocalMessage message = new LocalMessage();
        message.setTopic("order-created");
        message.setMessageKey(String.valueOf(order.getId()));
        message.setMessageBody(JsonUtils.toJson(order));
        message.setStatus(0);
        messageRepository.save(message);
    }
}

// 3. 定时任务扫描待发送消息
@Component
@RequiredArgsConstructor
@Slf4j
public class MessageCompensateTask {

    private final LocalMessageRepository messageRepository;
    private final RocketMQTemplate rocketMQTemplate;

    @Scheduled(fixedDelay = 5000)
    public void compensate() {
        List<LocalMessage> messages = messageRepository.findPendingMessages(10);
        for (LocalMessage msg : messages) {
            try {
                rocketMQTemplate.convertAndSend(msg.getTopic(), msg.getMessageBody());
                msg.setStatus(1);
                messageRepository.updateById(msg);
            } catch (Exception e) {
                msg.setRetryCount(msg.getRetryCount() + 1);
                if (msg.getRetryCount() > 5) {
                    msg.setStatus(3);
                    log.error("消息发送失败, msgId={}", msg.getId(), e);
                }
                messageRepository.updateById(msg);
            }
        }
    }
}
```
**反例**:
```java
// 直接在业务方法中发消息，本地事务回滚但消息已发出
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RocketMQTemplate rocketMQTemplate;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderCreateDTO dto) {
        Order order = Order.create(dto);
        orderRepository.save(order);
        // 事务未提交就发消息——如果后续回滚，消息已发出无法撤回
        rocketMQTemplate.convertAndSend("order-created", order);
        // 若此处抛异常，事务回滚但消息已被消费
    }
}
```

### R8: 服务降级与熔断设计
**级别**: 必须
**描述**: 每个服务间调用必须配置降级策略和熔断机制，当下游服务不可用时快速失败并返回兜底结果，防止级联故障导致雪崩。
**正例**:
```java
// Feign 客户端配置降级工厂
@FeignClient(
    name = "product-service",
    fallbackFactory = ProductClientFallbackFactory.class
)
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    Result<ProductDTO> getById(@PathVariable("id") Long id);

    @GetMapping("/api/products/batch")
    Result<List<ProductDTO>> listByIds(@RequestParam("ids") List<Long> ids);
}

// 降级工厂：记录异常原因并返回兜底数据
@Component
@Slf4j
public class ProductClientFallbackFactory implements FallbackFactory<ProductClient> {

    @Override
    public ProductClient create(Throwable cause) {
        log.error("product-service 调用降级, reason={}", cause.getMessage());
        return new ProductClient() {
            @Override
            public Result<ProductDTO> getById(Long id) {
                // 返回兜底数据或友好提示
                return Result.fail(503, "商品服务暂时不可用，请稍后重试");
            }

            @Override
            public Result<List<ProductDTO>> listByIds(List<Long> ids) {
                return Result.success(Collections.emptyList());
            }
        };
    }
}
```
```yaml
# Feign 超时与 Sentinel 熔断配置
feign:
  sentinel:
    enabled: true
  client:
    config:
      default:
        connectTimeout: 3000
        readTimeout: 5000
```
**反例**:
```java
// Feign 客户端没有降级配置
@FeignClient(name = "product-service")    // 缺少 fallbackFactory
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    Result<ProductDTO> getById(@PathVariable("id") Long id);
    // product-service 宕机时，调用线程被阻塞直到超时，
    // 大量请求堆积导致线程池耗尽，引发级联故障
}
```

### R9: API 文档聚合到网关
**级别**: 推荐
**描述**: 各微服务的 Swagger/OpenAPI 文档通过网关聚合，提供统一的文档入口，前端和测试人员无需分别访问各服务的文档地址。
**正例**:
```yaml
# 网关服务配置 Swagger 聚合
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
```
```java
// 网关服务添加 Swagger 聚合配置
@Configuration
public class SwaggerProvider {

    @Autowired
    private RouteLocator routeLocator;

    public List<SwaggerResource> get() {
        List<SwaggerResource> resources = new ArrayList<>();
        routeLocator.getRoutes()
            .filter(route -> route.getUri().getHost() != null)
            .subscribe(route -> {
                String name = route.getUri().getHost();
                SwaggerResource resource = new SwaggerResource();
                resource.setName(name);
                resource.setUrl("/" + name + "/v3/api-docs");
                resources.add(resource);
            });
        return resources;
    }
}
```
```java
// 各微服务统一添加 OpenAPI 配置
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("用户服务 API")
                .version("1.0"));
    }
}
```
**反例**:
```
# 各服务文档地址分散，前端需维护多个文档地址
user-service:    http://user.example.com:8081/swagger-ui.html
order-service:   http://order.example.com:8082/swagger-ui.html
product-service: http://product.example.com:8083/swagger-ui.html
# 后续新增服务需通知所有前端同学新地址
```

### R10: 微服务统一异常处理与错误码规范
**级别**: 推荐
**描述**: 各微服务采用统一的错误码体系和异常处理机制，错误码由"服务标识 + 错误编号"组成，便于在链路追踪中快速定位问题服务。
**正例**:
```java
// 统一错误码定义——各服务各自维护，格式统一
public enum ErrorCode {
    // 格式：服务名缩写(2位) + 模块(2位) + 序号(3位)
    USER_NOT_FOUND("U01001", "用户不存在"),
    USER_ALREADY_EXISTS("U01002", "用户已存在"),
    ORDER_NOT_FOUND("O01001", "订单不存在"),
    ORDER_STATUS_INVALID("O02001", "订单状态不合法"),
    PRODUCT_STOCK_INSUFFICIENT("P02001", "商品库存不足");

    private final String code;
    private final String message;
}

// 各服务统一全局异常处理
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: code={}, msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail("SYS0001", "系统繁忙，请稍后重试");
    }
}
```
**反例**:
```java
// 各服务错误码无规律，难以定位来源
public enum ErrorCode {
    NOT_FOUND("404", "资源不存在"),              // 无法区分哪个服务
    PARAM_ERROR("400", "参数错误"),
    ORDER_ERROR("1001", "订单异常");             // 与其他服务编号冲突
}

// 没有统一异常处理，各 Controller 自行 try-catch
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {
    try {
        return Result.success(userService.getById(id));
    } catch (Exception e) {
        return Result.fail("9999", e.getMessage());  // 暴露内部信息
    }
}
```