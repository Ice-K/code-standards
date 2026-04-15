---
id: java-design-patterns-structural
title: Java - 结构型设计模式
tags: [java, design-pattern, structural, adapter, proxy, decorator]
trigger:
  extensions: [.java]
  frameworks: []
skip:
  keywords: [增删改查, CRUD, 列表, 表单, 配置, Controller, Service, DTO]
---

# Java - 结构型设计模式

## 适用范围
- 适用于所有 Java 项目中涉及类和对象组合的场景
- 与编码风格规范、最佳实践规范配合使用
- 涵盖 6 种结构型模式：适配器、桥接、组合、装饰器、门面、代理
- 创建型模式见 `design-patterns-creational.md`，行为型模式见 `design-patterns-behavioral.md`

## 规则

### R1: 适配器模式（Adapter）
**级别**: 推荐
**描述**: 将一个类的接口转换为客户端期望的接口，使不兼容的类协同工作。适用于对接外部系统/第三方 SDK。
**正例**:
```java
// 纯 Java
public interface SmsSender {
    boolean send(String phone, String content);
}
public class AliyunSmsAdapter implements SmsSender {
    private final AliyunSmsClient client = new AliyunSmsClient();
    @Override
    public boolean send(String phone, String content) {
        AliyunResult result = client.sendMsg(phone, content, "sign", "tpl");
        return result.isSuccess();
    }
}

// Spring Boot——切换供应商只需换实现类
@Service @Primary
public class AliyunSmsAdapter implements SmsSender { /* 同上 */ }
```
**反例**:
```java
// 直接耦合第三方 SDK，更换供应商需要大改
AliyunSmsClient client = new AliyunSmsClient();
client.sendMsg(phone, content, "sign", "tpl");
```

### R2: 桥接模式（Bridge）
**级别**: 建议
**描述**: 将抽象与实现分离，使两者可以独立变化。适用于一个类有两个独立变化维度，继承导致子类爆炸的场景。
**正例**:
```java
// 消息抽象（维度1）与发送渠道（维度2）独立变化
public interface MessageChannel {
    void deliver(String content);
}
public class EmailChannel implements MessageChannel {
    public void deliver(String content) { /* 发邮件 */ }
}
public class SmsChannel implements MessageChannel {
    public void deliver(String content) { /* 发短信 */ }
}
public abstract class Message {
    protected MessageChannel channel;
    protected Message(MessageChannel channel) { this.channel = channel; }
    abstract void send();
}
public class AlertMessage extends Message {
    public AlertMessage(MessageChannel channel) { super(channel); }
    void send() { channel.deliver("[告警] " + buildContent()); }
}
```
**反例**:
```java
// 继承爆炸：EmailAlert、SmsAlert、EmailNotice、SmsNotice...
public class EmailAlertMessage { /* ... */ }
public class SmsAlertMessage { /* ... */ }
```

### R3: 组合模式（Composite）
**级别**: 建议
**描述**: 将对象组合成树形结构以表示"部分-整体"层次。适用于处理树形结构数据（菜单、组织架构、文件系统）。
**正例**:
```java
public interface FileSystemNode {
    long getSize();
    String getName();
}
public class File implements FileSystemNode {
    private String name;
    private long size;
    public long getSize() { return size; }
    public String getName() { return name; }
}
public class Directory implements FileSystemNode {
    private String name;
    private List<FileSystemNode> children = new ArrayList<>();
    public void add(FileSystemNode node) { children.add(node); }
    public long getSize() { return children.stream().mapToLong(FileSystemNode::getSize).sum(); }
    public String getName() { return name; }
}
```
**反例**:
```java
// 文件和文件夹用不同类型处理，到处 instanceof 判断
if (node instanceof File) { return ((File) node).getSize(); }
else if (node instanceof Directory) { /* 递归遍历 */ }
```

### R4: 装饰器模式（Decorator）
**级别**: 推荐
**描述**: 动态地给对象增加功能，比继承更灵活。适用于需要给对象动态添加功能且功能可以组合的场景。
**正例**:
```java
public interface DataSource {
    String read();
    void write(String data);
}
public class LoggingDecorator implements DataSource {
    private final DataSource delegate;
    public LoggingDecorator(DataSource delegate) { this.delegate = delegate; }
    public String read() { log.info("读取数据"); return delegate.read(); }
    public void write(String data) { log.info("写入数据"); delegate.write(data); }
}
public class CompressionDecorator implements DataSource {
    private final DataSource delegate;
    public CompressionDecorator(DataSource delegate) { this.delegate = delegate; }
    public String read() { return decompress(delegate.read()); }
    public void write(String data) { delegate.write(compress(data)); }
}
// 可自由组合：new CompressionDecorator(new LoggingDecorator(new FileDataSource()))
```
**反例**:
```java
// 用继承导致类爆炸：LoggingDataSource、CompressedDataSource、LoggingCompressedDataSource...
public class LoggingFileDataSource extends FileDataSource { /* ... */ }
```

### R5: 门面模式（Facade）
**级别**: 推荐
**描述**: 为子系统提供统一的高层接口，简化复杂系统的使用。适用于调用方需要与多个子系统交互的复杂流程。
**正例**:
```java
public class OrderServiceFacade {
    private final InventoryService inventory;
    private final PaymentService payment;
    private final ShippingService shipping;
    private final NotificationService notification;

    public OrderResult placeOrder(OrderRequest request) {
        inventory.checkAndLock(request.getItems());
        payment.charge(request.getPayment());
        shipping.arrange(request.getAddress());
        notification.sendConfirmation(request.getUserId());
        return OrderResult.success();
    }
}
```
**反例**:
```java
// 调用方需要了解每个子系统的细节，新增步骤需要改所有调用方
inventory.checkAndLock(items);
payment.charge(paymentInfo);
shipping.arrange(address);
notification.sendConfirmation(userId);
```

### R6: 代理模式（Proxy）
**级别**: 推荐
**描述**: 为对象提供代理以控制访问。适用于延迟加载、访问控制、日志记录、远程调用等场景。
**正例**:
```java
// 纯 Java——虚拟代理（延迟加载）
public interface Image { void display(); }
public class RealImage implements Image {
    private final String filename;
    public RealImage(String filename) { this.filename = filename; loadFromDisk(); }
    public void display() { /* 显示图片 */ }
}
public class ImageProxy implements Image {
    private RealImage realImage;
    private final String filename;
    public ImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (realImage == null) { realImage = new RealImage(filename); }
        realImage.display();
    }
}

// Spring Boot——AOP 代理
@Aspect @Component
public class LoggingAspect {
    @Around("@annotation(com.example.LogExecution)")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        log.info("调用: {}", pjp.getSignature());
        return pjp.proceed();
    }
}
```
**反例**:
```java
// 所有逻辑混在一起，没有分离关注点
public void display() {
    loadFromDisk(); // 即使不需要也加载
    checkPermission();
    log.info("显示图片");
    // 显示逻辑
}
```