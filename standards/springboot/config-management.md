# Spring Boot - 配置管理规范

## 适用范围
- 适用于所有 Spring Boot 项目的配置文件管理
- 与项目目录结构约定、最佳实践规范配合使用
- 涵盖多环境配置、敏感信息管理、自定义配置等方面

## 规则

### R1: 使用 YAML 格式而非 properties
**级别**: 推荐
**描述**: 项目配置文件统一使用 YAML 格式（application.yml），YAML 具有更好的层级结构和可读性。
**正例**:
```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

myapp:
  cache:
    type: redis
    ttl: 3600
  upload:
    max-size: 10MB
    allowed-types: image/jpeg,image/png
```
**反例**:
```properties
# application.properties - 层级关系不清晰
server.port=8080
server.servlet.context-path=/api
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
myapp.cache.type=redis
myapp.cache.ttl=3600
myapp.upload.max-size=10MB
myapp.upload.allowed-types=image/jpeg,image/png
```

### R2: 自定义配置使用 @ConfigurationProperties
**级别**: 必须
**描述**: 自定义配置项使用 @ConfigurationProperties 绑定到配置类，而非 @Value 逐个注入，便于类型安全和集中管理。
**正例**:
```java
// 配置类
@Data
@Configuration
@ConfigurationProperties(prefix = "myapp.upload")
@Validated
public class UploadConfig {

    @NotBlank(message = "文件上传路径不能为空")
    private String path;

    @NotNull(message = "最大文件大小不能为空")
    private DataSize maxSize = DataSize.ofMegabytes(10);

    private List<String> allowedTypes = List.of("image/jpeg", "image/png");

    private int maxFilesPerRequest = 5;
}

// 使用配置类
@Service
@RequiredArgsConstructor
public class FileService {

    private final UploadConfig uploadConfig;

    public String upload(MultipartFile file) {
        if (file.getSize() > uploadConfig.getMaxSize().toBytes()) {
            throw new BusinessException(400, "文件大小超出限制");
        }
        // ...
    }
}
```
**反例**:
```java
// 使用 @Value 分散注入，缺乏类型安全
@Service
public class FileService {

    @Value("${myapp.upload.path}")
    private String uploadPath;

    @Value("${myapp.upload.max-size:10MB}")
    private String maxSize;

    @Value("${myapp.upload.allowed-types:image/jpeg,image/png}")
    private String allowedTypes;

    @Value("${myapp.upload.max-files-per-request:5}")
    private int maxFilesPerRequest;

    public String upload(MultipartFile file) {
        // 手动解析字符串配置
        long maxBytes = DataSize.parse(maxSize).toBytes();
        List<String> types = Arrays.asList(allowedTypes.split(","));
        // ...
    }
}
```

### R3: 配置项按功能分组管理
**级别**: 推荐
**描述**: 自定义配置项使用统一前缀按功能分组，避免配置项散乱无序。
**正例**:
```yaml
# 按功能模块分组，使用统一前缀
myapp:
  cache:
    type: redis
    ttl: 3600
    max-size: 1000
  upload:
    path: /data/uploads
    max-size: 10MB
    allowed-types: image/jpeg,image/png
  security:
    jwt-secret: ${JWT_SECRET}
    token-expiration: 7200
    refresh-expiration: 604800
  thread-pool:
    core-size: 5
    max-size: 20
    queue-capacity: 100
    thread-name-prefix: myapp-async-
```
**反例**:
```yaml
# 配置项没有统一前缀和分组
cache_type: redis
cache_ttl: 3600
upload_path: /data/uploads
upload_max_size: 10MB
jwt_secret: ${JWT_SECRET}
token_expiration: 7200
thread_core_size: 5
thread_max_size: 20
```

### R4: 敏感配置使用环境变量或 Jasypt 加密
**级别**: 必须
**描述**: 数据库密码、API 密钥等敏感信息不能明文写在配置文件中，使用环境变量替换或 Jasypt 加密。
**正例**:
```yaml
# application.yml - 使用环境变量
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:mydb}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

myapp:
  security:
    jwt-secret: ${JWT_SECRET}
  third-party:
    sms:
      api-key: ${SMS_API_KEY}
      api-secret: ${SMS_API_SECRET}

# 或使用 Jasypt 加密（密码用 ENC() 包裹）
spring:
  datasource:
    password: ENC(G6N718UuyPE5bHyWKyuLQSm02auQPUtm)
```
```java
// Jasypt 配置
@Configuration
public class JasyptConfig {

    @Bean
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(System.getenv("JASYPT_ENCRYPTOR_PASSWORD"));
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        encryptor.setConfig(config);
        return encryptor;
    }
}
```
**反例**:
```yaml
# 敏感信息明文存储
spring:
  datasource:
    url: jdbc:mysql://192.168.1.100:3306/production_db
    username: admin
    password: MyP@ssw0rd123         # 明文密码

myapp:
  security:
    jwt-secret: my-super-secret-key  # 明文密钥
  third-party:
    aliyun:
      access-key: LTAI5tXXXXXXXXXX  # 明文 AK
      secret-key: XXXXXXXXXXXXXXXX   # 明文 SK
```

### R5: 多环境配置使用 profile 文件
**级别**: 必须
**描述**: 使用 application-{profile}.yml 管理不同环境配置，profile 名称约定为 dev（开发）、test（测试）、prod（生产）。
**正例**:
```
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
└── application-prod.yml         # 生产环境
```
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb_dev
    username: dev_user
    password: ${DB_PASSWORD}
  redis:
    host: localhost

logging:
  level:
    com.example: DEBUG

# application-test.yml
spring:
  datasource:
    url: jdbc:mysql://test-server:3306/mydb_test
    username: test_user
    password: ${DB_PASSWORD}
  redis:
    host: test-redis

logging:
  level:
    com.example: INFO

# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  redis:
    host: ${REDIS_HOST}
    password: ${REDIS_PASSWORD}

logging:
  level:
    com.example: WARN
```
**反例**:
```
src/main/resources/
├── application.yml              # 所有环境配置混在一起
├── application.yml.bak          # 备份文件放在 resources 下
├── dev.properties               # 混用 properties 格式
└── prod-config.yml              # 命名不符合 Spring Boot 约定
```
```yaml
# application.yml - 所有环境混在一起，用注释区分
# === 开发环境 ===
# spring.datasource.url=jdbc:mysql://localhost:3306/mydb_dev
# === 测试环境 ===
# spring.datasource.url=jdbc:mysql://test-server:3306/mydb_test
# === 生产环境 ===
spring.datasource.url=jdbc:mysql://prod-server:3306/mydb_prod
```

### R6: 公共配置放 application.yml，环境差异配置放 profile 文件
**级别**: 必须
**描述**: application.yml 存放各环境通用的公共配置，仅环境间有差异的配置放入 profile 文件，profile 文件会覆盖公共配置。
**正例**:
```yaml
# application.yml - 公共配置（不随环境变化）
server:
  port: 8080
  servlet:
    context-path: /api

mybatis-plus:
  mapper-locations: classpath:mapper/**/*.xml
  configuration:
    map-underscore-to-camel-case: true

myapp:
  upload:
    path: /data/uploads
    max-size: 10MB
  security:
    token-expiration: 7200
```
```yaml
# application-dev.yml - 仅开发环境差异配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb_dev
    username: root
    password: 123456

logging:
  level:
    com.example: DEBUG
```
**反例**:
```yaml
# application.yml - 包含了所有配置（应该在 profile 中）
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb_dev    # 开发环境配置
    username: root
    password: 123456                             # 敏感信息

mybatis-plus:
  mapper-locations: classpath:mapper/**/*.xml

logging:
  level:
    com.example: DEBUG                           # 开发环境日志级别

# 部署生产时手动修改配置
```

### R7: 配置变更需有注释说明
**级别**: 建议
**描述**: 关键配置项添加注释说明其用途、取值范围和修改注意事项，便于团队理解和维护。
**正例**:
```yaml
server:
  port: 8080                    # 服务端口号，生产环境建议使用 80/443
  tomcat:
    max-threads: 200            # 最大工作线程数，根据服务器配置调整
    accept-count: 100           # 等待队列长度，超过后新请求将被拒绝

spring:
  datasource:
    hikari:
      maximum-pool-size: 20     # 最大连接数 = ((核心数 * 2) + 有效磁盘数)
      minimum-idle: 5           # 最小空闲连接数
      connection-timeout: 30000 # 连接超时时间（毫秒）
      idle-timeout: 600000      # 空闲连接超时时间（毫秒）
      max-lifetime: 1800000     # 连接最大存活时间（毫秒）

myapp:
  cache:
    type: redis                 # 缓存类型，可选：redis / caffeine
    ttl: 3600                   # 缓存过期时间（秒），0 表示永不过期
  upload:
    max-size: 10MB              # 单个文件最大大小，需同步修改 Nginx 配置
```
**反例**:
```yaml
server:
  port: 8080
  tomcat:
    max-threads: 200
    accept-count: 100
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
myapp:
  cache:
    type: redis
    ttl: 3600
  upload:
    max-size: 10MB
```

### R8: 不在代码中硬编码配置值
**级别**: 必须
**描述**: 避免在代码中硬编码配置值（如 URL、超时时间、阈值等），统一放到配置文件中管理。
**正例**:
```java
// 通过配置类获取
@Data
@Configuration
@ConfigurationProperties(prefix = "myapp.http")
public class HttpConfig {
    private int connectTimeout = 5000;
    private int readTimeout = 10000;
    private int maxRetries = 3;
}

@Service
@RequiredArgsConstructor
public class ExternalApiService {
    private final HttpConfig httpConfig;

    public String callApi(String url) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(httpConfig.getReadTimeout()))
                .build();
        // ...
    }
}
```
**反例**:
```java
@Service
public class ExternalApiService {

    public String callApi(String url) {
        // 硬编码超时时间和重试次数
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(10000))  // 硬编码超时
                .build();

        int maxRetries = 3;  // 硬编码重试次数
        for (int i = 0; i < maxRetries; i++) {
            try {
                return httpClient.send(request, HttpResponse.BodyHandlers.ofString()).body();
            } catch (Exception e) {
                if (i == maxRetries - 1) throw new RuntimeException(e);
            }
        }
        return null;
    }
}
```

### R9: 使用 spring.profiles.active 激活环境
**级别**: 必须
**描述**: 通过 spring.profiles.active 指定当前激活的环境 profile，不要通过修改配置文件内容来切换环境。
**正例**:
```yaml
# application.yml - 默认激活 dev 环境
spring:
  profiles:
    active: dev
```
```bash
# 通过命令行参数覆盖，生产环境启动方式
java -jar myapp.jar --spring.profiles.active=prod

# 通过环境变量
export SPRING_PROFILES_ACTIVE=prod
java -jar myapp.jar

# Docker 启动
docker run -e SPRING_PROFILES_ACTIVE=prod myapp:latest

# K8s 部署
apiVersion: v1
kind: Deployment
spec:
  containers:
    - name: myapp
      env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
```
**反例**:
```bash
# 每次部署手动修改 application.yml 切换环境
# vim application.yml
#   spring.profiles.active: prod   # 手动改为 prod

# 打包时包含多个配置文件，手动选择
java -jar myapp.jar --spring.config.location=classpath:/application-prod.yml

# 在代码中判断环境
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        String env = System.getProperty("env", "dev");
        SpringApplication app = new SpringApplication(Application.class);
        app.setAdditionalProfiles(env);  // 手动设置 profile
        app.run(args);
    }
}
```