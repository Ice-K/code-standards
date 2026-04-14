# Spring Cloud Gateway - 网关设计规范

## 适用范围
- 适用于所有 Spring Cloud Gateway 网关项目的设计与开发
- 与微服务设计规范、服务注册与发现规范配合使用
- 网关路由配置、过滤器开发、限流熔断、安全鉴权必须遵循

## 规则

### R1: 路由使用 YAML 配置管理
**级别**: 必须
**描述**: 路由配置统一在 application.yml 中管理，使用服务发现（lb://）而非硬编码地址，路由 ID 采用"服务名-service"格式保持一致性。
**正例**:
```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: false              # 禁止自动发现路由，手动管理
      routes:
        - id: user-service            # 路由 ID：服务名格式
          uri: lb://user-service      # 使用负载均衡的服务发现
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

        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - name: Retry
              args:
                retries: 2
                statuses: BAD_GATEWAY,GATEWAY_TIMEOUT
                methods: GET
                backoff:
                  firstBackoff: 100ms
                  maxBackoff: 500ms
                  factor: 2
                  basedOnPreviousValue: false
```
**反例**:
```yaml
# 硬编码 IP 地址，无法感知服务上下线
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: http://192.168.1.100:8081    # 硬编码地址
          predicates:
            - Path=/api/users/**

# 开启自动发现，路由不可控
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true                     # 所有服务自动暴露，无法管控路由规则
```

### R2: 全局过滤器——跨域、鉴权、日志
**级别**: 必须
**描述**: 网关通过全局过滤器统一处理跨域（CORS）、鉴权（JWT 校验）、请求日志等横切关注点，各微服务不再重复实现。
**正例**:
```java
// 全局跨域配置
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("https://*.example.com"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}

// 全局鉴权过滤器
@Component
@Slf4j
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private static final List<String> WHITE_LIST = List.of(
        "/api/users/login",
        "/api/users/register",
        "/api/users/captcha"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 白名单放行
        if (WHITE_LIST.contains(path)) {
            return chain.filter(exchange);
        }

        // 校验 JWT Token
        String token = extractToken(exchange.getRequest());
        if (token == null || !jwtTokenProvider.validate(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().writeWith(Mono.just(
                exchange.getResponse().bufferFactory()
                    .wrap(JsonUtils.toJsonBytes(Result.fail(401, "未登录或登录已过期")))));
        }

        // 解析用户信息放入 Header 传递给下游服务
        Long userId = jwtTokenProvider.getUserId(token);
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", String.valueOf(userId))
            .build();
        return chain.filter(exchange.mutate().request(request).build());
    }

    @Override
    public int getOrder() {
        return -100;       // 高优先级
    }
}

// 全局请求日志过滤器
@Component
@Slf4j
public class RequestLogGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = UUID.randomUUID().toString().replace("-", "");
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-Trace-Id", traceId)
            .build();
        exchange.getAttributes().put("startTime", System.currentTimeMillis());

        log.info("[{}] >>> {} {}", traceId, request.getMethod(), request.getURI().getPath());

        return chain.filter(exchange.mutate().request(request).build())
            .doFinally(signalType -> {
                Long startTime = exchange.getAttribute("startTime");
                long duration = System.currentTimeMillis() - (startTime != null ? startTime : 0);
                int status = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value() : 0;
                log.info("[{}] <<< {} {}ms", traceId, status, duration);
            });
    }

    @Override
    public int getOrder() {
        return -200;      // 最高优先级，最先执行
    }
}
```
**反例**:
```java
// 各微服务自行处理跨域和鉴权——重复代码，维护困难
@RestController
@CrossOrigin(origins = "*")           // 各服务各自配置跨域
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@RequestHeader("Authorization") String token,
                                  @PathVariable Long id) {
        // 每个 Controller 方法都手动校验 token
        if (!jwtUtil.validate(token)) {
            throw new UnauthorizedException("token 无效");
        }
        return Result.success(userService.getById(id));
    }
}
```

### R3: 局部过滤器用于特定路由
**级别**: 推荐
**描述**: 特定路由的定制化逻辑使用局部过滤器（GatewayFilter），通过自定义 GatewayFilterFactory 实现，在 YAML 中按路由配置引用。
**正例**:
```java
// 自定义局部过滤器工厂——API 版本路由
@Component
public class ApiVersionGatewayFilterFactory
        extends AbstractGatewayFilterFactory<ApiVersionGatewayFilterFactory.Config> {

    public ApiVersionGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            // 将 /v1/users 路由到 user-service 的 /api/users
            String newPath = path.replaceAll("/v" + config.getVersion(), "/api");
            ServerHttpRequest request = exchange.getRequest().mutate()
                .path(newPath)
                .build();
            return chain.filter(exchange.mutate().request(request).build());
        };
    }

    @Data
    public static class Config {
        private String version;
    }
}
```
```yaml
# YAML 配置使用自定义过滤器
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-v1
          uri: lb://user-service
          predicates:
            - Path=/v1/users/**
          filters:
            - name: ApiVersion
              args:
                version: "1"
```
**反例**:
```java
// 把所有逻辑都塞进全局过滤器，通过 if-else 判断路由
@Component
public class AllInOneGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/api/users")) {
            // 用户相关逻辑...
        } else if (path.startsWith("/api/orders")) {
            // 订单相关逻辑...
        } else if (path.startsWith("/api/products")) {
            // 商品相关逻辑...
        }
        // 越来越臃肿，违反单一职责
        return chain.filter(exchange);
    }
}
```

### R4: Sentinel 网关限流
**级别**: 必须
**描述**: 网关层集成 Sentinel 进行限流保护，防止突发流量打垮后端服务。按路由 ID 或 API 分组配置 QPS 限流，并返回友好的限流响应。
**正例**:
```yaml
# 依赖引入
# spring-cloud-starter-alibaba-sentinel
# sentinel-spring-cloud-gateway-adapter
spring:
  cloud:
    sentinel:
      transport:
        dashboard: sentinel-dashboard:8080
      eager: true
```
```java
// Sentinel 网关限流配置
@Configuration
public class GatewaySentinelConfig {

    @PostConstruct
    public void init() {
        // 按路由 ID 限流
        GatewayFlowRule userRule = new GatewayFlowRule("user-service")
            .setCount(100)               # 每秒 100 个请求
            .setIntervalSec(1);
        GatewayFlowRule orderRule = new GatewayFlowRule("order-service")
            .setCount(50)                # 每秒 50 个请求
            .setIntervalSec(1);

        // 按 API 分组限流
        GatewayApiGroupDefinition apiGroup = new GatewayApiGroupDefinition("common-api")
            .setMatchStrategy(GatewayApiGroupDefinition.MATCH_STRATEGY_URL_PATTERN)
            .setPatterns(List.of("/api/**"));

        GatewayFlowRule apiGroupRule = new GatewayFlowRule("common-api")
            .setCount(200)
            .setIntervalSec(1);

        GatewayRuleManager.loadRules(Set.of(userRule, orderRule, apiGroupRule));
    }

    // 自定义限流响应
    @PostConstruct
    public void initBlockHandler() {
        GatewayCallbackManager.setBlockHandler((exchange, t) -> {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            return exchange.getResponse().writeWith(Mono.just(
                exchange.getResponse().bufferFactory()
                    .wrap(JsonUtils.toJsonBytes(
                        Result.fail(429, "请求过于频繁，请稍后重试")))));
        });
    }
}
```
**反例**:
```java
// 没有网关限流，突发流量直接打到后端服务
// 压测或恶意攻击时后端服务直接崩溃

// 在每个微服务中自行限流——无法统一管控
@RestController
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        // 手动计数限流
        if (requestCount.incrementAndGet() > 100) {
            return Result.fail(429, "限流");
        }
        // ...
    }
}
```

### R5: 统一 JWT 鉴权
**级别**: 必须
**描述**: JWT 鉴权统一在网关完成，解析后将用户 ID、角色等信息通过请求头传递给下游服务。下游服务信任网关 Header，不再重复校验 Token。
**正例**:
```java
// 网关鉴权过滤器（参考 R2 中的 AuthGlobalFilter）
// 解析后通过 Header 传递
Long userId = jwtTokenProvider.getUserId(token);
List<String> roles = jwtTokenProvider.getRoles(token);
ServerHttpRequest request = exchange.getRequest().mutate()
    .header("X-User-Id", String.valueOf(userId))
    .header("X-User-Roles", String.join(",", roles))
    .build();
```
```java
// 下游服务——从 Header 获取用户信息（信任网关）
@Component
public class UserContextInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) {
        String userId = request.getHeader("X-User-Id");
        String roles = request.getHeader("X-User-Roles");
        if (userId != null) {
            UserContext.setCurrentUser(Long.valueOf(userId), roles);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContext.clear();
    }
}
```
```java
// 下游服务权限校验注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value();
}

@Aspect
@Component
public class RoleCheckAspect {

    @Before("@annotation(requireRole)")
    public void checkRole(RequireRole requireRole) {
        UserContext user = UserContext.getCurrentUser();
        boolean hasRole = Arrays.stream(requireRole.value())
            .anyMatch(user.getRoles()::contains);
        if (!hasRole) {
            throw new ForbiddenException("权限不足");
        }
    }
}
```
**反例**:
```java
// 每个下游服务都引入 JWT 依赖，各自校验 Token
// 问题：JWT 密钥需要在每个服务中配置，密钥轮换时需逐个服务重启

@Service
public class OrderService {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;    // 每个服务都有

    public OrderVO getOrderDetail(Long orderId, String token) {
        if (!jwtTokenProvider.validate(token)) {  // 重复校验
            throw new UnauthorizedException();
        }
        Long userId = jwtTokenProvider.getUserId(token);
        // ...
    }
}
```

### R6: 跨域统一处理
**级别**: 必须
**描述**: 跨域（CORS）只在网关层统一配置，下游服务不再单独处理跨域。禁止使用 @CrossOrigin 或在 Controller 中设置 CORS Header。
**正例**:
```yaml
# 网关统一跨域配置（推荐使用 Java Config，参考 R2）
# 如果使用 YAML 配置：
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOriginPatterns:
              - "https://*.example.com"
              - "http://localhost:*"        # 开发环境
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
```
```java
// 下游服务——不配置任何跨域处理
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        // 无需任何跨域配置，网关已处理
        return Result.success(userService.getById(id));
    }
}
```
**反例**:
```java
// 下游服务也配置跨域，与网关跨域配置冲突，返回重复的 CORS Header
@RestController
@CrossOrigin(origins = "*")              // 不应该由下游服务处理
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
}

// 或者手动在 Filter 中设置 CORS Header
@Component
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        HttpServletResponse response = (HttpServletResponse) res;
        response.setHeader("Access-Control-Allow-Origin", "*");  // 与网关重复
        // ...
    }
}
```

### R7: 请求日志过滤器
**级别**: 推荐
**描述**: 网关配置请求日志过滤器，记录请求方法、路径、状态码、耗时、TraceId 等关键信息，便于问题排查和性能分析。
**正例**:
```java
// 结构化日志过滤器
@Component
@Slf4j
public class AccessLogGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = Optional.ofNullable(
            exchange.getRequest().getHeaders().getFirst("X-Trace-Id"))
            .orElseGet(() -> UUID.randomUUID().toString().replace("-", ""));

        long startTime = System.currentTimeMillis();
        exchange.getAttributes().put("startTime", startTime);
        exchange.getAttributes().put("traceId", traceId);

        // 传递 traceId 给下游
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-Trace-Id", traceId)
            .build();

        return chain.filter(exchange.mutate().request(request).build())
            .then(Mono.fromRunnable(() -> {
                long duration = System.currentTimeMillis() - startTime;
                HttpStatus status = exchange.getResponse().getStatusCode();
                String clientIp = getClientIp(exchange.getRequest());
                String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");

                // 结构化日志，便于 ELK 采集分析
                log.info("traceId={} method={} path={} status={} duration={}ms "
                    + "clientIp={} userId={} service={}",
                    traceId,
                    exchange.getRequest().getMethod(),
                    exchange.getRequest().getURI().getPath(),
                    status != null ? status.value() : "unknown",
                    duration,
                    clientIp,
                    userId != null ? userId : "anonymous",
                    exchange.getAttribute("org.springframework.cloud.gateway"
                        + ".support.ServerWebExchangeUtils.gatewayRouteId"));
            }));
    }

    private String getClientIp(ServerHttpRequest request) {
        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip == null) {
            ip = request.getHeaders().getFirst("X-Real-IP");
        }
        return ip != null ? ip.split(",")[0].trim()
            : request.getRemoteAddress().getAddress().getHostAddress();
    }

    @Override
    public int getOrder() {
        return -200;
    }
}
```
**反例**:
```java
// 直接打印 request 对象，日志量大且难以检索
@Component
public class SimpleLogFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        System.out.println("Request: " + exchange.getRequest());     // 用 sysout
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() { return 0; }
}
```

### R8: 重试配置
**级别**: 推荐
**描述**: 对幂等请求（GET）配置合理的重试策略，包括重试次数、重试状态码和退避策略。非幂等请求（POST/PUT/DELETE）默认不重试。
**正例**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - name: Retry
              args:
                retries: 2                                  # 重试 2 次（共 3 次请求）
                statuses: BAD_GATEWAY,GATEWAY_TIMEOUT       # 仅对网关错误重试
                methods: GET                                 # 仅 GET 请求重试
                exceptions: java.io.IOException,java.util.concurrent.TimeoutException
                backoff:
                  firstBackoff: 100ms                        # 首次退避 100ms
                  maxBackoff: 1000ms                         # 最大退避 1s
                  factor: 2                                  # 指数退避因子
                  basedOnPreviousValue: true

      # 全局重试配置
      retry:
        enabled: true
```
**反例**:
```yaml
# 对所有请求方法都重试——POST/PUT 重试可能导致重复创建或重复更新
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - name: Retry
              args:
                retries: 5               # 重试次数过多
                methods: GET,POST,PUT    # 包含非幂等方法
                # 没有退避策略，可能加重下游压力
```

### R9: 请求体大小限制
**级别**: 必须
**描述**: 网关配置合理的请求体大小限制，防止大文件上传或恶意大请求体打满内存。文件上传类请求由专门的文件服务处理。
**正例**:
```yaml
spring:
  codec:
    max-in-memory-size: 2MB            # 限制请求体在内存中的大小

server:
  netty:
    max-initial-line-length: 8192      # 请求行最大长度
    max-header-size: 8192              # Header 最大大小
    max-chunk-size: 8192               # chunk 最大大小
```
```java
// 自定义过滤器检查 Content-Length
@Component
public class RequestSizeGlobalFilter implements GlobalFilter, Ordered {

    private static final long MAX_REQUEST_SIZE = 2 * 1024 * 1024; // 2MB

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String contentLength = exchange.getRequest().getHeaders()
            .getFirst("Content-Length");
        if (contentLength != null && Long.parseLong(contentLength) > MAX_REQUEST_SIZE) {
            exchange.getResponse().setStatusCode(HttpStatus.PAYLOAD_TOO_LARGE);
            return exchange.getResponse().writeWith(Mono.just(
                exchange.getResponse().bufferFactory()
                    .wrap(JsonUtils.toJsonBytes(
                        Result.fail(413, "请求体过大，最大允许 2MB")))));
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -150;
    }
}
```
**反例**:
```yaml
# 不限制请求体大小，可能被恶意大请求体攻击
# 默认配置过大或未配置

# 或者限制过小，正常业务请求被拒绝
spring:
  codec:
    max-in-memory-size: 256KB          # 过小，正常的 JSON 请求可能被拒绝
```

### R10: 网关不处理业务逻辑
**级别**: 必须
**描述**: 网关只负责路由、鉴权、限流、日志等横切关注点，不包含任何业务逻辑。禁止在网关中调用数据库、缓存或其他微服务接口处理业务。
**正例**:
```java
// 正确：网关只做路由转发和横切处理
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider jwtTokenProvider;    // 只做 JWT 校验

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 校验 Token -> 解析用户信息 -> 放入 Header -> 转发
        String token = extractToken(exchange.getRequest());
        if (!jwtTokenProvider.validate(token)) {
            return reject(exchange, 401, "未登录");
        }
        Long userId = jwtTokenProvider.getUserId(token);
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", String.valueOf(userId))
            .build();
        return chain.filter(exchange.mutate().request(request).build());
    }
}
```
**反例**:
```java
// 错误：网关中调用数据库查询权限
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    private PermissionMapper permissionMapper;    // 网关引入数据库依赖

    @Autowired
    private UserClient userClient;                // 网关调用其他微服务

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        Long userId = getUserId(exchange.getRequest());
        // 在网关中查询数据库——违反分层原则，网关变成业务服务
        List<Permission> perms = permissionMapper.selectByUserId(userId);
        UserDTO user = userClient.getById(userId).getData();    // 调用用户服务
        // 网关变重，启动变慢，职责不清
        return chain.filter(exchange);
    }
}
```