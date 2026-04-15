---
id: springboot-config-management
title: Spring Boot - 配置管理规范
tags: [springboot, config, yml, properties, configuration]
trigger:
  extensions: [.yml, .yaml, .properties, .java]
  frameworks: [springboot]
skip:
  keywords: [组件, 页面, UI, CSS, 样式, REST, 接口, Controller, Mapper]
---

# Spring Boot - 配置管理规范

## 适用范围
- 适用于所有 Spring Boot 项目的配置文件管理
- 与项目目录结构约定、最佳实践规范配合使用
- 涵盖自定义配置绑定、敏感信息管理、配置注释等方面
- YAML 格式、多环境 profile 拆分、profiles.active 激活等基础实践不再列出，AI 默认遵守

## 规则

### R1: 自定义配置使用 @ConfigurationProperties
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

### R2: 敏感配置使用环境变量或加密
**级别**: 必须
**描述**: 数据库密码、API 密钥等敏感信息不能明文写在配置文件中，使用环境变量替换或 Jasypt 加密。
**正例**:
```yaml
# 使用环境变量
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

### R3: 配置变更需有注释说明
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
myapp:
  cache:
    type: redis
    ttl: 3600
  upload:
    max-size: 10MB
```

### R4: 不在代码中硬编码配置值
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