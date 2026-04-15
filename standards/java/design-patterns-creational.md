---
id: java-design-patterns-creational
title: Java - 创建型设计模式
tags: [java, design-pattern, creational, factory, singleton, builder]
trigger:
  extensions: [.java]
  frameworks: []
skip:
  keywords: [增删改查, CRUD, 列表, 表单, 配置, Controller, Service, DTO]
---

# Java - 创建型设计模式

## 适用范围
- 适用于所有 Java 项目中涉及对象创建的场景
- 与编码风格规范、最佳实践规范配合使用
- 涵盖 GoF 5 种创建型模式：单例、工厂方法、抽象工厂、建造者、原型
- 结构型模式见 `design-patterns-structural.md`，行为型模式见 `design-patterns-behavioral.md`

## 规则

### R1: 单例模式（Singleton）
**级别**: 推荐
**描述**: 确保一个类只有一个实例，并提供全局访问点。
**正例**:
```java
// 纯 Java——枚举实现（最简洁安全）
public enum DatabaseInstance {
    INSTANCE;
    public Connection getConnection() { return null; }
}

// Spring Boot——容器托管单例（最常用）
@Service // Spring 默认单例
public class UserService {}
```
**反例**:
```java
// 手写双重检查锁，容易出错
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) { instance = new Singleton(); }
            }
        }
        return instance;
    }
}
```

### R2: 工厂方法模式（Factory Method）
**级别**: 推荐
**描述**: 定义创建对象的接口，让子类决定实例化哪个类。适用于根据条件创建不同类型对象的场景。
**正例**:
```java
// 纯 Java
public interface Notification { void send(String message); }
public class EmailNotification implements Notification { public void send(String msg) { /* ... */ } }
public class SmsNotification implements Notification { public void send(String msg) { /* ... */ } }
public class NotificationFactory {
    public Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException("不支持: " + type);
        };
    }
}

// Spring Boot——利用 Spring 容器自动注入
@Component("email") public class EmailNotification implements Notification { /* ... */ }
@Component("sms") public class SmsNotification implements Notification { /* ... */ }
@Service
public class NotificationFactory {
    @Autowired private Map<String, Notification> notificationMap;
    public Notification create(String type) { return notificationMap.get(type); }
}
```
**反例**:
```java
// 直接在业务代码中 new 对象，类型增加时需要改此处
if ("email".equals(type)) { new EmailNotification().send(msg); }
else if ("sms".equals(type)) { new SmsNotification().send(msg); }
```

### R3: 抽象工厂模式（Abstract Factory）
**级别**: 建议
**描述**: 创建一组相关或相互依赖的对象的接口，无需指定具体类。适用于需要创建一整套相关对象且需要统一切换的场景。
**正例**:
```java
// 纯 Java——多主题 UI 组件
public interface UIComponentFactory {
    Button createButton();
    TextBox createTextBox();
}
public class LightThemeFactory implements UIComponentFactory {
    public Button createButton() { return new LightButton(); }
    public TextBox createTextBox() { return new LightTextBox(); }
}
public class DarkThemeFactory implements UIComponentFactory {
    public Button createButton() { return new DarkButton(); }
    public TextBox createTextBox() { return new DarkTextBox(); }
}

// Spring Boot——多数据库方言
public interface DatabaseDialectFactory {
    QueryBuilder createQueryBuilder();
    SchemaExporter createSchemaExporter();
}
@Component
@ConditionalOnProperty(name = "db.type", havingValue = "mysql")
public class MySqlDialectFactory implements DatabaseDialectFactory { /* ... */ }
```
**反例**:
```java
// 硬编码创建不同主题的组件，切换主题需要改多处
if (theme.equals("dark")) {
    btn = new DarkButton(); txt = new DarkTextBox();
} else {
    btn = new LightButton(); txt = new LightTextBox();
}
```

### R4: 建造者模式（Builder）
**级别**: 必须
**描述**: 将复杂对象的构建与表示分离，支持链式调用。适用于构造函数参数超过 4 个的场景。
**正例**:
```java
// 纯 Java——手动 Builder
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private HttpRequest(Builder builder) {
        this.url = builder.url; this.method = builder.method;
        this.headers = builder.headers; this.body = builder.body;
    }
    public static class Builder {
        private final String url;
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();
        private String body;
        public Builder(String url) { this.url = url; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder header(String key, String value) { headers.put(key, value); return this; }
        public Builder body(String body) { this.body = body; return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}

// Spring Boot——Lombok @Builder
@Getter @Builder
public class MailMessage {
    private String to;
    private String subject;
    private String content;
    private String cc;
    private List<File> attachments;
}
// 使用
MailMessage msg = MailMessage.builder()
    .to("user@example.com").subject("通知").build();
```
**反例**:
```java
// 参数多、顺序难记、可选参数需要传 null
new MailMessage("a@b.com", "标题", "内容", null, null);
```

### R5: 原型模式（Prototype）
**级别**: 建议
**描述**: 通过克隆已有对象来创建新对象，而非重新构建。适用于需要创建大量相似对象且构建成本高的场景。
**正例**:
```java
public class Config implements Cloneable {
    private String name;
    private Map<String, String> properties;
    @Override
    public Config clone() {
        try {
            Config copy = (Config) super.clone();
            copy.properties = new HashMap<>(this.properties); // 深拷贝
            return copy;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}
```
**反例**:
```java
// 每次手动逐字段复制，容易遗漏
Config copy = new Config();
copy.setName(original.getName());
copy.setProperties(new HashMap<>(original.getProperties())); // 容易漏字段
```