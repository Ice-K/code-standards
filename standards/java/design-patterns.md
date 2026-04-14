# Java - 设计模式使用规范

## 适用范围
- 适用于 Spring Boot 项目中设计模式的应用
- 与编码风格规范、最佳实践规范配合使用
- 关注 Spring Boot 生态下的最佳实现方式

## 规则

### R1: 单例模式推荐使用枚举实现
**级别**: 必须
**描述**: 不使用双重检查锁或懒汉式，推荐使用枚举或 Spring 默认单例。
**正例**:
```java
// Spring 默认单例，最常用
@Service
public class UserService {}
// 或枚举单例（无 Spring 场景）
public enum DatabaseInstance {
    INSTANCE;
    public Connection getConnection() { return null; }
}
```
**反例**:
```java
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### R2: 工厂模式创建复杂对象
**级别**: 推荐
**描述**: Service 层使用工厂方法创建复杂对象，将创建逻辑与业务逻辑分离。
**正例**:
```java
@Component
public class NotificationFactory {
    public Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException("不支持的通知类型");
        };
    }
}
```
**反例**:
```java
@Service
public class NotifyService {
    public void send(String type) {
        if ("email".equals(type)) {
            EmailNotification n = new EmailNotification();
            n.setHost("smtp.example.com");
            n.setPort(25);
        } else if ("sms".equals(type)) {
            SmsNotification n = new SmsNotification();
            n.setUrl("http://sms.api");
        }
    }
}
```

### R3: 策略模式消除过长 if-else
**级别**: 必须
**描述**: 超过 3 个分支的条件判断应使用策略模式重构，结合 Spring 注入管理策略。
**正例**:
```java
public interface PayStrategy {
    boolean supports(String type);
    PayResult pay(PayRequest request);
}
@Service
public class PayService {
    private final List<PayStrategy> strategies;
    public PayService(List<PayStrategy> strategies) {
        this.strategies = strategies;
    }
    public PayResult pay(String type, PayRequest request) {
        return strategies.stream()
            .filter(s -> s.supports(type)).findFirst()
            .orElseThrow().pay(request);
    }
}
```
**反例**:
```java
@Service
public class PayService {
    public PayResult pay(String type, PayRequest request) {
        if ("alipay".equals(type)) { /* ... */ }
        else if ("wechat".equals(type)) { /* ... */ }
        else if ("union".equals(type)) { /* ... */ }
        else if ("bank".equals(type)) { /* ... */ }
        else { throw new UnsupportedOperationException(); }
    }
}
```

### R4: 建造者模式处理多参数对象
**级别**: 必须
**描述**: 超过 4 个参数的对象构建使用建造者模式，推荐使用 Lombok @Builder。
**正例**:
```java
@Getter
@Builder
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
public class MailMessage {
    public MailMessage(String to, String subject, String content,
                       String cc, List<File> attachments) {}
}
// 调用方需要记住参数顺序
new MailMessage("a@b.com", "标题", "内容", null, null);
```

### R5: 模板方法模式标准化流程
**级别**: 推荐
**描述**: 审批、导入导出等标准化流程使用模板方法模式。
**正例**:
```java
public abstract class AbstractImporter {
    public final ImportResult importFile(MultipartFile file) {
        validate(file);
        List<Data> data = parse(file);
        List<Data> filtered = filter(data);
        return save(filtered);
    }
    protected abstract void validate(MultipartFile file);
    protected abstract List<Data> parse(MultipartFile file);
    protected List<Data> filter(List<Data> data) { return data; }
    protected abstract ImportResult save(List<Data> data);
}
```
**反例**:
```java
@Service
public class UserImporter {
    public ImportResult importFile(MultipartFile file) {
        // 校验、解析、过滤、保存全部写在一个方法中
    }
}
```

### R6: 观察者模式使用 Spring 事件
**级别**: 推荐
**描述**: 使用 Spring ApplicationEvent 机制替代手动实现观察者模式。
**正例**:
```java
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;
}
@Component
public class OrderService {
    @Autowired private ApplicationEventPublisher publisher;
    public void createOrder(Order order) {
        save(order);
        publisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}
@Component
public class NotificationListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        sendNotification(event.getOrder());
    }
}
```
**反例**:
```java
// 手动维护监听器列表
public class OrderService {
    private List<Listener> listeners = new ArrayList<>();
    public void createOrder(Order order) {
        save(order);
        for (Listener l : listeners) { l.onEvent(order); }
    }
}
```

### R7: 装饰器模式功能增强
**级别**: 推荐
**描述**: 需要增强功能时使用装饰器模式而非继承，避免类爆炸。
**正例**:
```java
public interface CacheService {
    String get(String key);
}
@Service
public class LoggingCacheDecorator implements CacheService {
    private final CacheService delegate;
    @Override
    public String get(String key) {
        log.info("缓存查询: key={}", key);
        return delegate.get(key);
    }
}
```
**反例**:
```java
public class LoggingRedisCacheService extends RedisCacheService {
    @Override
    public String get(String key) {
        log.info("缓存查询: key={}", key);
        return super.get(key);
    }
}
```

### R8: 适配器模式隔离外部系统差异
**级别**: 推荐
**描述**: 对接外部系统时使用适配器模式隔离接口差异。
**正例**:
```java
public interface SmsSender {
    boolean send(String phone, String content);
}
@Component
public class AliyunSmsAdapter implements SmsSender {
    @Override
    public boolean send(String phone, String content) {
        // 转换为阿里云短信SDK调用格式
    }
}
```
**反例**:
```java
@Service
public class SmsService {
    public boolean send(String phone, String content) {
        // 直接耦合阿里云SDK，更换供应商需要大改
        AliyunSmsClient client = new AliyunSmsClient();
        client.sendSms(phone, content, "sign", "template");
    }
}
```

### R9: 责任链模式处理多步骤流程
**级别**: 建议
**描述**: 多步骤校验、审批等流程使用责任链模式。
**正例**:
```java
public abstract class OrderHandler {
    private OrderHandler next;
    public OrderHandler setNext(OrderHandler next) {
        this.next = next; return next;
    }
    public void handle(Order order) {
        doHandle(order);
        if (next != null) next.handle(order);
    }
    protected abstract void doHandle(Order order);
}
```
**反例**:
```java
public void validateOrder(Order order) {
    validateStock(order);
    validatePrice(order);
    validateAddress(order);
    validateCoupon(order);
    // 新增校验需要修改此方法，违反开闭原则
}
```

### R10: DTO 转换使用 MapStruct
**级别**: 必须
**描述**: DTO 与实体之间的转换使用 MapStruct，禁止手动映射。
**正例**:
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User entity);
    User toEntity(UserDTO dto);
    @Mapping(target = "updateTime", ignore = true)
    void updateEntity(UserDTO dto, @MappingTarget User entity);
}
```
**反例**:
```java
public UserDTO toDTO(User entity) {
    UserDTO dto = new UserDTO();
    dto.setId(entity.getId());
    dto.setName(entity.getName());
    dto.setEmail(entity.getEmail());
    // 字段多时极易遗漏或写错
    return dto;
}
```