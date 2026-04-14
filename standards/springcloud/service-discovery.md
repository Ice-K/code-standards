# Spring Cloud - 服务注册与发现规范

## 适用范围
- 适用于所有 Spring Cloud 微服务的注册中心配置与服务发现
- 与微服务设计规范、网关设计规范配合使用
- 涵盖服务注册、心跳检测、负载均衡、优雅下线等场景

## 规则

### R1: Nacos 健康检查与 Eureka 自我保护
**级别**: 必须
**描述**: 根据注册中心类型正确配置健康检查机制。Nacos 使用临时实例的心跳模式或持久化实例的服务器端主动探测；Eureka 必须开启自我保护模式，防止网络分区误剔除。
**正例**:
```yaml
# Nacos 配置——临时实例（默认，推荐）
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        namespace: ${NACOS_NAMESPACE:dev}
        heart-beat-interval: 5000      # 心跳间隔 5 秒
        heart-beat-timeout: 15000      # 心跳超时 15 秒
        ip-delete-timeout: 30000       # IP 删除超时 30 秒
        instance-enabled: true         # 注册后即可用

# Nacos 配置——持久化实例（仅特殊场景）
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false               # 持久化实例，由 Nacos 服务端主动探测
        weight: 1
```
```yaml
# Eureka 配置——开启自我保护
eureka:
  server:
    enable-self-preservation: true     # 开启自我保护
    renewal-percent-threshold: 0.85    # 续约百分比阈值
  instance:
    lease-renewal-interval-in-seconds: 10    # 续约间隔
    lease-expiration-duration-in-seconds: 30  # 过期时间
```
**反例**:
```yaml
# Nacos 心跳超时配置不合理，容易误判服务下线
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 30000     # 心跳间隔过大
        heart-beat-timeout: 5000       # 超时比间隔还小，必定超时
        ip-delete-timeout: 10000       # 删除超时过短

# Eureka 关闭自我保护（生产环境禁止）
eureka:
  server:
    enable-self-preservation: false    # 网络抖动时大量服务被剔除
```

### R2: 心跳检测间隔配置
**级别**: 推荐
**描述**: 合理设置心跳间隔和超时时间，既要及时感知服务状态变化，又不能因网络抖动导致频繁摘除。推荐心跳间隔 5 秒、超时 15 秒、摘除 30 秒。
**正例**:
```yaml
# Nacos 推荐心跳配置
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000      # 心跳间隔：5 秒
        heart-beat-timeout: 15000      # 超时时间：15 秒（3 倍间隔）
        ip-delete-timeout: 30000       # 摘除时间：30 秒（6 倍间隔）

# Eureka 推荐续约配置
eureka:
  instance:
    lease-renewal-interval-in-seconds: 10    # 续约间隔：10 秒
    lease-expiration-duration-in-seconds: 30  # 过期时间：30 秒（3 倍间隔）
  client:
    registry-fetch-interval-seconds: 10       # 拉取间隔：10 秒
```
**反例**:
```yaml
# 心跳间隔过短，加重注册中心压力
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 1000      # 1 秒一次心跳，网络和 CPU 开销大
        heart-beat-timeout: 3000       # 3 秒超时，网络抖动即摘除

# 心跳间隔过长，服务宕机后长时间不可感知
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 60000     # 1 分钟才心跳一次
        heart-beat-timeout: 180000     # 3 分钟超时
        ip-delete-timeout: 360000      # 6 分钟才摘除，期间流量持续打到宕机实例
```

### R3: 负载均衡策略选择
**级别**: 推荐
**描述**: 根据业务场景选择合适的负载均衡策略。默认使用轮询（RoundRobin），有状态服务使用一致性哈希，性能差异大的实例使用权重或响应时间加权。
**正例**:
```yaml
# 全局默认负载均衡策略
spring:
  cloud:
    loadbalancer:
      retry:
        enabled: true                  # 开启重试
      cache:
        enabled: true
        ttl: 30s
```
```java
// 针对特定服务自定义负载均衡策略
@Configuration
public class ProductServiceLoadBalancerConfig {

    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment, LoadBalancerClientFactory factory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}

// 在 Feign 客户端指定配置
@FeignClient(
    name = "product-service",
    configuration = ProductServiceLoadBalancerConfig.class
)
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    Result<ProductDTO> getById(@PathVariable("id") Long id);
}
```
```java
// 灰度发布场景——基于元数据的负载均衡
@Component
public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        String grayTag = request.getContext().get("gray-tag");
        List<ServiceInstance> instances = serviceInstanceListSupplier.get()
            .collectList().block();
        // 优先选择匹配灰度标签的实例
        List<ServiceInstance> matched = instances.stream()
            .filter(i -> grayTag.equals(i.getMetadata().get("gray-tag")))
            .collect(Collectors.toList());
        if (!matched.isEmpty()) {
            return Mono.just(new DefaultResponse(matched.get(0)));
        }
        // 无匹配则回退到正常实例
        return Mono.just(new DefaultResponse(instances.get(0)));
    }
}
```
**反例**:
```java
// 所有服务都使用默认轮询，不考虑实例性能差异
// 新旧实例混合部署时，低配实例承担相同流量导致性能瓶颈

// 手动实现负载均衡
@GetMapping("/users/{id}")
public Result<UserDTO> getUser(@PathVariable Long id) {
    List<String> urls = Arrays.asList(
        "http://192.168.1.10:8081",   // 硬编码地址
        "http://192.168.1.11:8081"
    );
    String url = urls.get(new Random().nextInt(urls.size()));  // 随机选择
    return restTemplate.getForObject(url + "/api/users/" + id, Result.class);
}
```

### R4: 服务优雅下线
**级别**: 必须
**描述**: 服务停止时必须优雅下线，先从注册中心注销、等待正在处理的请求完成后再关闭，避免已 accepted 但未 processed 的请求失败。
**正例**:
```yaml
# 方式一：Spring Boot 优雅停机（推荐）
server:
  shutdown: graceful                  # 开启优雅停机

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s   # 最多等待 30 秒
```
```java
// 方式二：自定义优雅下线（配合 Nacos 主动注销）
@Component
@Slf4j
public class GracefulShutdown implements DisposableBean {

    @Autowired
    private NacosRegistration registration;

    @Override
    public void destroy() throws Exception {
        log.info("服务优雅下线开始，先从 Nacos 注销");
        // 先从注册中心注销，不再接收新请求
        registration.stop();
        // 等待正在处理的请求完成（由 server.shutdown=graceful 保证）
        log.info("等待正在处理的请求完成...");
        Thread.sleep(5000);
        log.info("服务优雅下线完成");
    }
}
```
```bash
# K8s PreStop 钩子——先注销再终止
# pod spec
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "curl -X POST http://localhost:8080/actuator/nacos-deregister; sleep 10"]
terminationGracePeriodSeconds: 30
```
**反例**:
```java
// 暴力杀进程，正在处理的请求直接中断
// kill -9 <pid>

// K8s 没有 preStop 钩子，直接 SIGTERM
// Pod 被终止时注册中心还没注销，流量继续打到已关闭的实例
```
```yaml
# 没有开启 graceful shutdown
server:
  # 缺少 shutdown: graceful 配置
  port: 8080
```

### R5: 服务元数据配置
**级别**: 推荐
**描述**: 服务实例注册时携带元数据信息（如版本号、区域、权重标签），用于灰度发布、流量路由、同城优先等高级场景。
**正例**:
```yaml
# Nacos 元数据配置
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        metadata:
          version: v2.1.0              # 服务版本号
          region: cn-east              # 机房区域
          zone: zone-a                 # 可用区
          env: ${spring.profiles.active}  # 环境标识
          gray-tag: gray               # 灰度标签（灰度实例才设置）
          weight: "100"                # 权重
```
```java
// 基于元数据的 Zone 亲和路由
@Component
public class ZoneAffinityLoadBalancer implements ReactorServiceInstanceLoadBalancer {

    @Value("${spring.cloud.nacos.discovery.metadata.zone:default}")
    private String currentZone;

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        List<ServiceInstance> instances = serviceInstanceListSupplier.get()
            .collectList().block();
        // 优先选择同 zone 实例
        List<ServiceInstance> sameZone = instances.stream()
            .filter(i -> currentZone.equals(i.getMetadata().get("zone")))
            .collect(Collectors.toList());
        if (!sameZone.isEmpty()) {
            return Mono.just(new DefaultResponse(
                sameZone.get(ThreadLocalRandom.current().nextInt(sameZone.size()))));
        }
        return Mono.just(new DefaultResponse(
            instances.get(ThreadLocalRandom.current().nextInt(instances.size()))));
    }
}
```
**反例**:
```yaml
# 不配置元数据，无法实现灰度、zone 亲和等高级路由
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        # 没有任何 metadata

# 在代码中硬编码版本信息
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping(value = "/api/products/{id}", headers = "X-Version=v2")
    Result<ProductDTO> getById(@PathVariable("id") Long id);
}
```

### R6: @LoadBalanced 正确使用
**级别**: 必须
**描述**: RestTemplate 或 WebClient 使用 @LoadBalanced 注解后才能通过服务名调用，且一个应用中只配置一个 @LoadBalanced RestTemplate，避免配置混乱。
**正例**:
```java
// 配置类中声明 @LoadBalanced RestTemplate
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced                    // 启用服务名解析和负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

// 使用服务名调用（而非 IP 地址）
@Service
@RequiredArgsConstructor
public class OrderService {

    private final RestTemplate restTemplate;

    public UserDTO getUser(Long userId) {
        // 使用服务名 user-service，由注册中心解析为实际 IP
        return restTemplate.getForObject(
            "http://user-service/api/users/{id}",
            UserDTO.class, userId);
    }
}
```
**反例**:
```java
// 没有 @LoadBalanced 注解，直接用服务名会报 UnknownHostException
@Configuration
public class RestTemplateConfig {

    @Bean
    // 缺少 @LoadBalanced 注解
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

// 同时配置多个 RestTemplate（一个有 @LoadBalanced，一个没有）导致混乱
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced
    public RestTemplate loadBalancedRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public RestTemplate plainRestTemplate() {
        return new RestTemplate();
    }
}
// 注入时容易混淆，Autowired 可能注入错误的实例
```

### R7: Feign 超时配置
**级别**: 必须
**描述**: Feign 客户端必须显式配置连接超时和读取超时，不能依赖默认值。全局设置合理默认值，关键服务单独覆盖。
**正例**:
```yaml
# 全局 Feign 超时配置
feign:
  client:
    config:
      default:                          # 全局默认
        connectTimeout: 3000            # 连接超时 3 秒
        readTimeout: 5000               # 读取超时 5 秒
        loggerLevel: basic

      product-service:                  # 特定服务单独配置（覆盖全局）
        connectTimeout: 3000
        readTimeout: 10000              # 商品服务响应慢，放宽到 10 秒

      payment-service:                  # 支付服务对延迟敏感
        connectTimeout: 2000            # 连接超时 2 秒
        readTimeout: 3000               # 读取超时 3 秒
```
```java
// 也可通过 Java Config 配置（适合动态配置场景）
@Configuration
public class FeignConfig {

    @Bean
    public Request.Options options() {
        return new Request.Options(
            3, TimeUnit.SECONDS,    // 连接超时
            5, TimeUnit.SECONDS     // 读取超时
        );
    }
}
```
**反例**:
```yaml
# 不配置超时，使用默认值（可能非常大或不可控）
feign:
  client:
    config:
      default:
        # 没有任何超时配置

# 超时时间设置过长，下游服务宕机时线程长时间阻塞
feign:
  client:
    config:
      default:
        connectTimeout: 30000           # 连接超时 30 秒——太长
        readTimeout: 60000              # 读取超时 60 秒——太长
```

### R8: 内网 IP 优先注册
**级别**: 推荐
**描述**: 多网卡环境下，服务注册时必须指定正确的内网 IP，避免注册外网 IP 或 Docker 网桥 IP，确保服务间通过内网高速通信。
**正例**:
```yaml
# 方式一：指定优先使用的网卡
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        ip: ${HOST_IP:}                 # 通过环境变量注入内网 IP

# 方式二：指定网卡名（适用于 Linux 服务器）
spring:
  cloud:
    nacos:
      discovery:
        network-interface: eth0         # 使用 eth0 网卡的 IP

# 方式三：使用 Spring Cloud 的 inetutils 配置
spring:
  cloud:
    inetutils:
      preferred-networks:
        - 10.0.0                        # 优先使用 10.0.0.x 网段
        - 192.168
      ignored-interfaces:
        - docker0                       # 忽略 Docker 网桥
        - veth.*                        # 忽略虚拟网卡
```
**反例**:
```yaml
# 不配置网卡优先级，注册了 Docker 网桥 IP（172.17.0.x）
# 其他服务无法通过 172.17.0.x 访问宿主机上的服务
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        # 不指定 IP，多网卡时可能注册错误的 IP

# 注册了公网 IP，服务间通过公网通信
# 延迟高、费用贵、安全性差
spring:
  cloud:
    nacos:
      discovery:
        ip: 120.78.xxx.xxx             # 公网 IP
```