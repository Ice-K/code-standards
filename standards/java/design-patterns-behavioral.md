---
id: java-design-patterns-behavioral
title: Java - 行为型设计模式
tags: [java, design-pattern, behavioral, strategy, observer, chain]
trigger:
  extensions: [.java]
  frameworks: []
skip:
  keywords: [增删改查, CRUD, 列表, 表单, 配置, Controller, Service, DTO]
---

# Java - 行为型设计模式

## 适用范围
- 适用于所有 Java 项目中涉及对象间通信和职责分配的场景
- 与编码风格规范、最佳实践规范配合使用
- 涵盖 6 种高频行为型模式：责任链、命令、观察者、状态、策略、模板方法
- 创建型模式见 `design-patterns-creational.md`，结构型模式见 `design-patterns-structural.md`

## 规则

### R1: 责任链模式（Chain of Responsibility）
**级别**: 推荐
**描述**: 将请求沿处理链传递，每个处理者决定是否处理或传递给下一个。适用于多步骤校验/审批流程。
**正例**:
```java
// 纯 Java
public abstract class Handler {
    private Handler next;
    public Handler setNext(Handler next) { this.next = next; return next; }
    public void handle(Request request) {
        if (doHandle(request) && next != null) { next.handle(request); }
    }
    protected abstract boolean doHandle(Request request);
}
// 使用：validator.setNext(authHandler).setNext(logger);

// Spring Boot——自动注入处理链
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

### R2: 命令模式（Command）
**级别**: 建议
**描述**: 将请求封装为对象，支持排队、记录日志、撤销/重做。适用于需要 Undo/Redo 功能的场景。
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

### R3: 观察者模式（Observer）
**级别**: 必须
**描述**: 定义对象间一对多的依赖，当一个对象状态改变时自动通知所有依赖者。适用于一处变更需要触发多处响应的场景。
**正例**:
```java
// 纯 Java
public interface OrderListener { void onOrderCreated(Order order); }
public class OrderPublisher {
    private final List<OrderListener> listeners = new ArrayList<>();
    public void addListener(OrderListener l) { listeners.add(l); }
    public void createOrder(Order order) {
        save(order);
        listeners.forEach(l -> l.onOrderCreated(order));
    }
}

// Spring Boot——使用 ApplicationEvent
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
    sendSms(order);         // 新增通知方式需要改此处
}
```

### R4: 状态模式（State）
**级别**: 推荐
**描述**: 允许对象在状态改变时改变行为。适用于对象有多个状态且状态转换逻辑复杂的场景。
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

### R5: 策略模式（Strategy）
**级别**: 必须
**描述**: 定义一系列算法，将每个算法封装并使其可互换。适用于同一操作有多种实现方式、大量 if-else/switch 分支的场景。
**正例**:
```java
// 纯 Java
public interface SortStrategy { void sort(int[] array); }
public class QuickSort implements SortStrategy { /* ... */ }
public class MergeSort implements SortStrategy { /* ... */ }
public class Sorter {
    private SortStrategy strategy;
    public void setStrategy(SortStrategy strategy) { this.strategy = strategy; }
    public void sort(int[] array) { strategy.sort(array); }
}

// Spring Boot——自动注入策略
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

### R6: 模板方法模式（Template Method）
**级别**: 推荐
**描述**: 定义算法骨架，将某些步骤延迟到子类实现。适用于多个类有相似执行流程的场景。
**正例**:
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

// Spring Boot 泛型版本
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
    public ImportResult importFile(File file) { /* 校验 + 解析 + 过滤 + 保存 全部写一遍 */ }
}
public class OrderImporter {
    public ImportResult importFile(File file) { /* 又写一遍类似流程 */ }
}
```