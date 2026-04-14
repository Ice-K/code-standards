# Spring Cloud Alibaba - Nacos 使用规范

## 适用范围
- 适用于所有基于 Spring Cloud Alibaba 的微服务使用 Nacos 作为注册中心与配置中心
- 与微服务设计规范、服务注册与发现规范、配置中心规范配合使用
- 涵盖 Nacos 注册中心配置、命名约定、namespace 隔离、灰度发布等场景

## 规则

### R1: 注册中心配置规范
**级别**: 必须
**描述**: 服务注册时必须正确配置服务名、namespace、group 等核心参数。服务名与 spring.application.name 保持一致，禁止使用默认 public namespace。
**正例**:
```yaml
# bootstrap.yml（或 application.yml）
spring:
  application:
    name: user-service                        # 服务名，全小写，中划线分隔
  cloud:
    nacos:
      discovery:
        server-addr: ${NACOS_ADDR:nacos:8848}
        namespace: ${NACOS_NAMESPACE:dev}      # 必须指定 namespace
        group: ${NACOS_GROUP:DEFAULT_GROUP}
        cluster-name: BJ                       # 集群名（机房标识）
        weight: 1                              # 权重
        ephemeral: true                        # 临时实例（推荐）
        heart-beat-interval: 5000
        heart-beat-timeout: 15000
        ip-delete-timeout: 30000
```
**反例**:
```yaml
# 使用默认 namespace 和 group
spring:
  application:
    name: UserService                         # 服务名含大写
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        # namespace 未指定，使用默认 public
        # 所有环境注册到同一空间，互相干扰
```

### R2: DataId 命名约定
**级别**: 必须
**描述**: DataId 采用"{服务名}.{文件扩展名}"格式，与 spring.application.name 保持一致。扩展名统一使用 yaml，避免混用 properties。
**正例**:
```yaml
# Nacos 配置管理中的 DataId 列表
# 服务专属配置
user-service.yaml                             # 格式：{服务名}.yaml
order-service.yaml
product-service.yaml

# 共享配置
common-redis.yaml                             # 格式：{共享模块名}.yaml
common-datasource.yaml
common-logging.yaml

# 扩展配置（多 profile）
user-service-dev.yaml                         # 格式：{服务名}-{profile}.yaml
user-service-prod.yaml
```
```yaml
# 对应服务配置
spring:
  cloud:
    nacos:
      config:
        file-extension: yaml                   # 统一使用 yaml
        # dataId 自动拼接为 ${spring.application.name}.yaml
```
**反例**:
```
# DataId 命名不规范
user_config.properties                         # 下划线 + properties
user-service-config                            # 没有扩展名
User-Service.yaml                              # 大写
userservice.yaml                               # 服务名不完整

# 同一服务混用 yaml 和 properties
user-service.yaml
user-service.properties                        # 与上面冲突
```

### R3: Namespace 环境隔离
**级别**: 必须
**描述**: 使用不同的 Namespace 隔离 dev、test、staging、prod 环境。每个环境有独立的 namespace ID，通过环境变量注入，确保环境间配置和服务注册完全隔离。
**正例**:
```yaml
# 通过环境变量切换 namespace
spring:
  cloud:
    nacos:
      discovery:
        namespace: ${NACOS_NAMESPACE}
      config:
        namespace: ${NACOS_NAMESPACE}
```
```bash
# 各环境启动时注入不同的 namespace ID
# 开发环境
java -jar user-service.jar --NACOS_NAMESPACE=dev-ns-id

# 测试环境
java -jar user-service.jar --NACOS_NAMESPACE=test-ns-id

# 生产环境
java -jar user-service.jar --NACOS_NAMESPACE=prod-ns-id

# K8s ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: nacos-config
data:
  NACOS_NAMESPACE: "prod-ns-id"
```
**反例**:
```yaml
# 通过 dataId 后缀区分环境（而非 namespace）
spring:
  cloud:
    nacos:
      config:
        namespace: public                      # 所有环境用同一个 namespace
        # 通过 dataId 加后缀区分
        # user-service-dev.yaml
        # user-service-test.yaml
        # user-service-prod.yaml

# 问题：服务发现无法隔离，开发环境能看到生产环境的服务实例
```

### R4: Group 按业务线划分
**级别**: 推荐
**描述**: 在同一 namespace 下，使用 Group 将配置按业务线或团队分组，便于管理和权限控制。
**正例**:
```yaml
# 交易业务线服务配置
spring:
  cloud:
    nacos:
      discovery:
        group: TRADE_GROUP
      config:
        group: TRADE_GROUP
        shared-configs:
          - data-id: trade-common.yaml
            group: TRADE_GROUP
            refresh: true
```
```
# Nacos 控制台 Group 规划
# TRADE_GROUP：交易业务线（订单、支付、退款）
# USER_GROUP：用户业务线（用户、认证、权限）
# CONTENT_GROUP：内容业务线（商品、搜索、推荐）
# INFRA_GROUP：基础设施（网关、公共配置）
```
**反例**:
```yaml
# 所有业务线都使用 DEFAULT_GROUP
spring:
  cloud:
    nacos:
      config:
        group: DEFAULT_GROUP                  # 所有服务的配置混在一起
```

### R5: 配置热更新
**级别**: 推荐
**描述**: 需要动态生效的配置（如限流阈值、开关、超时时间）使用 Nacos 配置热更新，修改后无需重启服务即可生效。不需要动态刷新的配置（如数据库连接）不要开启 refresh。
**正例**:
```java
// 需要热更新的配置——使用 @ConfigurationProperties + @RefreshScope
@Data
@Component
@ConfigurationProperties(prefix = "myapp.rate-limit")
@RefreshScope
public class RateLimitConfig {

    private int maxQps = 100;
    private int maxConcurrency = 50;
    private boolean enabled = true;
}

// 功能开关
@Data
@Component
@ConfigurationProperties(prefix = "myapp.feature")
@RefreshScope
public class FeatureToggleConfig {

    private boolean newSearchEnabled = false;
    private boolean v2ApiEnabled = false;
    private List<String> grayUserList = List.of();
}
```
```yaml
# myapp.rate-limit.max-qps: 200  修改后自动生效
# myapp.feature.new-search-enabled: true  修改后自动生效
```
**反例**:
```java
// 所有配置都加 @RefreshScope，包括不需要热更新的
@Data
@Component
@ConfigurationProperties(prefix = "spring.datasource")
@RefreshScope                                // 数据源配置不应该热更新
public class DataSourceConfig {
    private String url;
    private String username;
    private String password;
}

// 问题：热更新数据源配置可能导致连接泄漏
// 数据源重建期间正在使用旧连接的请求会失败
```

### R6: 共享配置管理
**级别**: 推荐
**描述**: 多个服务共用的基础设施配置（Redis、MQ、公共日志等）抽取为共享配置，通过 shared-configs 或 extension-configs 引用。
**正例**:
```yaml
# 服务配置引用共享配置
spring:
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_ADDR}
        namespace: ${NACOS_NAMESPACE}
        group: TRADE_GROUP
        file-extension: yaml
        shared-configs:
          - data-id: common-redis.yaml
            group: INFRA_GROUP
            refresh: true
          - data-id: common-rabbitmq.yaml
            group: INFRA_GROUP
            refresh: false                    # MQ 配置一般不需要热更新
          - data-id: common-logging.yaml
            group: INFRA_GROUP
            refresh: true
        extension-configs:
          - data-id: custom-threadpool.yaml
            group: INFRA_GROUP
            refresh: true
```
```yaml
# common-redis.yaml（INFRA_GROUP 下的共享配置）
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: 0
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 3000ms
      shutdown-timeout: 200ms
```
**反例**:
```yaml
# 每个服务各自配置 Redis，参数不统一
# user-service.yaml
spring:
  redis:
    host: redis-server
    pool:
      max-active: 20

# order-service.yaml
spring:
  redis:
    host: redis-server
    pool:
      max-active: 50             # 不一致

# product-service.yaml
spring:
  redis:
    host: redis-server
    pool:
      max-active: 10             # 不一致
```

### R7: 权重配置（灰度发布）
**级别**: 推荐
**描述**: 利用 Nacos 实例权重（weight）实现灰度发布，新版本实例设置低权重引流少量流量验证，验证通过后逐步调高权重直至全量。
**正例**:
```yaml
# 灰度实例配置——新版本设置低权重
spring:
  cloud:
    nacos:
      discovery:
        weight: 10                # 正常实例 weight=100，灰度实例 weight=10
        metadata:
          version: v2.1.0        # 标记版本
          gray: "true"           # 标记灰度
```
```java
// 基于权重的负载均衡——Nacos 内置支持
// NacosRule 会根据实例权重分配流量
// weight=10 的实例收到约 10/(100+10) ≈ 9% 的流量
```
```bash
# 灰度发布流程
# 1. 部署 1 台新版本实例，weight=10
# 2. 观察日志和监控，确认无异常
# 3. 通过 Nacos 控制台调高 weight 至 50
# 4. 继续观察，无问题后调至 100
# 5. 逐步将旧版本实例下线
```
**反例**:
```yaml
# 灰度实例和正常实例权重相同，无法控制流量比例
spring:
  cloud:
    nacos:
      discovery:
        weight: 100              # 灰度实例也设为 100
        # 新版本直接承担全部流量，无法渐进式验证
```

### R8: 服务元数据配置
**级别**: 推荐
**描述**: 实例注册时携带版本、区域、环境等元数据，用于灰度路由、同城优先、流量隔离等高级场景。
**正例**:
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        metadata:
          version: ${APP_VERSION:v1.0.0}     # 版本号
          region: cn-east-1                    # 区域
          zone: zone-a                         # 可用区
          env: ${spring.profiles.active}       # 环境
          gray: "false"                        # 灰度标记
          weight: "100"                        # 权重
```
```java
// 基于元数据的路由——版本号路由
@Component
public class VersionLoadBalancer implements ReactorServiceInstanceLoadBalancer {

    @Value("${target.version:}")
    private String targetVersion;

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        List<ServiceInstance> instances = getInstances();
        if (StringUtils.hasText(targetVersion)) {
            List<ServiceInstance> matched = instances.stream()
                .filter(i -> targetVersion.equals(i.getMetadata().get("version")))
                .collect(Collectors.toList());
            if (!matched.isEmpty()) {
                return Mono.just(new DefaultResponse(selectOne(matched)));
            }
        }
        return Mono.just(new DefaultResponse(selectOne(instances)));
    }
}
```
**反例**:
```yaml
# 不配置元数据，无法实现版本路由和灰度
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
        # 没有任何 metadata

# 在代码中硬编码路由条件
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping(value = "/api/users/{id}",
        headers = "X-Version=v2")              # 硬编码版本号
    Result<UserDTO> getById(@PathVariable("id") Long id);
}
```

### R9: Nacos 持久化使用 MySQL
**级别**: 必须
**描述**: 生产环境 Nacos 必须使用 MySQL 作为持久化存储，内置的嵌入式 Derby 数据库无法支持集群模式，存在数据丢失风险。
**正例**:
```properties
# Nacos Server 配置——application.properties
# 外置 MySQL 数据源
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://mysql-master:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai
db.user.0=${MYSQL_USERNAME}
db.password.0=${MYSQL_PASSWORD}

# MySQL 建表（Nacos 自带 SQL 脚本）
# conf/mysql-schema.sql
```
```sql
-- 建库建表
CREATE DATABASE IF NOT EXISTS nacos DEFAULT CHARACTER SET utf8mb4;
USE nacos;
-- 执行 conf/mysql-schema.sql 创建表
```
**反例**:
```properties
# 使用默认嵌入式 Derby 数据库（生产环境禁止）
# spring.datasource.platform=     # 不配置或留空

# 问题：
# 1. 不支持集群模式
# 2. 数据存储在文件系统，重启可能丢失
# 3. 无备份和恢复机制
```

### R10: 集群至少 3 节点
**级别**: 必须
**描述**: 生产环境 Nacos 集群至少部署 3 个节点，保证 RAFT 协议正常选举和多数派写入。节点数建议为奇数（3/5/7）。
**正例**:
```bash
# cluster.conf（每个节点相同配置）
nacos-node1:8848
nacos-node2:8848
nacos-node3:8848
```
```yaml
# 客户端配置多个节点地址
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos-node1:8848,nacos-node2:8848,nacos-node3:8848
      config:
        server-addr: nacos-node1:8848,nacos-node2:8848,nacos-node3:8848
```
```yaml
# K8s StatefulSet 部署 Nacos 集群
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nacos
spec:
  replicas: 3                               # 至少 3 个副本
  serviceName: nacos-headless
  template:
    spec:
      containers:
        - name: nacos
          image: nacos/nacos-server:v2.3.0
          env:
            - name: NACOS_SERVERS
              value: "nacos-0.nacos-headless:8848 nacos-1.nacos-headless:8848 nacos-2.nacos-headless:8848"
            - name: MYSQL_SERVICE_HOST
              value: "mysql-service"
```
**反例**:
```yaml
# 生产环境单节点部署
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848              # 单节点，无高可用

# 只有 2 个节点，无法形成 RAFT 多数派
# 一个节点宕机后只剩 1 个，无法选举 leader
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos1:8848,nacos2:8848
```