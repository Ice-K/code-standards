# Java - 设计模式使用规范

## 适用范围
- 适用于所有 Java 项目（纯 Java 及 Spring Boot/Spring Cloud 项目）
- 与编码风格规范、最佳实践规范配合使用
- 涵盖 GoF 23 种设计模式，指导 AI 在编码时自动识别场景并应用合适的设计模式

## 自动检测机制

AI 在编码时应主动检测以下信号，判断是否需要引入设计模式：

| 代码信号 | 可能需要的设计模式 |
|---------|----------------|
| 大量 if-else / switch 分支（>3个） | 策略模式、状态模式 |
| new 大量不同对象，创建逻辑分散 | 工厂方法、抽象工厂 |
| 对象构建参数过多（>4个） | 建造者模式 |
| 需要唯一实例，多处创建同一对象 | 单例模式 |
| 直接依赖具体实现，耦合度高 | 适配器模式、桥接模式 |
| 功能需要动态增减 | 装饰器模式 |
| 子类爆炸，继承层级过深 | 装饰器模式、组合模式 |
| 外部系统/第三方 SDK 耦合 | 适配器模式、门面模式 |
| 多步骤流程，步骤可能变化 | 模板方法、责任链 |
| 一处变更需要通知多处 | 观察者模式 |
| 操作需要撤销/重做 | 命令模式、备忘录模式 |
| 对象状态转换逻辑复杂 | 状态模式 |
| 需要统一遍历不同集合 | 迭代器模式 |
| 大量相似对象占用内存 | 享元模式 |
| 需要控制对象访问（延迟加载/权限） | 代理模式 |
| 复杂逻辑需要解释执行 | 解释器模式 |
| 多对象间复杂交互 | 中介者模式 |
| 需要收集不同类型对象的信息 | 访问者模式 |

---

## 一、创建型模式（5种）

### R1: 单例模式（Singleton）
**级别**: 推荐
**描述**: 确保一个类只有一个实例，并提供全局访问点。
**检测触发**: 出现全局配置、连接池、缓存管理器等需要唯一实例的场景。

**正例 — 纯 Java（枚举实现）**:
```java
public enum DatabaseInstance {
    INSTANCE;
    public Connection getConnection() { return null; }
}
```

**正例 — Spring Boot（容器托管单例）**:
```java
@Service // Spring 默认单例，最常用
public class UserService {}
```

**反例**:
```java
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
**描述**: 定义创建对象的接口，让子类决定实例化哪个类。
**检测触发**: 需要根据条件创建不同类型的对象，且创建逻辑可能扩展。

**正例 — 纯 Java**:
```java
public interface Notification {
    void send(String message);
}
public class EmailNotification implements Notification {
    public void send(String message) { /* 发送邮件 */ }
}
public class SmsNotification implements Notification {
    public void send(String message) { /* 发送短信 */ }
}
public class NotificationFactory {
    public Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException("不支持: " + type);
        };
    }
}
```

**正例 — Spring Boot**:
```java
public interface Notification {
    void send(String message);
}
@Component("email")
public class EmailNotification implements Notification { /* ... */ }
@Component("sms")
public class SmsNotification implements Notification { /* ... */ }
@Service
public class NotificationFactory {
    @Autowired private Map<String, Notification> notificationMap;
    public Notification create(String type) {
        return notificationMap.get(type);
    }
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
**描述**: 创建一组相关或相互依赖的对象的接口，无需指定具体类。
**检测触发**: 需要创建一整套相关对象（如多主题 UI 组件、多数据库方言），且整套需要统一切换。

**正例 — 纯 Java**:
```java
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
```

**正例 — Spring Boot**:
```java
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
// 到处硬编码创建不同主题的组件，切换主题需要改多处
if (theme.equals("dark")) {
    btn = new DarkButton(); txt = new DarkTextBox();
} else {
    btn = new LightButton(); txt = new LightTextBox();
}
```

### R4: 建造者模式（Builder）
**级别**: 必须
**描述**: 将复杂对象的构建与表示分离，支持链式调用。
**检测触发**: 构造函数参数超过 4 个，或需要分步骤构建复杂对象。

**正例 — 纯 Java（手动 Builder）**:
```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = builder.headers;
        this.body = builder.body;
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
```

**正例 — Spring Boot（Lombok @Builder）**:
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
// 参数多、顺序难记、可选参数需要传 null
new MailMessage("a@b.com", "标题", "内容", null, null);
```

### R5: 原型模式（Prototype）
**级别**: 建议
**描述**: 通过克隆已有对象来创建新对象，而非重新构建。
**检测触发**: 需要创建大量相似对象，且构建成本高（如深拷贝复杂配置对象）。

**正例 — 纯 Java**:
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
// 每次都手动逐字段复制，容易遗漏
Config copy = new Config();
copy.setName(original.getName());
copy.setProperties(new HashMap<>(original.getProperties())); // 容易漏字段
```

---

## 二、结构型模式（7种）

### R6: 适配器模式（Adapter）
**级别**: 推荐
**描述**: 将一个类的接口转换为客户端期望的接口，使不兼容的类协同工作。
**检测触发**: 对接外部系统/第三方 SDK，接口与内部定义不一致。

**正例 — 纯 Java**:
```java
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
```

**正例 — Spring Boot**:
```java
@Service
@Primary
public class AliyunSmsAdapter implements SmsSender { /* 同上 */ }
// 切换供应商只需换实现类
```

**反例**:
```java
// 直接耦合第三方 SDK，更换供应商需要大改
AliyunSmsClient client = new AliyunSmsClient();
client.sendMsg(phone, content, "sign", "tpl");
```

### R7: 桥接模式（Bridge）
**级别**: 建议
**描述**: 将抽象与实现分离，使两者可以独立变化。
**检测触发**: 一个类有两个独立变化的维度（如消息类型 + 发送渠道），继承导致子类爆炸。

**正例**:
```java
// 消息抽象（维度1）与 发送渠道（维度2）独立变化
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

### R8: 组合模式（Composite）
**级别**: 建议
**描述**: 将对象组合成树形结构以表示"部分-整体"层次。
**检测触发**: 需要处理树形结构数据（如菜单、组织架构、文件系统），且需要统一对待单个和组合对象。

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
// 文件和文件夹用不同的类型处理，到处 instanceof 判断
if (node instanceof File) { return ((File) node).getSize(); }
else if (node instanceof Directory) { /* 递归遍历 */ }
```

### R9: 装饰器模式（Decorator）
**级别**: 推荐
**描述**: 动态地给对象增加功能，比继承更灵活。
**检测触发**: 需要给对象动态添加功能（如日志、缓存、压缩），且功能可以组合。

**正例 — 纯 Java**:
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

### R10: 门面模式（Facade）
**级别**: 推荐
**描述**: 为子系统提供统一的高层接口，简化复杂系统的使用。
**检测触发**: 调用方需要与多个子系统交互，流程复杂易出错。

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
// 调用方需要了解每个子系统的细节
inventory.checkAndLock(items);
payment.charge(paymentInfo);
shipping.arrange(address);
notification.sendConfirmation(userId);
// 新增步骤需要改所有调用方
```

### R11: 享元模式（Flyweight）
**级别**: 建议
**描述**: 共享对象以减少内存占用，适用于大量相似对象。
**检测触发**: 系统中存在大量重复的细粒度对象（如棋子、字符、颜色），内存压力大。

**正例**:
```java
public class PieceFactory {
    private static final Map<String, Piece> cache = new HashMap<>();
    public static Piece getPiece(String color, String type) {
        String key = color + ":" + type;
        return cache.computeIfAbsent(key, k -> new Piece(color, type));
    }
}
```

**反例**:
```java
// 每个棋子都 new 一个新对象，大量重复属性浪费内存
Piece p1 = new Piece("black", "rook");
Piece p2 = new Piece("black", "rook"); // 相同属性，重复创建
```

### R12: 代理模式（Proxy）
**级别**: 推荐
**描述**: 为对象提供代理以控制访问。
**检测触发**: 需要延迟加载、访问控制、日志记录、远程调用等场景。

**正例 — 纯 Java（虚拟代理）**:
```java
public interface Image {
    void display();
}
public class RealImage implements Image {
    private final String filename;
    public RealImage(String filename) { this.filename = filename; loadFromDisk(); }
    public void display() { /* 显示图片 */ }
    private void loadFromDisk() { /* 耗时操作 */ }
}
public class ImageProxy implements Image {
    private RealImage realImage;
    private final String filename;
    public ImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (realImage == null) { realImage = new RealImage(filename); } // 延迟加载
        realImage.display();
    }
}
```

**正例 — Spring Boot（AOP 代理）**:
```java
@Aspect
@Component
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

---

## 三、行为型模式（11种）

### R13: 责任链模式（Chain of Responsibility）
**级别**: 推荐
**描述**: 将请求沿处理链传递，每个处理者决定是否处理或传递给下一个。
**检测触发**: 存在多步骤校验/审批流程，步骤数量或顺序可能变化。

**正例 — 纯 Java**:
```java
public abstract class Handler {
    private Handler next;
    public Handler setNext(Handler next) { this.next = next; return next; }
    public void handle(Request request) {
        if (doHandle(request) && next != null) { next.handle(request); }
    }
    protected abstract boolean doHandle(Request request);
}
// 使用：validator.setNext(authHandler).setNext(logger);
```

**正例 — Spring Boot**:
```java
public interface OrderValidator {
    boolean supports(OrderContext context);
    void validate(OrderContext context);
}
@Service
public class OrderValidationChain {
    @Autowired private List<OrderValidator> validators;
    public void validate(OrderContext ctx) {
        validators.stream().filter(v -> v.supports(ctx))
            .forEach(v -> v.validate(ctx));
    }
}
```

**反例**:
```java
public void validateOrder(Order order) {
    validateStock(order);    // 新增/删除步骤需要改此方法
    validatePrice(order);
    validateAddress(order);
    validateCoupon(order);
}
```

### R14: 命令模式（Command）
**级别**: 建议
**描述**: 将请求封装为对象，支持排队、记录日志、撤销/重做。
**检测触发**: 需要 Undo/Redo 功能，或需要将操作队列化、记录操作日志。

**正例**:
```java
public interface Command {
    void execute();
    void undo();
}
public class TextEditor {
    private final StringBuilder text = new StringBuilder();
    private final Stack<Command> history = new Stack<>();

    public void execute(Command cmd) { cmd.execute(); history.push(cmd); }
    public void undo() { if (!history.isEmpty()) { history.pop().undo(); } }

    public void addText(String s) { text.append(s); }
    public void removeText(int len) { text.delete(text.length() - len, text.length()); }
    public String getText() { return text.toString(); }
}
public class AddTextCommand implements Command {
    private final TextEditor editor;
    private final String text;
    public void execute() { editor.addText(text); }
    public void undo() { editor.removeText(text.length()); }
}
```

**反例**:
```java
// 无法撤销，操作没有记录
editor.addText("hello");
editor.addText(" world");
// 想撤销？没有办法
```

### R15: 解释器模式（Interpreter）
**级别**: 建议
**描述**: 定义语言的文法，并解释句子。
**检测触发**: 需要解析和执行特定格式的表达式（如规则引擎、SQL 解析、计算器）。

**正例**:
```java
public interface Expression {
    int interpret(Map<String, Integer> context);
}
public class NumberExpression implements Expression {
    private final int value;
    public int interpret(Map<String, Integer> ctx) { return value; }
}
public class AddExpression implements Expression {
    private final Expression left;
    private final Expression right;
    public int interpret(Map<String, Integer> ctx) { return left.interpret(ctx) + right.interpret(ctx); }
}
// 构建语法树：new AddExpression(new NumberExpression(1), new NumberExpression(2))
```

**反例**:
```java
// 用大量 if/else 解析表达式，难以扩展新语法
if (expr.contains("+")) { /* ... */ }
else if (expr.contains("-")) { /* ... */ }
else if (expr.contains("*")) { /* ... */ }
```

### R16: 迭代器模式（Iterator）
**级别**: 建议
**描述**: 顺序访问集合中的元素，不暴露集合内部结构。
**检测触发**: 需要遍历自定义集合，且不暴露其内部表示。Java 中 Iterable/Iterator 已内置。

**正例**:
```java
public class BookShelf implements Iterable<Book> {
    private final List<Book> books = new ArrayList<>();
    public void add(Book book) { books.add(book); }
    @Override
    public Iterator<Book> iterator() { return books.iterator(); }
}
// 使用：for (Book book : bookShelf) { ... }
```

**反例**:
```java
// 暴露内部 List，调用方可随意修改
public List<Book> getBooks() { return books; }
```

### R17: 中介者模式（Mediator）
**级别**: 建议
**描述**: 用中介对象封装一组对象的交互，避免对象间直接引用。
**检测触发**: 多个组件之间存在复杂的网状交互关系（如聊天室、UI 组件联动）。

**正例**:
```java
public class ChatRoom {
    public static void showMessage(User user, String message) {
        System.out.println(user.getName() + ": " + message);
    }
}
public class User {
    private final String name;
    private final ChatRoom chatRoom;
    public void sendMessage(String msg) { chatRoom.showMessage(this, msg); }
}
```

**反例**:
```java
// 用户之间直接引用，形成网状依赖
public class User {
    private List<User> contacts;
    public void sendMessage(User to, String msg) {
        to.receiveMessage(this, msg); // 直接耦合
    }
}
```

### R18: 备忘录模式（Memento）
**级别**: 建议
**描述**: 在不破坏封装的前提下捕获对象内部状态，以便恢复。
**检测触发**: 需要"保存点"和"回滚"功能（如编辑器快照、事务回滚）。

**正例**:
```java
public class EditorMemento {
    private final String content;
    private final int cursor;
    public EditorMemento(String content, int cursor) {
        this.content = content; this.cursor = cursor;
    }
    public String getContent() { return content; }
    public int getCursor() { return cursor; }
}
public class Editor {
    private String content = "";
    private int cursor = 0;
    public EditorMemento save() { return new EditorMemento(content, cursor); }
    public void restore(EditorMemento memento) {
        this.content = memento.getContent();
        this.cursor = memento.getCursor();
    }
}
```

**反例**:
```java
// 暴露内部状态，违反封装
public class Editor {
    public String content; // public 暴露
    public int cursor;
    public void backup() { savedContent = content; savedCursor = cursor; }
}
```

### R19: 观察者模式（Observer）
**级别**: 必须
**描述**: 定义对象间一对多的依赖，当一个对象状态改变时自动通知所有依赖者。
**检测触发**: 一处变更需要触发多处响应（如下单后发通知、更新积分、发短信）。

**正例 — 纯 Java**:
```java
public interface OrderListener {
    void onOrderCreated(Order order);
}
public class OrderPublisher {
    private final List<OrderListener> listeners = new ArrayList<>();
    public void addListener(OrderListener l) { listeners.add(l); }
    public void createOrder(Order order) {
        save(order);
        listeners.forEach(l -> l.onOrderCreated(order));
    }
}
```

**正例 — Spring Boot**:
```java
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;
    public OrderCreatedEvent(Object source, Order order) { super(source); this.order = order; }
}
@Service
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
    public void onOrderCreated(OrderCreatedEvent event) { sendNotification(event.getOrder()); }
}
```

**反例**:
```java
// 业务逻辑与通知逻辑耦合
public void createOrder(Order order) {
    save(order);
    sendEmail(order);      // 耦合
    updatePoints(order);    // 耦合
    sendSms(order);         // 耦合，新增通知方式需要改此处
}
```

### R20: 状态模式（State）
**级别**: 推荐
**描述**: 允许对象在状态改变时改变行为。
**检测触发**: 对象有多个状态，状态转换逻辑复杂，大量与状态相关的条件判断。

**正例**:
```java
public interface OrderState {
    void next(OrderContext ctx);
    void cancel(OrderContext ctx);
    String getName();
}
public class PendingState implements OrderState {
    public void next(OrderContext ctx) { ctx.setState(new PaidState()); }
    public void cancel(OrderContext ctx) { ctx.setState(new CancelledState()); }
    public String getName() { return "待支付"; }
}
public class PaidState implements OrderState {
    public void next(OrderContext ctx) { ctx.setState(new ShippedState()); }
    public void cancel(OrderContext ctx) { /* 已支付不能直接取消 */ }
    public String getName() { return "已支付"; }
}
```

**反例**:
```java
// 状态判断散落各处，维护困难
public void process() {
    if (state.equals("pending")) { /* 待支付逻辑 */ }
    else if (state.equals("paid")) { /* 已支付逻辑 */ }
    else if (state.equals("shipped")) { /* 已发货逻辑 */ }
}
```

### R21: 策略模式（Strategy）
**级别**: 必须
**描述**: 定义一系列算法，将每个算法封装并使其可互换。
**检测触发**: 同一操作有多种实现方式，大量 if-else/switch 分支（超过 3 个）选择不同行为。

**正例 — 纯 Java**:
```java
public interface SortStrategy {
    void sort(int[] array);
}
public class QuickSort implements SortStrategy { /* ... */ }
public class MergeSort implements SortStrategy { /* ... */ }
public class Sorter {
    private SortStrategy strategy;
    public void setStrategy(SortStrategy strategy) { this.strategy = strategy; }
    public void sort(int[] array) { strategy.sort(array); }
}
```

**正例 — Spring Boot**:
```java
public interface PayStrategy {
    boolean supports(String type);
    PayResult pay(PayRequest request);
}
@Service
public class PayService {
    private final List<PayStrategy> strategies;
    public PayService(List<PayStrategy> strategies) { this.strategies = strategies; }
    public PayResult pay(String type, PayRequest request) {
        return strategies.stream()
            .filter(s -> s.supports(type)).findFirst()
            .orElseThrow(() -> new UnsupportedOperationException("不支持的支付方式"))
            .pay(request);
    }
}
```

**反例**:
```java
public PayResult pay(String type, PayRequest request) {
    if ("alipay".equals(type)) { /* 支付宝逻辑 */ }
    else if ("wechat".equals(type)) { /* 微信逻辑 */ }
    else if ("union".equals(type)) { /* 银联逻辑 */ }
    // 新增支付方式需要改此处，违反开闭原则
}
```

### R22: 模板方法模式（Template Method）
**级别**: 推荐
**描述**: 定义算法骨架，将某些步骤延迟到子类实现。
**检测触发**: 多个类有相似的执行流程，仅部分步骤不同（如审批流程、数据导入导出）。

**正例 — 纯 Java**:
```java
public abstract class AbstractImporter {
    public final ImportResult importFile(File file) {
        validate(file);
        List<Data> data = parse(file);
        List<Data> filtered = filter(data);
        return save(filtered);
    }
    protected abstract void validate(File file);
    protected abstract List<Data> parse(File file);
    protected List<Data> filter(List<Data> data) { return data; } // 钩子方法
    protected abstract ImportResult save(List<Data> data);
}
```

**正例 — Spring Boot**:
```java
public abstract class AbstractImportService<T> {
    public final ImportResult importData(MultipartFile file) {
        validate(file);
        List<T> data = parse(file);
        data = filter(data);
        return batchSave(data);
    }
    protected abstract void validate(MultipartFile file);
    protected abstract List<T> parse(MultipartFile file);
    protected List<T> filter(List<T> data) { return data; }
    protected abstract ImportResult batchSave(List<T> data);
}
```

**反例**:
```java
// 每种导入器都写完整流程，大量重复代码
public class UserImporter {
    public ImportResult importFile(File file) {
        // 校验 + 解析 + 过滤 + 保存 全部写在一个方法
    }
}
public class OrderImporter {
    public ImportResult importFile(File file) {
        // 又写一遍类似流程
    }
}
```

### R23: 访问者模式（Visitor）
**级别**: 建议
**描述**: 在不改变各元素类的前提下定义作用于这些元素的新操作。
**检测触发**: 需要对一组不同类型的对象执行不相关的操作（如导出报表、代码生成），且操作经常变化但类型结构稳定。

**正例**:
```java
public interface ShapeVisitor {
    void visit(Circle circle);
    void visit(Rectangle rectangle);
}
public interface Shape {
    void accept(ShapeVisitor visitor);
}
public class Circle implements Shape {
    private double radius;
    public void accept(ShapeVisitor visitor) { visitor.visit(this); }
    public double getRadius() { return radius; }
}
public class Rectangle implements Shape {
    private double width, height;
    public void accept(ShapeVisitor visitor) { visitor.visit(this); }
}
// 新增操作只需新增 Visitor，不改 Shape 类
public class AreaCalculator implements ShapeVisitor {
    private double totalArea;
    public void visit(Circle c) { totalArea += Math.PI * c.getRadius() * c.getRadius(); }
    public void visit(Rectangle r) { totalArea += r.getWidth() * r.getHeight(); }
}
```

**反例**:
```java
// 在每个 Shape 中加计算方法，新增操作需要改所有 Shape
public class Circle {
    public double calculateArea() { /* ... */ }
    public double calculatePerimeter() { /* ... */ }
    public String exportToJson() { /* ... */ } // 新操作不断添加
}
```