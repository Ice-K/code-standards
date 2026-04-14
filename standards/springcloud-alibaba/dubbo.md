# Spring Cloud Alibaba - Dubbo RPC 规范

## 适用范围
- 适用于所有 Spring Cloud Alibaba 微服务中使用 Dubbo 作为 RPC 框架的服务间调用
- 与微服务设计规范、服务注册与发现规范配合使用
- 涵盖协议选型、服务暴露与引用、超时重试、负载均衡、降级策略等场景

## 规则

### R1: 协议选择（dubbo / triple / rest）
**级别**: 推荐
**描述**: 根据场景选择合适的 Dubbo 协议。dubbo 协议基于 TCP 长连接 + Hessian 序列化，性能最高；triple 协议基于 HTTP/2，支持跨语言和流式通信；rest 协议用于兼容 HTTP 客户端。
**正例**:
```yaml
# 内部服务间高性能调用——使用 dubbo 协议（默认）
dubbo:
  protocol:
    name: dubbo                             # TCP + Hessian2，性能最优
    port: 20880                             # 固定端口，-1 为随机端口
    threads: 200                            # 服务线程数
    iothreads: 4                            # IO 线程数

# 需要跨语言或网关直连——使用 triple 协议
dubbo:
  protocol:
    name: triple                            # HTTP/2 + Protobuf
    port: 20881
```
```java
// triple 协议支持流式通信（适用于大数据传输）
public interface FileStreamService {

    // 服务端流——下载文件
    StreamObserver<FileChunk> download(StreamObserver<FileChunk> responseObserver);

    // 双向流——实时通信
    StreamObserver<Message> chat(StreamObserver<Message> responseObserver);
}
```
**反例**:
```yaml
# 所有服务都用 rest 协议，性能最差
dubbo:
  protocol:
    name: rest                              # HTTP + JSON 序列化，性能远不如 dubbo
    port: 8080
    # 内部服务间调用不需要走 HTTP，浪费序列化开销

# 协议和场景不匹配
# dubbo 协议用于需要对外暴露的接口（浏览器/移动端无法直接调用）
# triple 协议用于纯 Java 内部调用（没有跨语言需求，无需 HTTP/2 开销）
```

### R2: @DubboService 服务暴露
**级别**: 必须
**描述**: 服务提供方使用 @DubboService 注解暴露服务，必须指定 version、group、timeout 等核心参数。接口和实现分离，接口单独打包供消费方引用。
**正例**:
```java
// 1. 接口定义（单独 API 模块：user-api）
public interface UserService {

    UserDTO getById(Long id);

    List<UserDTO> listByIds(List<Long> ids);

    boolean updateUser(UserUpdateDTO dto);
}
```
```java
// 2. 接口实现（服务提供方：user-service）
@DubboService(
    version = "1.0.0",                      # 版本号
    group = "user-group",                   # 分组
    timeout = 5000,                         # 超时 5 秒
    retries = 0,                            # 不重试（非幂等操作）
    loadbalance = "roundrobin",             # 负载均衡策略
    token = "user-service-token"            # 令牌验证
)
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    public UserDTO getById(Long id) {
        User user = userMapper.selectById(id);
        return UserConvertor.toDTO(user);
    }

    @Override
    public List<UserDTO> listByIds(List<Long> ids) {
        return userMapper.selectBatchIds(ids).stream()
            .map(UserConvertor::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public boolean updateUser(UserUpdateDTO dto) {
        return userMapper.updateById(UserConvertor.toEntity(dto)) > 0;
    }
}
```
```xml
<!-- API 模块单独打包 -->
<modules>
    <module>user-api</module>          <!-- 接口 + DTO -->
    <module>user-service</module>      <!-- 实现 -->
</modules>
```
**反例**:
```java
// @DubboService 不指定任何参数
@DubboService                               // 使用默认值，无法管控
@Service
public class UserServiceImpl implements UserService {
    // version 未指定，无法做版本升级
    // timeout 未指定，使用默认 1 秒可能不够
}

// 接口和实现在同一个模块
// 消费方需要依赖整个 user-service 模块（包含实现代码和依赖）
// 应该只依赖 user-api 模块
```

### R3: @DubboReference 服务引用
**级别**: 必须
**描述**: 服务消费方使用 @DubboReference 注解引用远程服务，必须指定 version、group（与提供方一致）、timeout、check=false 等参数。
**正例**:
```java
// 服务消费方引用远程服务
@Service
@RequiredArgsConstructor
public class OrderApplicationService {

    @DubboReference(
        version = "1.0.0",                  # 与提供方 version 一致
        group = "user-group",               # 与提供方 group 一致
        timeout = 5000,                     # 超时 5 秒
        retries = 0,                        # 不重试
        check = false,                      # 启动时不检查（避免依赖启动顺序）
        mock = "force:return null",         # 降级策略
        loadbalance = "roundrobin"
    )
    private UserService userService;

    public OrderDetailVO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId);
        // 通过 Dubbo RPC 调用用户服务
        UserDTO user = userService.getById(order.getUserId());
        return OrderDetailVO.of(order, user);
    }
}
```
**反例**:
```java
// version/group 与提供方不一致，找不到服务
@DubboReference(
    version = "2.0.0",                      # 提供方是 1.0.0，找不到服务
    check = true                            # 启动时检查，如果用户服务未启动则报错
)
private UserService userService;

// 在 Controller 中直接引用 Dubbo 服务（应通过 Service 层间接调用）
@RestController
public class OrderController {

    @DubboReference                          # 不应该在 Controller 层直接引用
    private UserService userService;
}

// 注入方式错误——使用 @Autowired 而非 @DubboReference
@Autowired                                   # Dubbo 服务不能用 @Autowired
private UserService userService;
```

### R4: 超时配置
**级别**: 必须
**描述**: Dubbo 调用必须显式配置超时时间，优先级：方法级 > 接口级 > 全局配置。合理设置超时避免线程长时间阻塞。
**正例**:
```yaml
# 全局超时配置
dubbo:
  consumer:
    timeout: 5000                           # 全局默认超时 5 秒
    check: false                            # 启动时不检查

  provider:
    timeout: 5000                           # 提供方全局超时
```
```java
// 接口级超时（覆盖全局配置）
@DubboReference(
    version = "1.0.0",
    timeout = 3000                          # 接口级：3 秒
)
private UserService userService;

// 方法级超时（最细粒度）
@DubboReference(
    version = "1.0.0",
    methods = {
        @Method(name = "getById", timeout = 2000),         # 查询：2 秒
        @Method(name = "listByIds", timeout = 5000),        # 批量查询：5 秒
        @Method(name = "updateUser", timeout = 3000)        # 更新：3 秒
    }
)
private UserService userService;
```
**反例**:
```yaml
# 不配置超时，使用默认值
dubbo:
  consumer:
    # 没有配置 timeout

# 超时时间设置过长
dubbo:
  consumer:
    timeout: 60000                          # 60 秒超时——太长
    # 下游服务宕机时线程阻塞 60 秒才超时返回
```

### R5: 重试次数——非幂等操作重试为 0
**级别**: 必须
**描述**: 幂等操作（查询、删除）可以配置重试，非幂等操作（创建、更新、支付）必须设置 retries=0，避免重复执行导致数据错误。
**正例**:
```java
// 幂等操作——可以重试
@DubboReference(
    version = "1.0.0",
    retries = 2,                            # 查询接口可重试 2 次
    timeout = 3000
)
private UserService userService;             # 查询用户，幂等

// 非幂等操作——禁止重试
@DubboReference(
    version = "1.0.0",
    retries = 0,                            # 创建/更新/支付：不重试
    timeout = 5000
)
private OrderService orderService;

// 方法级精细化配置
@DubboReference(
    version = "1.0.0",
    methods = {
        @Method(name = "getById", retries = 2),             # 查询：可重试
        @Method(name = "listByIds", retries = 2),           # 查询：可重试
        @Method(name = "createOrder", retries = 0),         # 创建：不重试
        @Method(name = "updateOrder", retries = 0),         # 更新：不重试
        @Method(name = "payOrder", retries = 0)             # 支付：不重试
    }
)
private OrderService orderService;
```
**反例**:
```java
// 所有操作都重试，包括非幂等操作
@DubboReference(
    version = "1.0.0",
    retries = 3                             # 创建订单也重试 3 次
)
private OrderService orderService;

// 问题：
// 第一次调用创建订单成功，但网络超时返回失败
// Dubbo 自动重试第二次，又创建一笔订单
// 用户下了两笔订单，扣了两次钱

// 默认 retries=2（Dubbo 默认值），但创建/更新操作不应该重试
@DubboReference(version = "1.0.0")           # 没有指定 retries，使用默认值 2
private OrderService orderService;
```

### R6: 负载均衡策略
**级别**: 推荐
**描述**: 根据服务特点选择负载均衡策略。默认 roundrobin（轮询），性能差异大的实例使用 weighted（权重），有状态服务使用 consistenthash（一致性哈希）。
**正例**:
```java
// 轮询（默认）——实例性能相近时使用
@DubboReference(
    version = "1.0.0",
    loadbalance = "roundrobin"
)
private UserService userService;

// 权重——实例性能差异时使用
// 提供方配置权重
@DubboService(
    version = "1.0.0",
    weight = 200                            # 高配机器权重更高
)
public class UserServiceImpl implements UserService { ... }
```
```yaml
# 一致性哈希——有状态场景（如同一用户的请求路由到同一实例）
dubbo:
  consumer:
    loadbalance: consistenthash
```
```java
// 方法级负载均衡
@DubboReference(
    version = "1.0.0",
    methods = {
        @Method(name = "getById", loadbalance = "roundrobin"),
        @Method(name = "getUserOrders", loadbalance = "consistenthash")
    }
)
private UserService userService;
```
**反例**:
```java
// 所有服务都用 random（随机），无法根据实例性能分配
@DubboReference(
    version = "1.0.0",
    loadbalance = "random"                  # 随机分配，高配和低配机器流量一样
)
private UserService userService;

// 硬编码 IP 直连，绕过负载均衡
@DubboReference(
    version = "1.0.0",
    url = "dubbo://192.168.1.100:20880"     # 直连指定 IP
)
private UserService userService;             # 无法负载均衡，单点故障
```

### R7: Mock 降级策略
**级别**: 推荐
**描述**: 服务消费方配置 mock 降级策略，当服务提供方不可用时返回兜底数据或执行降级逻辑，避免影响主流程。
**正例**:
```java
// 方式一：force:return——强制返回 mock 值（用于测试/隔离）
@DubboReference(
    version = "1.0.0",
    mock = "force:return null",             # 强制返回 null（测试时使用）
    timeout = 3000
)
private UserService userService;

// 方式二：fail:return——失败时返回 mock 值（推荐）
@DubboReference(
    version = "1.0.0",
    mock = "fail:return null",              # 调用失败返回 null
    timeout = 3000
)
private ProductQueryService productQueryService;

// 方式三：自定义 Mock 类（推荐——返回有意义的兜底数据）
@DubboReference(
    version = "1.0.0",
    mock = "com.example.order.mock.ProductServiceMock",
    timeout = 3000
)
private ProductService productService;
```
```java
// 自定义 Mock 实现
public class ProductServiceMock implements ProductService {

    @Override
    public ProductDTO getById(Long id) {
        // 返回兜底数据
        ProductDTO fallback = new ProductDTO();
        fallback.setId(id);
        fallback.setName("商品信息暂时不可用");
        fallback.setAvailable(false);
        return fallback;
    }

    @Override
    public List<ProductDTO> listByIds(List<Long> ids) {
        return Collections.emptyList();
    }
}
```
**反例**:
```java
// 不配置 mock，服务宕机时直接抛异常
@DubboReference(version = "1.0.0")
private ProductService productService;      # 没有 mock，调用失败直接异常

// Mock 类名不规范，Dubbo 找不到
@DubboReference(
    version = "1.0.0",
    mock = "true"                           # 只写 "true"，期望找到 "ProductServiceMock"
)
private ProductService productService;
// Dubbo 查找规则：接口名 + Mock -> ProductServiceMock
// 如果 Mock 类不在同一包下或命名不对，无法找到
```

### R8: 结果缓存
**级别**: 建议
**描述**: 对读多写少、实时性要求不高的查询接口启用 Dubbo 结果缓存，减少 RPC 调用次数。支持 lru（默认）和 threadlocal 两种缓存策略。
**正例**:
```java
// 接口级缓存
@DubboReference(
    version = "1.0.0",
    cache = "lru",                          # LRU 缓存策略
    timeout = 3000
)
private ConfigService configService;         # 配置服务，变更频率低，适合缓存

// 方法级缓存
@DubboReference(
    version = "1.0.0",
    methods = {
        @Method(name = "getById", cache = "lru"),           # 查询：启用缓存
        @Method(name = "listByIds", cache = "lru"),         # 批量查询：启用缓存
        @Method(name = "updateUser", cache = "false")       # 更新：不缓存
    }
)
private UserService userService;
```
```java
// 提供方配置缓存大小
@DubboService(
    version = "1.0.0",
    parameters = {
        "cache.lru.size", "1000"            # LRU 缓存最大 1000 条
    }
)
public class ConfigServiceImpl implements ConfigService { ... }
```
**反例**:
```java
// 对实时性要求高的接口启用缓存——数据不一致
@DubboReference(
    version = "1.0.0",
    cache = "lru"                           # 库存查询不应该缓存
)
private InventoryService inventoryService;   # 库存变化频繁，缓存导致超卖

// 对写操作启用缓存——无意义且浪费内存
@DubboReference(
    version = "1.0.0",
    methods = {
        @Method(name = "createOrder", cache = "lru")  # 创建操作不应该缓存
    }
)
private OrderService orderService;
```