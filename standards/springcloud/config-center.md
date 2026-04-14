# Spring Cloud - 配置中心规范

## 适用范围
- 适用于所有 Spring Cloud 微服务的配置中心管理与使用
- 与微服务设计规范、服务注册与发现规范配合使用
- 涵盖配置中心选型、环境隔离、热更新、加密管理等场景

## 规则

### R1: 配置中心选型——Nacos Config
**级别**: 推荐
**描述**: 推荐使用 Nacos 作为配置中心，兼具注册中心和配置中心功能，减少组件维护成本。Spring Cloud Config + Bus 方案需要额外维护 Git 仓库和消息总线。
**正例**:
```yaml
# Nacos Config 依赖
# spring-cloud-starter-alibaba-nacos-config（旧版）
# spring-cloud-starter-alibaba-nacos-config（Spring Cloud 2021+）或
# 使用 spring.config.import 方式（Spring Cloud 2021+）

# bootstrap.yml（旧版）/ application.yml（新版）
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        namespace: ${NACOS_NAMESPACE:dev}
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
```
```xml
<!-- pom.xml 依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```
**反例**:
```yaml
# 同时使用多个配置中心，增加维护复杂度
# 有的服务用 Nacos，有的用 Apollo，有的用 Spring Cloud Config
# 配置管理方式不统一，运维需要维护多套系统
```

### R2: Namespace 隔离环境
**级别**: 必须
**描述**: 使用 Nacos 的 Namespace 隔离不同环境（dev/test/staging/prod），每个环境拥有独立的配置空间，避免开发配置污染生产环境。
**正例**:
```yaml
# 各环境使用不同的 namespace ID
# application.yml 中通过环境变量注入
spring:
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_ADDR:nacos:8848}
        namespace: ${NACOS_NAMESPACE:}        # dev: dev-ns-id, test: test-ns-id
        group: DEFAULT_GROUP
        file-extension: yaml

# bootstrap-dev.yml
spring:
  cloud:
    nacos:
      config:
        namespace: dev-namespace-id

# bootstrap-test.yml
spring:
  cloud:
    nacos:
      config:
        namespace: test-namespace-id

# bootstrap-prod.yml
spring:
  cloud:
    nacos:
      config:
        namespace: prod-namespace-id
```
```
# Nacos 控制台 Namespace 规划
# ├── dev（开发环境）      namespace-id: dev-ns-id
# ├── test（测试环境）     namespace-id: test-ns-id
# ├── staging（预发环境）  namespace-id: staging-ns-id
# └── prod（生产环境）     namespace-id: prod-ns-id
```
**反例**:
```yaml
# 所有环境使用同一个 namespace，靠 group 或 dataId 区分
spring:
  cloud:
    nacos:
      config:
        namespace: public              # 使用默认 namespace
        group: ${spring.profiles.active}  # 靠 group 区分环境

# 问题：
# 1. namespace 不隔离，任何服务的配置都能被其他环境看到
# 2. 配置推送时容易误推到其他环境
# 3. 无法按环境设置不同的访问权限
```

### R3: Group 按业务线或项目分组
**级别**: 推荐
**描述**: 同一 namespace 下使用 Group 按业务线或项目分组管理配置，避免所有服务配置混在一起难以管理。
**正例**:
```yaml
# Group 按业务线划分
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        namespace: ${NACOS_NAMESPACE}
        group: TRADE_GROUP              # 交易业务线
        file-extension: yaml
```
```
# Nacos 控制台 Group 规划（以 prod namespace 为例）
# TRADE_GROUP（交易业务线）
#   ├── order-service.yaml             # 订单服务配置
#   ├── payment-service.yaml           # 支付服务配置
#   └── trade-shared.yaml              # 交易线共享配置
#
# USER_GROUP（用户业务线）
#   ├── user-service.yaml
#   ├── auth-service.yaml
#   └── user-shared.yaml
#
# INFRA_GROUP（基础设施）
#   ├── gateway.yaml
#   └── common-shared.yaml             # 全局共享配置
```
**反例**:
```yaml
# 所有服务都放在 DEFAULT_GROUP，配置列表混乱
spring:
  cloud:
    nacos:
      config:
        group: DEFAULT_GROUP            # 所有服务都使用默认分组
        # 列表中有几十个服务的配置，无法快速定位
```

### R4: 热更新使用 @RefreshScope 或 @NacosValue
**级别**: 推荐
**描述**: 需要动态刷新的配置使用 @RefreshScope 注解或 @ConfigurationProperties（Nacos 自动刷新），避免重启服务即可生效。
**正例**:
```java
// 方式一：@ConfigurationProperties 自动刷新（推荐）
@Data
@Component
@ConfigurationProperties(prefix = "myapp.rate-limit")
@RefreshScope
public class RateLimitConfig {

    private int maxQps = 100;
    private int maxConcurrency = 50;
    private boolean enabled = true;
}

// 方式二：@Value + @RefreshScope
@Service
@RefreshScope
@RequiredArgsConstructor
public class FeatureToggleService {

    @Value("${myapp.feature.new-ui:false}")
    private boolean newUiEnabled;

    @Value("${myapp.feature.dark-mode:false}")
    private boolean darkModeEnabled;

    public boolean isNewUiEnabled() {
        return newUiEnabled;
    }
}

// 方式三：Nacos 监听器（需要更精细控制时）
@Component
@Slf4j
public class NacosConfigListener {

    @NacosConfigListener(dataId = "user-service.yaml", groupId = "USER_GROUP")
    public void onConfigChange(String newConfig) {
        log.info("配置变更: {}", newConfig);
        // 自定义处理逻辑
    }
}
```
**反例**:
```java
// 使用 @Value 但不加 @RefreshScope，配置修改后不生效
@Service
public class RateLimitService {

    @Value("${myapp.rate-limit.max-qps:100}")
    private int maxQps;                   // 修改 Nacos 配置后，需要重启才生效

    public boolean isRateLimited() {
        return currentQps > maxQps;
    }
}

// 每次配置变更都重启服务
// 运维需要逐台重启，影响可用性
```

### R5: 版本管理与审计
**级别**: 必须
**描述**: 配置中心必须开启变更审计，记录谁在什么时间修改了什么配置。关键配置（如数据库连接、限流阈值）变更前需备份历史版本，支持一键回滚。
**正例**:
```yaml
# Nacos 开启配置变更审计
# Nacos 2.x 默认记录配置变更历史，可在控制台查看
# 建议配置保留天数

# 关键配置变更流程（团队约定）：
# 1. 在 Nacos 控制台修改配置前，导出当前版本为备份
# 2. 在测试环境验证配置变更
# 3. 生产环境变更通过 Nacos 历史版本管理回滚
```
```java
// 配置变更监听 + 告警
@Component
@Slf4j
public class ConfigChangeNotifier {

    @NacosConfigListener(dataId = "${spring.application.name}.yaml")
    public void onConfigChange(String newConfig) {
        log.warn("配置发生变更，请确认是否正确");
        // 发送钉钉/飞书通知给相关负责人
        alertService.notifyConfigChange(
            ConfigChangeEvent.builder()
                .service(applicationName)
                .operator(getCurrentOperator())
                .newConfig(newConfig)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }
}
```
**反例**:
```
# 配置变更没有审计记录
# 出问题时不知道谁改了什么，无法回滚
# 只能凭记忆恢复配置

# 生产配置直接修改，没有先在测试环境验证
# 配置改错后服务全部启动失败，没有备份可回滚
```

### R6: 共享配置抽取（shared-configs）
**级别**: 推荐
**描述**: 多个服务共用的配置（如 Redis、数据源、日志级别）抽取为共享配置，各服务通过 shared-configs 引用，避免重复配置和不一致问题。
**正例**:
```yaml
# 各服务引用共享配置
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        namespace: ${NACOS_NAMESPACE}
        file-extension: yaml
        shared-configs:                          # 共享配置列表
          - data-id: common-redis.yaml           # Redis 通用配置
            group: INFRA_GROUP
            refresh: true
          - data-id: common-datasource.yaml      # 数据源通用配置
            group: INFRA_GROUP
            refresh: false
          - data-id: common-logging.yaml         # 日志通用配置
            group: INFRA_GROUP
            refresh: true
          - data-id: trade-shared.yaml           # 业务线共享配置
            group: TRADE_GROUP
            refresh: true
```
```yaml
# common-redis.yaml（共享配置）
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 3000ms
```
**反例**:
```yaml
# 每个服务都单独配置 Redis，参数不一致
# user-service.yaml
spring:
  redis:
    host: redis-server
    port: 6379
    lettuce:
      pool:
        max-active: 10           # 和其他服务不一致

# order-service.yaml
spring:
  redis:
    host: redis-server
    port: 6379
    lettuce:
      pool:
        max-active: 50           # 参数不一致，部分服务可能连接池溢出
```

### R7: 敏感配置加密
**级别**: 必须
**描述**: 数据库密码、API 密钥等敏感配置在 Nacos 中必须加密存储，使用 Nacos 内置加密或 Jasypt 加密，禁止明文存储。
**正例**:
```yaml
# 方式一：Nacos 2.x 内置配置加密
# 1. 在 Nacos 控制台开启配置加密
# 2. 加密后的配置值格式：cipher{算法}密文
spring:
  datasource:
    password: cipher(AES)ZkYhGx...加密后的密文...
```
```java
// 方式二：Jasypt 加密
// 1. 引入依赖
// <dependency>
//     <groupId>com.github.ulisesbocchio</groupId>
//     <artifactId>jasypt-spring-boot-starter</artifactId>
// </dependency>

// 2. 在 Nacos 中使用 ENC() 包裹密文
// spring.datasource.password=ENC(G6N718UuyPE5bHyWKyuLQSm02auQPUtm)

// 3. 启动时通过环境变量传入加密密钥
// java -jar app.jar -Djasypt.encryptor.password=${JASYPT_PASSWORD}
```
```yaml
# 方式三：环境变量占位符（推荐与加密结合使用）
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}                   # 由 K8s Secret / 环境变量注入
  redis:
    password: ${REDIS_PASSWORD}
```
**反例**:
```yaml
# 敏感配置明文存储在 Nacos
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/trade_db
    username: admin
    password: Admin@2024!                       # 明文密码存储在 Nacos

myapp:
  third-party:
    aliyun:
      access-key: LTAI5tXXXXXXXXXX             # 明文 AK
      secret-key: XXXXXXXXXXXXXXXXXXXX          # 明文 SK
```

### R8: 配置中心高可用部署
**级别**: 必须
**描述**: 配置中心必须集群部署（至少 3 节点），配合本地缓存机制，即使配置中心全部宕机，服务也能使用本地缓存启动。
**正例**:
```yaml
# Nacos 集群配置——application.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos1:8848,nacos2:8848,nacos3:8848    # 多节点
        namespace: ${NACOS_NAMESPACE}
        file-extension: yaml

# 开启本地缓存（默认已开启）
# Nacos 客户端会将配置缓存到 ${user.home}/nacos/config/ 目录
# 配置中心不可用时，从本地缓存加载配置
```
```yaml
# Nacos 集群部署（Nginx 负载均衡）
# 推荐使用 VIP 或域名方式访问
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos.example.com:8848    # 域名 -> Nginx -> Nacos 集群
```
```bash
# Nacos 集群配置——cluster.conf
# 每个节点的 cluster.conf 都包含所有节点
nacos1:8848
nacos2:8848
nacos3:8848
```
**反例**:
```yaml
# 单节点部署，没有容灾能力
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos-single:8848        # 单节点
        # Nacos 宕机后所有服务无法启动

# 没有配置本地缓存，完全依赖配置中心
# 配置中心重启时，所有服务同时拉取配置导致惊群效应
```