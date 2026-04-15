# 编码规范

> Profile: recommended | 自动生成: 2026-04-15

## CSS

# CSS - 编码风格与命名规范

## 适用范围
- 适用于所有 CSS/Less/Sass 项目的编码风格与命名约束
- 参考 BEM 命名方法论与 Bootstrap CSS 编码规范
- 缩进、颜色格式等基础格式不再列出，AI 默认遵守

## 规则

### R1: 属性声明遵循规范顺序
**级别**: 必须
**描述**: CSS 属性按照"定位 > 盒模型 > 排版 > 视觉 > 动画"顺序书写。
**正例**:
```css
.user-card {
  /* 定位 */
  position: relative;
  z-index: 10;

  /* 盒模型 */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0 auto;

  /* 排版 */
  font-size: 14px;
  line-height: 1.5;

  /* 视觉 */
  color: #333;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;

  /* 动画 */
  transition: all 0.3s ease;
}
```
**反例**:
```css
.user-card {
  color: #333;               /* 视觉 */
  position: relative;        /* 定位 */
  font-size: 14px;           /* 排版 */
  padding: 16px;             /* 盒模型 */
  display: flex;             /* 盒模型 */
  transition: all 0.3s ease; /* 动画 */
}
```

### R2: 使用 CSS 变量管理主题色
**级别**: 必须
**描述**: 颜色、间距、字体等主题值使用 CSS 变量统一管理。
**正例**:
```css
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #f5222d;
  --color-text: #333333;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --border-radius-md: 8px;
}

.primary-button {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```
**反例**:
```css
.primary-button { background-color: #1890ff; }
.secondary-button { background-color: #52c41a; }
/* 修改主题色需要逐个替换 */
```

### R3: 不使用 !important
**级别**: 必须
**描述**: 禁止使用 !important 覆盖样式，应通过提升选择器优先级或调整 CSS 层级解决。
**正例**:
```css
.card .title { font-size: 18px; }
.card.featured .title { font-size: 24px; }
```
**反例**:
```css
.title { font-size: 24px !important; }
.nav-item { color: #1890ff !important; }
```

### R4: 媒体查询放在规则块最后
**级别**: 必须
**描述**: 媒体查询应放在所属选择器规则块内部最后位置。
**正例**:
```css
.user-card {
  padding: 16px;

  @media (max-width: 768px) {
    padding: 8px;
  }
}
```
**反例**:
```css
/* 媒体查询与基础样式分离 */
@media (max-width: 768px) {
  .user-card { padding: 8px; }
}
.user-card { padding: 16px; }
```

### R5: 使用 BEM 命名规范
**级别**: 必须
**描述**: 类名使用 BEM（Block__Element--Modifier）命名规范。
**正例**:
```css
.user-card {}
.user-card__avatar {}
.user-card__name {}
.user-card--featured {}
.user-card__avatar--large {}
```
**反例**:
```css
.card {}
.card .img {}
.card.featured .img.big {}
.user-card__header__title {}  /* 嵌套 BEM */
```

### R6: 类名语义化，ID 不用于样式
**级别**: 必须
**描述**: 类名反映功能含义而非样式表现。禁止使用 ID 选择器和表现型命名。
**正例**:
```css
.error-message { color: #f5222d; }
.section-title { font-weight: 700; }
.page-footer { margin-top: 40px; }
```
**反例**:
```css
.red { color: #f5222d; }
.mt-40 { margin-top: 40px; }
#header { position: sticky; }  /* 禁止 ID 选择器 */
```

### R7: Less/Sass 嵌套不超过 3 层
**级别**: 必须
**描述**: Less/Sass 嵌套层级不超过 3 层，避免生成过深的选择器。
**正例**:
```less
.user-card {
  &__header { display: flex; }
  &__name { font-size: 16px; }
  &--featured {
    .user-card__name { color: var(--color-primary); }
  }
}
```
**反例**:
```less
.page .content .section .article .header .title {
  font-size: 24px;  /* 6 层嵌套 */
}
```

### R8: 状态类使用 is- 前缀，JS 钩子使用 js- 前缀
**级别**: 必须
**描述**: 元素状态类名使用 `.is-` 前缀，仅供 JS 操作的类名使用 `.js-` 前缀且不附加样式。
**正例**:
```html
<button class="btn btn--primary js-submit-btn">提交</button>
```
```css
.btn.is-loading { opacity: 0.7; pointer-events: none; }
.nav-item.is-active { color: var(--color-primary); }
/* js- 前缀的类不出现在 CSS 中 */
```
**反例**:
```css
.nav-item.active {}   /* 状态命名不规范 */
.modal.hidden {}      /* 与功能类混淆 */
```

## JAVA

# Java - 最佳实践

## 适用范围
- 适用于所有 Java/Spring Boot 项目的编码实践
- 与编码风格规范、设计模式规范配合使用
- 聚焦日常开发中容易引入隐性 bug 的实践
- try-with-resources、CollectionUtils.isEmpty、SLF4J 等基础实践不再列出，AI 默认遵守

## 规则

### R1: 不捕获 Exception 基类
**级别**: 必须
**描述**: catch 块必须捕获具体异常类型，不捕获 Exception 基类。捕获 Exception 会吞掉预期外的异常（如 OOM、NullPointerException），导致问题难以排查。
**正例**:
```java
try {
    userService.createUser(request);
} catch (DuplicateKeyException e) {
    log.warn("用户已存在: {}", request.getUsername());
    throw new BusinessException("用户名已注册");
}
```
**反例**:
```java
try {
    userService.createUser(request);
} catch (Exception e) {
    log.error("操作失败", e);
}
```

### R2: 字符串拼接使用 StringBuilder 或 String.format
**级别**: 推荐
**描述**: 循环中字符串拼接使用 StringBuilder，格式化使用 String.format。编译器只会优化单行内的 + 拼接，循环中的 + 每次都创建新对象。
**正例**:
```java
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(",");
}
String result = sb.toString();
// 或格式化
String msg = String.format("用户 %s 的余额为 %.2f", name, balance);
```
**反例**:
```java
String result = "";
for (String item : items) {
    result += item + ",";
}
```

### R3: 线程池使用 ThreadPoolExecutor
**级别**: 必须
**描述**: 禁止使用 Executors 创建线程池，必须使用 ThreadPoolExecutor 明确参数。Executors.newFixedThreadPool 使用无界队列，可能导致 OOM。
**正例**:
```java
@Bean
public ThreadPoolExecutor bizExecutor() {
    return new ThreadPoolExecutor(
        4, 8, 60, TimeUnit.SECONDS,
        new LinkedBlockingQueue<>(100),
        new ThreadFactoryBuilder().setNameFormat("biz-%d").build(),
        new ThreadPoolExecutor.CallerRunsPolicy());
}
```
**反例**:
```java
ExecutorService pool = Executors.newFixedThreadPool(10);
// 无界队列可能导致 OOM
```

### R4: 日期使用 LocalDateTime
**级别**: 必须
**描述**: 使用 java.time 包（LocalDateTime/LocalDate），不使用 java.util.Date。Date 是可变对象且线程不安全，月份从 0 开始容易出错。
**正例**:
```java
LocalDateTime now = LocalDateTime.now();
LocalDate birthday = LocalDate.of(2000, 1, 15);
Duration diff = Duration.between(startTime, endTime);
```
**反例**:
```java
Date now = new Date();
Calendar cal = Calendar.getInstance();
cal.setTime(now);
cal.add(Calendar.DAY_OF_MONTH, 1);
```

### R5: 金额使用 BigDecimal
**级别**: 必须
**描述**: 金额计算使用 BigDecimal，禁止使用 float 或 double。浮点数存在精度丢失，0.1 + 0.2 != 0.3。
**正例**:
```java
BigDecimal price = new BigDecimal("19.90");
BigDecimal quantity = new BigDecimal("3");
BigDecimal total = price.multiply(quantity);
```
**反例**:
```java
double price = 19.90;
double total = price * 3; // 59.699999999999996
```

### R6: Map 使用 computeIfAbsent
**级别**: 推荐
**描述**: 使用 computeIfAbsent 替代 containsKey + put 组合，一行代码解决"不存在则创建"的场景。
**正例**:
```java
Map<String, List<Order>> orderMap = new HashMap<>();
orderMap.computeIfAbsent(userId, k -> new ArrayList<>()).add(order);
```
**反例**:
```java
Map<String, List<Order>> orderMap = new HashMap<>();
if (!orderMap.containsKey(userId)) {
    orderMap.put(userId, new ArrayList<>());
}
orderMap.get(userId).add(order);
```

### R7: 使用 Optional 替代 null 返回值
**级别**: 推荐
**描述**: 方法返回值可能为空时使用 Optional 包装，强制调用方处理空值情况。
**正例**:
```java
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}
// 调用方
userOpt.ifPresent(u -> sendEmail(u));
```
**反例**:
```java
public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
}
// 调用方忘记判空导致 NPE
user.getName();
```

### R8: 避免在循环中创建大量对象
**级别**: 必须
**描述**: 循环内避免重复创建可复用对象（SimpleDateFormat、DecimalFormat、Pattern 等），将创建移到循环外。
**正例**:
```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
for (Order order : orders) {
    order.setDateStr(sdf.format(order.getCreateTime()));
}
```
**反例**:
```java
for (Order order : orders) {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    order.setDateStr(sdf.format(order.getCreateTime()));
}
```

### R9: 使用枚举替代魔法值
**级别**: 必须
**描述**: 魔法数字和字符串常量必须定义为枚举，避免散落的硬编码值难以理解和维护。
**正例**:
```java
public enum UserStatus {
    ACTIVE(1, "正常"), DISABLED(0, "禁用");
    private final int code;
    private final String desc;
}
if (user.getStatus() == UserStatus.ACTIVE.getCode()) { ... }
```
**反例**:
```java
if (user.getStatus() == 1) { ... }
if ("ACTIVE".equals(user.getStatusStr())) { ... }
```

# Java - 编码风格规范

## 适用范围
- 适用于所有 Java 项目的编码风格约束
- 参考 Alibaba Java Coding Guidelines
- 与代码注释规范、最佳实践规范配合使用
- 命名规范（UpperCamelCase、lowerCamelCase、常量全大写等）和格式规范（4空格缩进、大括号、120字符行宽）不再列出，AI 默认遵守

## 规则

### R1: boolean 变量不加 is 前缀
**级别**: 必须
**描述**: POJO 类中布尔变量不加 is 前缀，避免序列化框架（Jackson/Fastjson）解析时getter 方法名歧义导致字段丢失。
**正例**:
```java
public class UserDTO {
    private Boolean deleted;
    private Boolean finished;
}
```
**反例**:
```java
public class UserDTO {
    private Boolean isDeleted;   // getter: isDeleted() → JSON 序列化后字段名变成 deleted，而非 isDeleted
    private Boolean isFinished;
}
```

### R2: POJO 类使用包装类型
**级别**: 必须
**描述**: POJO 类（DTO/VO/Entity）使用 Long/Integer 等包装类型，不使用基本类型。基本类型有默认值（int=0, boolean=false），无法区分"未赋值"和"值为0/ false"。
**正例**:
```java
public class UserDTO {
    private Long id;           // null 表示前端未传
    private Integer age;       // null 表示未填写
    private Boolean active;    // null 表示未设置
}
```
**反例**:
```java
public class UserDTO {
    private long id;           // 默认值 0，无法区分"未传"和"传了0"
    private int age;           // 默认值 0，无法区分"未填写"和"填了0"
    private boolean active;    // 默认值 false，无法区分"未设置"和"设为false"
}
```

### R3: 方法参数不超过 5 个
**级别**: 必须
**描述**: 方法参数不超过 5 个，超过时使用对象封装（Request/Command/Query 对象）。参数过多降低可读性，且增加调用方出错概率。
**正例**:
```java
public void createUser(UserCreateRequest request) {}

// 或使用 Builder
UserCreateRequest.builder()
    .name("Alice")
    .age(25)
    .email("alice@example.com")
    .phone("13800138000")
    .role("admin")
    .build();
```
**反例**:
```java
public void createUser(String name, Integer age, String email,
                       String phone, String address, String role) {}
```

### R4: 单个方法行数不超过 80 行
**级别**: 必须
**描述**: 单个方法体行数不超过 80 行，超出应拆分为多个私有方法。长方法难以理解、测试和维护。
**正例**:
```java
public OrderVO processOrder(OrderDTO order) {
    validateOrder(order);
    Order orderEntity = createOrder(order);
    notifyUser(orderEntity);
    return convertToVO(orderEntity);
}
```
**反例**:
```java
public OrderVO processOrder(OrderDTO order) {
    // 80+ lines of mixed validation, creation, notification logic
}
```

# Java - 代码注释规范

## 适用范围
- 适用于所有 Java 项目的注释编写
- 与编码风格规范、最佳实践规范配合使用
- 团队统一使用中文注释

## 规则

### R1: 所有 public 类必须有 Javadoc
**级别**: 必须
**描述**: 所有 public 类必须包含 Javadoc，包括 @author、@since 和类的功能描述。
**正例**:
```java
/**
 * 用户服务实现类，提供用户注册、查询、更新等功能
 *
 * @author zhangsan
 * @since 2024-01-15
 */
public class UserServiceImpl implements UserService {}
```
**反例**:
```java
// 用户服务
public class UserServiceImpl implements UserService {}
```

### R2: 所有 public 方法必须有 Javadoc
**级别**: 必须
**描述**: public 方法必须包含 Javadoc，说明 @param、@return、@throws。
**正例**:
```java
/**
 * 根据用户ID查询用户信息
 *
 * @param userId 用户唯一标识，不能为null
 * @return 用户信息DTO
 * @throws BusinessException 当用户不存在时抛出
 */
public UserDTO getUserById(Long userId) {}
```
**反例**:
```java
// 查询用户
public UserDTO getUserById(Long userId) {}
```

### R3: 注释描述 why 而非 what
**级别**: 必须
**描述**: 注释应解释代码为什么这样做，而非代码在做什么。
**正例**:
```java
// 使用悲观锁防止并发扣款导致超卖
order.setAmount(amount.subtract(discount));
```
**反例**:
```java
// 减去折扣
order.setAmount(amount.subtract(discount));
```

### R4: TODO 注释必须带作者和日期
**级别**: 必须
**描述**: TODO 注释格式为 TODO[作者](yyyy-MM-dd)，便于追踪责任人。
**正例**:
```java
// TODO[zhangsan](2024-03-01): 接入微信支付渠道
public PayResult pay(PayRequest request) {}
```
**反例**:
```java
// TODO: 接入微信支付
public PayResult pay(PayRequest request) {}
```

### R5: 不使用行尾注释
**级别**: 推荐
**描述**: 不要在代码行尾添加注释，应将注释放在代码上方单独一行。
**正例**:
```java
// 校验用户是否拥有操作权限
boolean hasPermission = checkPermission(user, resource);
```
**反例**:
```java
boolean hasPermission = checkPermission(user, resource); // 校验权限
```

### R6: 复杂逻辑上方必须添加行内注释
**级别**: 必须
**描述**: 复杂算法、业务规则、位运算等不易理解的逻辑上方必须添加注释。
**正例**:
```java
// 根据CRC32校验算法计算数据包校验和，多项式为0xEDB88320
long checksum = crc32(data);
```
**反例**:
```java
long checksum = crc32(data);
```

### R7: 常量必须有注释说明用途
**级别**: 必须
**描述**: 所有常量必须添加注释说明其含义和用途。
**正例**:
```java
/** 最大重试次数，超过此次数将记录失败日志并告警 */
public static final int MAX_RETRY_COUNT = 3;
```
**反例**:
```java
public static final int MAX_RETRY_COUNT = 3;
```

### R8: 接口方法注释放在接口中
**级别**: 必须
**描述**: Javadoc 写在接口的方法上，实现类不重复写注释。
**正例**:
```java
public interface UserService {
    /**
     * 根据ID查询用户
     * @param userId 用户ID
     * @return 用户信息
     */
    UserDTO getUserById(Long userId);
}
// 实现类无需重复注释
```
**反例**:
```java
// 接口中没有注释
public interface UserService {
    UserDTO getUserById(Long userId);
}
// 实现类重复写了接口注释
public class UserServiceImpl implements UserService {
    /** 根据ID查询用户... */
    public UserDTO getUserById(Long userId) {}
}
```

### R9: 枚举值必须有 Javadoc 注释
**级别**: 必须
**描述**: 每个枚举值必须添加注释说明其含义。
**正例**:
```java
public enum OrderStatus {
    /** 待支付，用户已下单但尚未完成支付 */
    PENDING,
    /** 已支付，等待商家发货 */
    PAID,
    /** 已完成，订单流程结束 */
    COMPLETED
}
```
**反例**:
```java
public enum OrderStatus {
    PENDING,
    PAID,
    COMPLETED
}
```

### R10: 中文注释和英文注释不混用
**级别**: 必须
**描述**: 团队统一使用中文注释，同一文件中不混用中英文注释。
**正例**:
```java
// 校验用户权限
boolean valid = checkPermission();
// 记录操作日志
logOperation();
```
**反例**:
```java
// check user permission
boolean valid = checkPermission();
// 记录操作日志
logOperation();
```

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

## JAVASCRIPT

# JavaScript - 最佳实践

## 适用范围
- 适用于所有 JavaScript/TypeScript 项目的编码实践
- 与编码风格规范配合使用
- 聚焦日常开发中 AI 容易遗漏的实践
- async/await、?. / ??、Promise.all、try/catch、避免回调地狱等现代 JS 基础实践不再列出，AI 默认遵守

## 规则

### R1: 对高频事件使用防抖或节流
**级别**: 必须
**描述**: 搜索输入、滚动、窗口调整等高频事件必须使用防抖（debounce）或节流（throttle），避免性能问题。
**正例**:
```javascript
// 防抖：搜索输入
import { debounce } from 'lodash-es';

const handleSearch = debounce((keyword) => {
  fetchSuggestions(keyword);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// 节流：滚动事件
import { throttle } from 'lodash-es';

const handleScroll = throttle(() => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore();
  }
}, 200);

window.addEventListener('scroll', handleScroll);
```
**反例**:
```javascript
// 每次输入都触发请求，导致大量无意义请求
searchInput.addEventListener('input', (e) => {
  fetchSuggestions(e.target.value);
});

// 每次滚动都触发计算，导致页面卡顿
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore();
  }
});
```

### R2: 使用解构赋值设置默认值
**级别**: 推荐
**描述**: 函数参数使用解构赋值配合默认值，提高可读性和灵活性，避免使用 || 短路判断。
**正例**:
```javascript
function createUser({ name, age = 18, role = 'user', active = true } = {}) {
  return { name, age, role, active };
}

function configure({ host = 'localhost', port = 3000, debug = false }) {
  return { host, port, debug };
}
```
**反例**:
```javascript
function createUser(name, age, role, active) {
  age = age || 18;           // 0 会被误判为 falsy
  role = role || 'user';
  active = active !== undefined ? active : true;
  return { name: name, age: age, role: role, active: active };
}
```

## SPRINGBOOT

# Spring Boot - 进阶模式

## 适用范围
- 适用于 Spring Boot 项目中使用事件驱动、异步处理、缓存、幂等、AOP 等进阶模式
- 核心最佳实践（依赖注入、分层、日志、异常、校验）见 `best-practices.md`
- 与微服务设计规范、网关规范配合使用

## 规则

### R2: 异步处理使用 @Async + 自定义线程池
**级别**: 推荐
**描述**: 耗时操作使用 @Async 异步执行，必须自定义线程池配置，不使用默认线程池。
**正例**:
```java
// 线程池配置
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("async-task-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}

// 异步方法——指定自定义线程池
@Service
@Slf4j
public class EmailServiceImpl implements IEmailService {

    @Async("taskExecutor")
    @Override
    public void sendWelcomeEmail(String to, String username) {
        log.info("异步发送欢迎邮件给: {}", to);
        try {
            emailClient.send(to, "欢迎注册", buildWelcomeContent(username));
        } catch (Exception e) {
            log.error("发送邮件失败: to={}", to, e);
        }
    }
}
```
**反例**:
```java
@Async  // 没有指定自定义线程池，使用默认的 SimpleAsyncTaskExecutor（无界创建线程）
public void sendWelcomeEmail(String to, String username) { ... }

new Thread(() -> emailClient.send(...)).start();  // 手动创建线程，无法管理和监控

CompletableFuture.runAsync(() -> emailClient.send(...));  // 使用 ForkJoinPool.commonPool()
```

### R4: 接口幂等性设计
**级别**: 推荐
**描述**: 对写操作接口（创建、支付等）进行幂等性设计，防止重复提交导致数据异常。
**正例**:
```java
// 自定义幂等注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    String key();                    // SpEL 表达式
    int expireSeconds() default 60;
}

// 幂等拦截器——基于 Redis SETNX
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class IdempotentAspect {

    private final StringRedisTemplate redisTemplate;

    @Around("@annotation(idempotent)")
    public Object around(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        String key = "idempotent:" + parseKey(joinPoint, idempotent.key());

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, "1", idempotent.expireSeconds(), TimeUnit.SECONDS);

        if (Boolean.FALSE.equals(success)) {
            log.warn("重复请求被拦截: key={}", key);
            throw new BusinessException("请勿重复提交");
        }

        try {
            return joinPoint.proceed();
        } catch (Exception e) {
            redisTemplate.delete(key);  // 执行失败删除 key，允许重试
            throw e;
        }
    }

    private String parseKey(JoinPoint joinPoint, String spel) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        EvaluationContext context = new StandardEvaluationContext();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        for (int i = 0; i < paramNames.length; i++) {
            context.setVariable(paramNames[i], args[i]);
        }
        return new SpelExpressionParser().parseExpression(spel).getValue(context, String.class);
    }
}

// Controller 使用
@PostMapping
@Idempotent(key = "#dto.requestId", expireSeconds = 30)
public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
    return Result.success(orderService.createOrder(dto));
}
```
**反例**:
```java
// 无幂等设计，用户连续点击创建多个订单
@PostMapping
public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
    return Result.success(orderService.createOrder(dto));
}

// 前端禁用按钮不可靠——网络超时后刷新页面可重复提交
```

# Spring Boot - RESTful API 设计规范

## 适用范围
- 适用于所有 Spring Boot 项目对外暴露的 RESTful API 接口
- 与项目目录结构约定、数据访问层规范配合使用
- 前后端分离项目的后端接口设计必须遵循
- URL 命名复数、参数绑定方式、文件上传、接口版本管理等基础实践不再列出，AI 默认遵守

## 规则

### R1: HTTP 方法语义正确
**级别**: 必须
**描述**: 正确使用 HTTP 方法语义：GET 查询、POST 新增、PUT 全量修改、DELETE 删除、PATCH 部分更新。
**正例**:
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping                          // GET - 查询订单列表
    public Result<PageResult<OrderVO>> list(@Valid OrderQueryDTO query) { ... }

    @GetMapping("/{id}")                 // GET - 查询单个订单
    public Result<OrderVO> getById(@PathVariable Long id) { ... }

    @PostMapping                         // POST - 创建订单
    public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) { ... }

    @PutMapping("/{id}")                 // PUT - 全量更新订单
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody OrderUpdateDTO dto) { ... }

    @PatchMapping("/{id}/status")        // PATCH - 部分更新订单状态
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody OrderStatusDTO dto) { ... }

    @DeleteMapping("/{id}")              // DELETE - 删除订单
    public Result<Void> delete(@PathVariable Long id) { ... }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping("/list")                // POST 用于查询
    public Result<PageResult<OrderVO>> list(@RequestBody OrderQueryDTO query) { ... }

    @GetMapping("/create")               // GET 用于创建（可能有安全问题）
    public Result<Long> create(OrderCreateDTO dto) { ... }

    @PostMapping("/update/{id}")         // POST 用于更新
    public Result<Void> update(@PathVariable Long id, @RequestBody OrderUpdateDTO dto) { ... }

    @GetMapping("/delete/{id}")          // GET 用于删除
    public Result<Void> delete(@PathVariable Long id) { ... }
}
```

### R2: 统一返回体 Result<T> 包装
**级别**: 必须
**描述**: 所有接口统一使用 Result<T> 包装返回值，包含 code（状态码）、message（提示信息）、data（业务数据）三个字段。
**正例**:
```java
// 统一返回体定义
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}

// Controller 使用
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {
    UserVO user = userService.getById(id);
    return Result.success(user);
}
```
**反例**:
```java
// 直接返回业务对象，没有统一包装
@GetMapping("/{id}")
public UserVO getById(@PathVariable Long id) {
    return userService.getById(id);
}

// 每个接口自行定义返回格式
@GetMapping("/{id}")
public Map<String, Object> getById(@PathVariable Long id) {
    Map<String, Object> map = new HashMap<>();
    map.put("status", "ok");
    map.put("result", userService.getById(id));
    return map;
}

// 使用不同的包装类
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<UserVO>> getById(@PathVariable Long id) { ... }

@PostMapping
public JsonResult<Long> create(@RequestBody UserCreateDTO dto) { ... }
```

### R3: 使用 @Valid + JSR303 做参数校验
**级别**: 必须
**描述**: 使用 JSR303 注解对请求参数进行校验，结合 @Valid 或 @Validated 触发校验，避免在业务代码中手动校验。
**正例**:
```java
// DTO 中定义校验规则
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度6-20个字符")
    private String password;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "角色不能为空")
    private Long roleId;
}

// Controller 中使用 @Valid 触发校验
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    return Result.success(userService.create(dto));
}
```
**反例**:
```java
// 手动编写校验逻辑
@PostMapping
public Result<Long> create(@RequestBody UserCreateDTO dto) {
    if (dto.getUsername() == null || dto.getUsername().isEmpty()) {
        return Result.fail(400, "用户名不能为空");
    }
    if (dto.getUsername().length() < 2 || dto.getUsername().length() > 20) {
        return Result.fail(400, "用户名长度2-20个字符");
    }
    if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
        return Result.fail(400, "密码不能为空");
    }
    // ... 大量手动校验代码
    return Result.success(userService.create(dto));
}
```

### R4: 全局异常处理 @RestControllerAdvice
**级别**: 必须
**描述**: 使用 @RestControllerAdvice + @ExceptionHandler 统一处理异常，避免异常信息直接暴露给前端。
**正例**:
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}", message);
        return Result.fail(400, message);
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}
```
**反例**:
```java
// 每个 Controller 方法中 try-catch 处理异常
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    try {
        return Result.success(userService.create(dto));
    } catch (BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();                    // 直接打印堆栈
        return Result.fail(500, e.getMessage()); // 暴露内部错误信息
    }
}

// 没有全局异常处理，异常直接返回堆栈信息
// 前端收到: {"timestamp":"2024-01-01T00:00:00.000+00:00","status":500,"error":"Internal Server Error"...}
```

### R5: 分页接口使用 PageRequest 封装
**级别**: 推荐
**描述**: 分页查询接口统一使用自定义的 PageRequest 基类封装分页参数，各查询 DTO 继承 PageRequest。
**正例**:
```java
// 分页请求基类
@Data
public class PageRequest {
    @Min(value = 1, message = "页码最小为1")
    private int pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 100, message = "每页条数最大为100")
    private int pageSize = 10;
}

// 查询 DTO 继承分页基类
@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryDTO extends PageRequest {
    private String keyword;
    private Integer status;
}

// Controller 使用
@GetMapping
public Result<Page<UserVO>> list(@Valid UserQueryDTO query) {
    return Result.success(userService.page(query));
}
```
**反例**:
```java
// 直接使用原始参数
@GetMapping
public Result<Map<String, Object>> list(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String keyword) {
    Map<String, Object> result = new HashMap<>();
    result.put("list", userService.list(keyword, page, size));
    result.put("total", userService.count(keyword));
    return Result.success(result);
}
```

### R6: 请求体使用 @RequestBody + DTO 接收
**级别**: 必须
**描述**: POST/PUT/PATCH 请求使用 @RequestBody 接收 JSON 请求体，并通过专门的 DTO 类封装参数。创建和更新使用不同的 DTO。
**正例**:
```java
// 创建用户 DTO
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "部门ID不能为空")
    private Long deptId;
}

// 更新用户 DTO（与创建 DTO 分离）
@Data
public class UserUpdateDTO {
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    private Long deptId;
}

// Controller 使用
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    return Result.success(userService.create(dto));
}

@PutMapping("/{id}")
public Result<Void> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) {
    userService.update(id, dto);
    return Result.success(null);
}
```
**反例**:
```java
// 直接使用 Entity 接收参数
@PostMapping
public Result<Long> create(@RequestBody User user) {
    return Result.success(userService.create(user));
}

// 使用 Map 接收参数
@PostMapping
public Result<Long> create(@RequestBody Map<String, Object> params) {
    String username = (String) params.get("username");
    // 类型不安全，没有校验
}

// 创建和更新共用同一个 DTO
@Data
public class UserDTO {
    private Long id;              // 创建时不需要
    private String username;
    private String password;      // 更新时可能不需要
    private String email;
}
```

### R7: Controller 只做参数校验和调用 Service
**级别**: 必须
**描述**: Controller 层职责单一，只负责接收参数、参数校验、调用 Service、返回结果，不包含任何业务逻辑。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
        Long id = userService.create(dto);
        return Result.success(id);
    }

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        UserVO user = userService.getById(id);
        return Result.success(user);
    }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public Result<Long> create(@RequestBody UserCreateDTO dto) {
        // Controller 中包含业务逻辑
        User existing = userMapper.selectByUsername(dto.getUsername());
        if (existing != null) {
            return Result.fail(400, "用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(DigestUtils.md5Hex(dto.getPassword()));  // 加密逻辑
        user.setStatus(1);
        user.setCreateTime(new Date());
        userMapper.insert(user);

        emailService.sendWelcomeEmail(user.getEmail());  // 发邮件逻辑
        return Result.success(user.getId());
    }
}
```

### R8: 接口必须有 Swagger/OpenAPI 注解
**级别**: 推荐
**描述**: 所有接口必须添加 Swagger/OpenAPI 注解，根据项目中的 swagger 版本使用正确的注解，描述接口用途、参数含义和返回值，便于生成 API 文档。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户相关接口")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @Operation(summary = "根据ID查询用户", description = "返回指定用户的详细信息")
    @Parameter(name = "id", description = "用户ID", required = true)
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @Operation(summary = "创建用户", description = "创建新用户并返回用户ID")
    @PostMapping
    public Result<Long> create(
            @Parameter(description = "用户创建参数")
            @Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }

    @Operation(summary = "分页查询用户列表")
    @GetMapping
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
        return Result.success(userService.page(query));
    }
}
```
**反例**:
```java
// 没有任何注解说明
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }
}
```

# Spring Boot - 最佳实践（核心）

## 适用范围
- 适用于所有 Spring Boot 项目的核心开发最佳实践
- 与项目目录结构约定、API 设计规范、配置管理规范、数据访问层规范配合使用
- 涵盖依赖注入、分层架构、参数校验
- 进阶模式（事件驱动、异步处理、缓存、幂等、AOP）见 `advanced-patterns.md`
- 统一异常体系（@RestControllerAdvice + BusinessException）和日志规范（SLF4J + 占位符）不再列出，AI 默认遵守

## 规则

### R1: 依赖注入使用构造器注入
**级别**: 推荐
**描述**: 使用 @RequiredArgsConstructor + final 字段实现构造器注入，而非 @Autowired 字段注入，有利于不可变性和可测试性。
**正例**:
```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public Long create(UserCreateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        userMapper.insert(user);
        emailService.sendWelcomeEmail(user.getEmail());
        return user.getId();
    }
}
```
**反例**:
```java
@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    // @Autowired 字段注入，无法声明为 final，不利于不可变性和单元测试
}
```

### R2: 避免在 Controller 写业务逻辑
**级别**: 必须
**描述**: Controller 层只负责接收请求、参数校验、调用 Service、返回响应，所有业务逻辑必须在 Service 层实现。
**正例**:
```java
// Controller - 只做参数接收和结果返回
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
        return Result.success(orderService.createOrder(dto));
    }
}

// Service - 处理所有业务逻辑
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final StockService stockService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        validateProducts(dto.getItems());
        BigDecimal totalAmount = calculateTotalAmount(dto.getItems());
        Order order = buildOrder(dto, totalAmount);
        orderMapper.insert(order);
        stockService.deduct(dto.getItems());
        eventPublisher.publishEvent(new OrderCreatedEvent(order.getId()));
        return order.getId();
    }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderMapper orderMapper;
    @Autowired private ProductMapper productMapper;

    @PostMapping
    public Result<Long> create(@RequestBody OrderCreateDTO dto) {
        // Controller 中包含大量业务逻辑——校验、计算、库存扣减全部混在一起
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemDTO item : dto.getItems()) {
            Product product = productMapper.selectById(item.getProductId());
            if (product == null || product.getStock() < item.getQuantity()) {
                return Result.fail(400, "商品不存在或库存不足");
            }
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        Order order = new Order();
        order.setTotalAmount(total);
        orderMapper.insert(order);
        return Result.success(order.getId());
    }
}
```

### R3: 参数校验使用 JSR303 + 分组校验
**级别**: 必须
**描述**: 使用 JSR303/Hibernate Validator 注解做参数校验，复杂规则通过自定义校验注解实现，Controller 使用 @Validated 触发校验并支持分组。
**正例**:
```java
// 自定义校验注解
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || PHONE_PATTERN.matcher(value).matches();
    }
}

// 分组接口
public interface Create {}
public interface Update {}

// DTO：注解校验 + 分组 + 自定义注解
@Data
public class UserDTO {
    @Null(groups = Create.class, message = "创建时ID必须为空")
    @NotNull(groups = Update.class, message = "更新时ID不能为空")
    private Long id;

    @NotBlank(groups = {Create.class, Update.class}, message = "用户名不能为空")
    @Size(min = 2, max = 20)
    private String username;

    @NotBlank(groups = Create.class, message = "密码不能为空")
    @Size(min = 8, max = 20)
    private String password;

    @Phone
    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;
}

// Controller：使用分组校验
@RestController
@RequestMapping("/api/users")
@Validated
@RequiredArgsConstructor
public class UserController {

    @PostMapping
    public Result<Long> create(@Validated(Create.class) @RequestBody UserDTO dto) {
        return Result.success(userService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id,
                               @Validated(Update.class) @RequestBody UserDTO dto) {
        dto.setId(id);
        userService.update(dto);
        return Result.success(null);
    }
}
```
**反例**:
```java
// Service 中手动校验，代码冗余且容易遗漏
public Long create(UserCreateDTO dto) {
    if (dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
        throw new BusinessException("用户名不能为空");
    }
    if (dto.getUsername().length() < 2 || dto.getUsername().length() > 20) {
        throw new BusinessException("用户名长度2-20个字符");
    }
    if (dto.getPhone() != null && !dto.getPhone().matches("^1[3-9]\\d{9}$")) {
        throw new BusinessException("手机号格式不正确");
    }
    // 校验代码比业务代码还多...
}

// Controller 不加 @Validated，路径参数不校验
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {  // id 可能为 null 或负数
    return Result.success(userService.getById(id));
}
```

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

# Spring Boot - 数据访问层规范

## 适用范围
- 适用于 Spring Boot 项目中使用 MyBatis / MyBatis-Plus 进行数据访问的模块
- 与项目目录结构约定、RESTful API 设计规范配合使用
- 基于 MyBatis-Plus 3.x 版本
- Entity/DTO/VO 分离、Mapper 继承 BaseMapper、Service 继承 ServiceImpl、@Transactional 标注在 Service 方法上、批量操作使用 saveBatch、分页使用 Page 对象等基础实践不再列出，AI 默认遵守

## 规则

### R1: 通用查询使用 LambdaQueryWrapper
**级别**: 推荐
**描述**: 简单查询条件使用 MyBatis-Plus 的 LambdaQueryWrapper 构建，避免字段名硬编码。复杂查询（超过 3 表关联或动态条件）使用 XML 映射文件。
**正例**:
```java
// 使用 LambdaQueryWrapper，类型安全
public List<User> listActiveUsers(String keyword, Integer status) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
           .eq(status != null, User::getStatus, status)
           .eq(User::getDeleted, 0)
           .orderByDesc(User::getCreateTime);
    return userMapper.selectList(wrapper);
}

// 链式 Lambda 查询
public User getByUsername(String username) {
    return lambdaQuery()
            .eq(User::getUsername, username)
            .eq(User::getDeleted, 0)
            .one();
}
```
**反例**:
```java
// 使用字符串字段名，容易拼写错误
public List<User> listActiveUsers(String keyword, Integer status) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(keyword), "usrname", keyword)  // 拼写错误不会被编译器发现
           .eq(status != null, "staus", status)                        // 拼写错误
           .eq("deleted", 0)
           .orderByDesc("create_time");
    return userMapper.selectList(wrapper);
}

// 使用注解 SQL 处理简单查询
@Select("SELECT * FROM sys_user WHERE username = #{username} AND deleted = 0")
User selectByUsername(@Param("username") String username);
```

### R2: 逻辑删除使用 @TableLogic
**级别**: 推荐
**描述**: 需要逻辑删除的表使用 @TableLogic 注解标记删除标识字段，MyBatis-Plus 会自动将删除操作转为更新。
**正例**:
```java
// Entity 中标记逻辑删除字段
@Data
@TableName("sys_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String email;

    @TableLogic(value = "0", delval = "1")  // 0-未删除，1-已删除
    private Integer deleted;
}
```
```yaml
# 全局配置逻辑删除
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```
```java
// 调用删除方法会自动转为 UPDATE
userService.removeById(1L);
// 实际执行: UPDATE sys_user SET deleted = 1 WHERE id = 1

// 查询会自动过滤已删除数据
userService.list();
// 实际执行: SELECT * FROM sys_user WHERE deleted = 0
```
**反例**:
```java
// 手动实现逻辑删除
@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Update("UPDATE sys_user SET deleted = 1 WHERE id = #{id}")
    int logicDeleteById(Long id);

    @Select("SELECT * FROM sys_user WHERE deleted = 0")
    List<User> selectAll();
}

// Service 中手动维护删除状态
public void deleteUser(Long id) {
    User user = userMapper.selectById(id);
    user.setDeleted(1);
    userMapper.updateById(user);
}
```

### R3: 自动填充字段使用 @TableField(fill = FieldFill)
**级别**: 推荐
**描述**: 创建时间、更新时间等公共字段使用 MyBatis-Plus 的自动填充功能，通过 @TableField 注解和 MetaObjectHandler 实现。
**正例**:
```java
// Entity 中标记自动填充字段
@Data
@TableName("sys_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;
}

// 实现 MetaObjectHandler
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "createBy", Long.class, SecurityUtils.getCurrentUserId());
        this.strictInsertFill(metaObject, "updateBy", Long.class, SecurityUtils.getCurrentUserId());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictUpdateFill(metaObject, "updateBy", Long.class, SecurityUtils.getCurrentUserId());
    }
}
```
**反例**:
```java
// 手动设置时间字段，容易遗漏
@Service
public class UserServiceImpl implements IUserService {

    public Long create(UserCreateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setCreateTime(new Date());       // 手动设置
        user.setUpdateTime(new Date());       // 手动设置
        user.setCreateBy(getCurrentUserId()); // 容易遗漏
        userMapper.insert(user);
        return user.getId();
    }

    public void update(Long id, UserUpdateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setId(id);
        user.setUpdateTime(new Date());       // 手动设置，容易遗漏
        userMapper.updateById(user);
    }
}
```

# Spring Boot - 项目目录结构约定

## 适用范围
- 适用于所有基于 Spring Boot 的后端项目
- 与 RESTful API 设计规范、数据访问层规范、配置管理规范配合使用
- 适用于 Maven 构建的项目（Gradle 项目参考调整）
- 标准 Maven 目录布局、包名全小写、静态资源放 static、MyBatis XML 放 mapper/、Service 接口分离、启动类放根包等基础约定不再列出，AI 默认遵守

## 规则

### R1: 分层架构包结构
**级别**: 必须
**描述**: 按职责分层组织包结构，包含 controller、service、dao（mapper）、model（entity/dto/vo）、config、util、constant 等包。
**正例**:
```
com.example.project/
├── controller/        # 控制器层，接收请求
├── service/           # 业务逻辑层
│   └── impl/          # Service 实现类
├── dao/               # 数据访问层（也可用 mapper）
├── model/
│   ├── entity/        # 数据库实体
│   ├── dto/           # 数据传输对象
│   └── vo/            # 视图对象
├── config/            # 配置类
├── util/              # 工具类
├── constant/          # 常量定义
├── enums/             # 枚举类
├── exception/         # 自定义异常
└── interceptor/       # 拦截器
```
**反例**:
```
com.example.project/
├── controller/
├── service/
├── mapper/
├── entity/            # entity、dto、vo 混在一起
├── dto/
├── vo/
├── utils/             # 命名不统一（util vs utils）
├── Config.java        # 配置类散落在根包
└── Constants.java     # 常量类散落在根包
```

### R2: 配置文件分层管理
**级别**: 必须
**描述**: 使用 application.yml 作为主配置，通过 application-{profile}.yml 管理多环境配置。
**正例**:
```
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
└── application-prod.yml         # 生产环境
```
**反例**:
```
src/main/resources/
├── application.properties       # 混用 properties 格式
├── application-dev.properties
├── config/
│   ├── db.yml                   # 配置散落在子目录
│   ├── redis.yml
│   └── mq.yml
└── application-prod.yml
```

### R3: SQL 脚本存放位置
**级别**: 推荐
**描述**: 数据库初始化脚本和变更脚本统一放在 resources/db/ 目录下，按版本管理。
**正例**:
```
src/main/resources/
└── db/
    ├── schema/               # 建表脚本
    │   ├── V1__init.sql
    │   └── V2__add_order.sql
    └── data/                 # 初始数据
        └── V1__init_data.sql
```
**反例**:
```
src/main/resources/
├── init.sql                  # SQL 脚本散落在根目录
├── update_v2.sql
├── sql/                      # 命名不统一
│   └── create_table.sql
└── db/
    └── migration.sql         # 所有变更合并在一个文件中
```

## TYPESCRIPT

# TypeScript - 最佳实践

## 适用范围
- 适用于所有 TypeScript 项目的编码实践
- 与编码风格规范、类型设计规范配合使用
- 聚焦类型系统的高效使用

## 规则

### R1: 启用 strict 模式
**级别**: 必须
**描述**: tsconfig.json 中必须启用 strict 模式，确保最大程度的类型安全。
**正例**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```
**反例**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

### R2: 不使用 any，使用 unknown
**级别**: 必须
**描述**: 禁止使用 any 类型，当类型不确定时使用 unknown 并配合类型守卫。
**正例**:
```typescript
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'number') {
    return data.toFixed(2);
  }
  if (isNonNullObject(data) && 'name' in data) {
    return String((data as { name: string }).name);
  }
  return JSON.stringify(data);
}

// 第三方库回调参数类型不明确时
function handleCallback(callback: (...args: unknown[]) => void): void {
  // ...
}
```
**反例**:
```typescript
function parseJSON(jsonString: string): any {
  return JSON.parse(jsonString);
}

const data = parseJSON('{"name":"Alice"}');
// data 任何操作都不会报错，丢失了类型保护
data.nonExistent.method().foo;

function processData(data: any): string {
  return data.toUpperCase(); // 编译通过，但运行时可能崩溃
}
```

### R3: 使用 import type 导入类型
**级别**: 必须
**描述**: 纯类型导入使用 import type 语法，避免运行时副作用。
**正例**:
```typescript
import type { User, UserRole } from './user.types';
import type { ApiResponse, PaginatedResponse } from './api.types';
import { createUser, validateUser } from './user.service';

export async function handleCreateUser(data: unknown): Promise<ApiResponse<User>> {
  const user = createUser(data as Partial<User>);
  return { success: true, data: user };
}
```
**反例**:
```typescript
import { User, UserRole, createUser, validateUser } from './user.service';
// User 和 UserRole 是类型，但与值导入混在一起
// 打包工具可能无法正确 tree-shake
```

### R4: 使用 const enum
**级别**: 推荐
**描述**: 纯数值枚举使用 const enum 减少运行时代码。
**正例**:
```typescript
const enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

function move(direction: Direction): void {
  switch (direction) {
    case Direction.Up:
      position.y -= speed;
      break;
    case Direction.Down:
      position.y += speed;
      break;
  }
}

// 编译后 move(Direction.Up) 变为 move(0)，无额外对象
```
**反例**:
```typescript
enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}
// 编译后会生成一个 Direction 对象，增加运行时代码
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
//   ...
// })(Direction || (Direction = {}));
```

### R5: 使用类型收窄
**级别**: 必须
**描述**: 利用 typeof、instanceof、in、字面量类型等手段进行类型收窄。
**正例**:
```typescript
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value ? '是' : '否';
}

// 使用 instanceof
function handleError(error: unknown): string {
  if (error instanceof TypeError) {
    return `类型错误: ${error.message}`;
  }
  if (error instanceof RangeError) {
    return `范围错误: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// 使用 in 操作符
function processResponse(res: SuccessResponse | ErrorResponse): void {
  if ('data' in res) {
    console.log(res.data);
  } else {
    console.error(res.error);
  }
}
```
**反例**:
```typescript
function formatValue(value: string | number | boolean): string {
  // 强制断言，没有类型保护
  if ((value as string).trim) {
    return (value as string).trim();
  }
  return String(value);
}

function handleError(error: unknown): string {
  // 直接断言为 any
  return (error as any).message || '未知错误';
}
```

### R6: 使用 satisfies 运算符
**级别**: 推荐
**描述**: 使用 satisfies 运算符验证类型同时保留字面量类型推断。
**正例**:
```typescript
interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const colors = {
  primary: '#1890ff',
  secondary: '#52c41a',
  background: '#f0f2f5',
  text: '#333333',
} satisfies ThemeColors;

// colors.primary 的类型是 '#1890ff'（字面量类型），而非 string
type PrimaryColor = typeof colors.primary; // '#1890ff'

const routes = {
  home: '/',
  users: '/users',
  settings: '/settings',
} satisfies Record<string, string>;

// routes.home 的类型是 '/' 而非 string
```
**反例**:
```typescript
const colors: ThemeColors = {
  primary: '#1890ff',
  secondary: '#52c41a',
  background: '#f0f2f5',
  text: '#333333',
};
// colors.primary 的类型是 string，丢失了字面量类型 '#1890ff'
type PrimaryColor = typeof colors.primary; // string

const routes: Record<string, string> = {
  home: '/',
  users: '/users',
  settings: '/settings',
};
// routes.home 的类型是 string，丢失了 '/'
```

### R7: 避免类型断言，使用类型守卫
**级别**: 必须
**描述**: 禁止使用 as 断言绕过类型检查，应使用类型守卫进行安全的类型转换。
**正例**:
```typescript
// 使用类型守卫函数
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as User).id === 'number'
  );
}

function processInput(input: unknown): User {
  if (isUser(input)) {
    return input; // 安全收窄为 User
  }
  throw new TypeError('Invalid user data');
}

// 使用 Zod 等运行时校验库
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

function parseUser(data: unknown): User {
  return UserSchema.parse(data); // 运行时验证 + 类型安全
}
```
**反例**:
```typescript
function processInput(input: unknown): User {
  return input as User; // 无运行时验证，不安全
}

const data = JSON.parse(responseText);
const user = data as User; // 如果 data 不是 User，运行时错误

// 双重断言更是严禁
const value = 'hello' as unknown as number; // 完全绕过类型检查
```

### R8: 正确选择 Record 和 Map
**级别**: 推荐
**描述**: 键为固定字符串集合时使用 Record，键动态变化或需要 Map 特性时使用 Map。
**正例**:
```typescript
// 键为固定的已知集合，使用 Record
interface User {
  id: number;
  name: string;
}

type UserCache = Record<number, User>;

const userCache: UserCache = {
  1: { id: 1, name: 'Alice' },
  2: { id: 2, name: 'Bob' },
};

// 键动态变化、需要遍历或频繁增删，使用 Map
const permissionMap = new Map<string, Set<string>>();

function grantPermission(role: string, permission: string): void {
  const permissions = permissionMap.get(role) ?? new Set<string>();
  permissions.add(permission);
  permissionMap.set(role, permissions);
}

// 需要保持插入顺序或键非字符串时，使用 Map
const eventListeners = new Map<HTMLElement, (() => void)[]>();
```
**反例**:
```typescript
// 键动态变化却使用 Record，可能导致属性冲突
const cache: Record<string, User> = {};
cache[userId] = user;
// Object.prototype 上的属性可能被意外访问
if (cache['toString']) { /* 意外匹配 */ }

// 键固定已知却使用 Map，增加不必要的复杂度
const statusMap = new Map<string, string>();
statusMap.set('active', '正常');
statusMap.set('inactive', '禁用');
// 应直接使用 const enum 或 Record
```

# TypeScript - 编码风格规范

## 适用范围
- 适用于所有 TypeScript 项目的编码风格约束
- 参考 TypeScript 官方风格指南与社区最佳实践
- 与类型设计规范、最佳实践规范配合使用
- interface 优先 type、readonly、as const、可辨识联合、不用 namespace、命名导出等实践不再列出，AI 默认遵守

## 规则

### R1: 函数参数和返回值使用显式类型注解
**级别**: 必须
**描述**: 函数的参数和返回值必须添加显式类型注解，不依赖类型推断。显式注解是 API 契约的一部分，方便调用方理解。
**正例**:
```typescript
function formatPrice(price: number, currency: string = 'CNY'): string {
  return `${currency} ${price.toFixed(2)}`;
}

function findUserById(id: number): Promise<User | null> {
  return userRepository.findById(id);
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```
**反例**:
```typescript
function formatPrice(price, currency = 'CNY') {
  return `${currency} ${price.toFixed(2)}`;
}

function findUserById(id) {
  return userRepository.findById(id);
}

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

### R2: 使用 enum 替代魔法数字
**级别**: 必须
**描述**: 状态码、类型标识等魔法数字或字符串必须定义为 enum，提高可读性并防止拼写错误。
**正例**:
```typescript
enum UserStatus {
  Active = 1,
  Inactive = 0,
  Suspended = -1,
}

enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalError = 500,
}

if (user.status === UserStatus.Active) {
  grantAccess(user);
}
```
**反例**:
```typescript
if (user.status === 1) {
  grantAccess(user);
}

if (response.code === 200) {
  handleSuccess(response.data);
}
```

### R3: 泛型参数使用有意义的命名
**级别**: 推荐
**描述**: 泛型参数使用有意义的名称或约定命名（T 通用类型，K 键，V 值，E 元素），避免单字母以外的无意义命名。
**正例**:
```typescript
// 约定命名
function identity<T>(value: T): T {
  return value;
}

function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

// 有意义的命名
interface Repository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
}

interface EventMap<TEventName extends string, TPayload> {
  on(event: TEventName, handler: (payload: TPayload) => void): void;
}
```
**反例**:
```typescript
function identity<A>(value: A): A {
  return value;
}

function getProperty<O, K extends keyof O>(obj: O, key: K): O[K] {
  return obj[key];
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
}
```

# TypeScript - 类型设计规范

## 适用范围
- 适用于所有 TypeScript 项目的类型系统设计
- 与编码风格规范、最佳实践规范配合使用
- 聚焦高级类型特性的正确使用

## 规则

### R1: 使用可辨识联合（Discriminated Union）
**级别**: 必须
**描述**: 多种形态的数据使用可辨识联合类型，通过公共的辨识字段进行类型收窄。
**正例**:
```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}
```
**反例**:
```typescript
interface Shape {
  type: string;
  radius?: number;
  width?: number;
  height?: number;
  base?: number;
}

function getArea(shape: Shape): number {
  if (shape.type === 'circle') {
    // shape.radius 可能为 undefined，需要额外判空
    return Math.PI * (shape.radius ?? 0) ** 2;
  }
  if (shape.type === 'rectangle') {
    return (shape.width ?? 0) * (shape.height ?? 0);
  }
  return 0;
}
```

### R2: 使用工具类型（Partial/Required/Pick/Omit）
**级别**: 推荐
**描述**: 善用 TypeScript 内置工具类型，避免重复定义相似结构。
**正例**:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// 创建时 id 和 createdAt 由系统生成
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;

// 更新时所有字段都是可选的
type UpdateUserDTO = Partial<Omit<User, 'id'>>;

// 列表展示只需要部分字段
type UserListItem = Pick<User, 'id' | 'name' | 'avatar' | 'role'>;

// 批量导入时 email 必填，其他可选
type ImportUserDTO = Partial<Omit<User, 'id' | 'createdAt'>> & Required<Pick<User, 'email'>>;
```
**反例**:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface CreateUserDTO {
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

interface UserListItem {
  id: number;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
}
```

### R3: 使用条件类型
**级别**: 推荐
**描述**: 根据类型条件动态选择类型，实现灵活的类型推导。
**正例**:
```typescript
// 根据是否为数组提取元素类型
type UnwrapArray<T> = T extends Array<infer U> ? U : T;

type A = UnwrapArray<string[]>;   // string
type B = UnwrapArray<number>;     // number

// 根据输入类型决定返回类型
type ApiResponse<T> = T extends void
  ? { success: boolean }
  : { success: boolean; data: T };

// 判断是否为 Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type C = Awaited<Promise<Promise<string>>>; // string
```
**反例**:
```typescript
// 不使用条件类型，手动定义每种情况
type UnwrapArrayString = string;
type UnwrapArrayNumber = number;
type UnwrapArrayBoolean = boolean;

// 无法处理未知类型
function unwrap(value: any): any {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
```

### R4: 编写类型守卫
**级别**: 必须
**描述**: 使用类型守卫（Type Guard）进行运行时类型检查和编译时类型收窄。
**正例**:
```typescript
// 自定义类型守卫函数
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 使用 in 操作符
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function isDog(pet: Dog | Cat): pet is Dog {
  return 'bark' in pet;
}

// 使用
function processValue(value: unknown): string {
  if (isString(value)) {
    // 此处 value 被收窄为 string
    return value.toUpperCase();
  }
  return String(value);
}
```
**反例**:
```typescript
function processValue(value: unknown): string {
  // 强制类型断言，无运行时保护
  return (value as string).toUpperCase();
}

function getPetSound(pet: Dog | Cat): string {
  // 不使用类型守卫，直接假设类型
  if ((pet as Dog).bark) {
    return (pet as Dog).bark();
  }
  return (pet as Cat).meow();
}
```

### R5: 使用泛型约束 extends
**级别**: 必须
**描述**: 泛型参数使用 extends 约束，确保传入类型满足要求。
**正例**:
```typescript
// 约束为对象类型
function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'name'); // 类型安全
// getProperty(user, 'email'); // 编译错误

// 约束为具有特定属性的类型
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// 约束为构造函数
function createInstance<T>(ctor: new () => T): T {
  return new ctor();
}
```
**反例**:
```typescript
// 无约束的泛型
function getProperty(obj: any, key: string): any {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'email'); // 无编译错误，运行时返回 undefined

// 使用 any 代替泛型约束
function findById(items: any[], id: number): any {
  return items.find(item => item.id === id);
}
```

### R6: 使用映射类型
**级别**: 推荐
**描述**: 使用映射类型基于已有类型创建新的类型变体。
**正例**:
```typescript
// 将所有属性变为可选的
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性变为只读的
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将所有属性变为可空的
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 实际应用：表单验证错误
type ValidationErrors<T> = {
  [P in keyof T]?: string[];
};

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
}

const errors: ValidationErrors<RegistrationForm> = {
  email: ['邮箱格式不正确', '该邮箱已注册'],
  password: ['密码长度至少8位'],
};
```
**反例**:
```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// 手动定义可空变体
interface NullableUser {
  name: string | null;
  age: number | null;
  email: string | null;
}

// 手动定义验证错误
interface UserValidationErrors {
  name?: string[];
  age?: string[];
  email?: string[];
}
```

### R7: 使用模板字面量类型
**级别**: 推荐
**描述**: 使用模板字面量类型构建字符串模式类型。
**正例**:
```typescript
// 事件名称类型
type EventName = 'click' | 'hover' | 'focus';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onHover' | 'onFocus'

// CSS 属性类型
type CSSProperty = 'width' | 'height' | 'margin' | 'padding';
type CSSDirection = 'top' | 'right' | 'bottom' | 'left';
type CSSPropertyWithDirection = `${CSSProperty}-${CSSDirection}`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left' | ...

// API 路由类型
type Version = 'v1' | 'v2';
type Resource = 'users' | 'orders' | 'products';
type ApiRoute = `/api/${Version}/${Resource}`;
// '/api/v1/users' | '/api/v1/orders' | '/api/v2/users' | ...
```
**反例**:
```typescript
// 手动列举所有组合
type EventHandler =
  | 'onClick' | 'onHover' | 'onFocus'
  | 'onChange' | 'onSubmit';

type CSSMargin =
  | 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left';

type ApiRoute =
  | '/api/v1/users' | '/api/v1/orders' | '/api/v1/products'
  | '/api/v2/users' | '/api/v2/orders' | '/api/v2/products';
```

### R8: 使用 infer 关键字
**级别**: 推荐
**描述**: 在条件类型中使用 infer 提取和推导嵌套类型。
**正例**:
```typescript
// 提取函数返回值类型
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 解析值类型
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type Result = PromiseValue<Promise<string[]>>; // string[]

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Item = ElementOf<string[]>; // string

// 提取构造函数实例类型
type InstanceOf<T> = T extends new (...args: any[]) => infer I ? I : never;

// 提取对象值的类型
type ValueOf<T> = T extends { [key: string]: infer V } ? V : never;

const config = {
  host: 'localhost',
  port: 3000,
  debug: true,
};

type ConfigValue = ValueOf<typeof config>; // string | number | boolean
```
**反例**:
```typescript
// 手动指定每种返回类型
function getStringPromise(): Promise<string> { /* ... */ }
type StringPromiseResult = string;

function getNumberPromise(): Promise<number> { /* ... */ }
type NumberPromiseResult = number;

// 无法泛化提取逻辑
function processPromise(promise: Promise<any>): any {
  return promise.then(value => value);
}
```

## VUE2

# Vue2 - Options API 组件编写规范

## 适用范围
- 适用于所有基于 Vue2 的项目组件编写
- 使用 Options API 风格
- 与 Vuex 状态管理规范、项目结构规范配合使用

## 规则

### R1: 组件属性声明顺序
**级别**: 必须
**描述**: 组件选项按固定顺序声明：name > components > props > data > computed > watch > methods > lifecycle hooks，保持团队一致性。
**正例**:
```vue
<script>
export default {
  name: 'UserProfile',

  components: {
    UserAvatar,
    UserCard,
  },

  props: {
    userId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      userInfo: null,
    }
  },

  computed: {
    displayName() {
      return this.userInfo?.name || '未知用户'
    },
  },

  watch: {
    userId(newVal) {
      this.fetchUser(newVal)
    },
  },

  methods: {
    async fetchUser(id) {
      this.loading = true
      this.userInfo = await getUserById(id)
      this.loading = false
    },
  },

  // 生命周期钩子按执行顺序排列
  created() {
    this.fetchUser(this.userId)
  },

  mounted() {
    this.initChart()
  },

  beforeDestroy() {
    this.destroyChart()
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  mounted() {        // 生命周期钩子位置混乱
    this.initChart()
  },
  data() {
    return { loading: false }
  },
  methods: {
    fetchUser() {}
  },
  name: 'UserProfile', // name 放在最后
  props: ['userId'],    // 缺少类型定义
  components: { UserAvatar },
  created() {
    this.fetchUser()
  },
  computed: {
    displayName() { return '' }
  },
}
</script>
```

### R2: props 必须包含 type 和 default
**级别**: 必须
**描述**: props 声明必须使用对象语法，包含 `type` 属性和合理的 `default` 值（非必填项）。引用类型默认值必须使用工厂函数。
**正例**:
```vue
<script>
export default {
  props: {
    // 基本类型
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'active',
      validator(value) {
        return ['active', 'inactive', 'pending'].includes(value)
      },
    },
    // 引用类型必须用工厂函数
    items: {
      type: Array,
      default() {
        return []
      },
    },
    config: {
      type: Object,
      default() {
        return { theme: 'light' }
      },
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  // 数组语法，无类型约束
  props: ['title', 'size', 'items'],

  // 缺少 default
  props: {
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      // 非必填但无 default
    },
  },

  // 引用类型直接给对象默认值
  props: {
    items: {
      type: Array,
      default: [],       // 应该用工厂函数
    },
    config: {
      type: Object,
      default: {},       // 所有实例共享同一个对象
    },
  },
}
</script>
```

### R3: 使用 $emit 声明自定义事件
**级别**: 必须
**描述**: 组件必须通过 `emits` 选项声明所有自定义事件，使组件接口清晰可追溯。
**正例**:
```vue
<script>
export default {
  name: 'TodoItem',

  emits: ['toggle', 'remove', 'update:title'],

  props: {
    todo: {
      type: Object,
      required: true,
    },
  },

  methods: {
    handleToggle() {
      this.$emit('toggle', this.todo.id)
    },
    handleRemove() {
      this.$emit('remove', this.todo.id)
    },
    handleTitleChange(newTitle) {
      this.$emit('update:title', newTitle)
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  // 缺少 emits 声明
  props: {
    todo: {
      type: Object,
      required: true,
    },
  },

  methods: {
    handleToggle() {
      // 直接修改 props（反模式）
      this.todo.done = !this.todo.done
      // emit 事件但不声明
      this.$emit('someEvent', this.todo.id, this.todo.done, this.todo.text)
    },
  },
}
</script>
```

### R4: v-model 自定义实现规范
**级别**: 推荐
**描述**: 自定义组件实现 v-model 时，默认使用 `value` prop 和 `input` 事件。Vue 2.2+ 可使用 `model` 选项自定义 prop 和 event 名称。
**正例**:
```vue
<!-- CustomInput.vue -->
<script>
export default {
  name: 'CustomInput',

  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)
    },
  },
}
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    @input="onInput"
  />
</template>
```
**反例**:
```vue
<!-- 不通过 props/emit 实现 v-model -->
<script>
export default {
  props: ['value'],

  methods: {
    onInput(event) {
      // 直接操作父组件数据
      this.$parent.formData.name = event.target.value
    },
  },
}
</script>
```

### R5: data 必须是函数
**级别**: 必须
**描述**: 组件的 `data` 选项必须是函数，返回独立的数据对象，避免多个组件实例共享同一数据。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      loading: false,
      errorMessage: '',
    }
  },
}
</script>
```
**反例**:
```vue
<script>
// data 是对象，所有实例共享
export default {
  data: {
    form: {
      username: '',
      password: '',
    },
    loading: false,
  },
}
</script>
```

### R6: computed 不应有副作用
**级别**: 必须
**描述**: 计算属性应是纯函数，不修改数据、不发起请求、不操作 DOM。副作用逻辑应放在 methods 或 watch 中。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      items: [],
      keyword: '',
    }
  },

  computed: {
    // 纯计算，无副作用
    filteredItems() {
      return this.items.filter(item =>
        item.name.includes(this.keyword)
      )
    },
    totalCount() {
      return this.items.length
    },
  },

  methods: {
    // 副作用放在 methods 中
    async fetchItems() {
      this.loading = true
      this.items = await getItems()
      this.loading = false
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  data() {
    return { items: [] }
  },

  computed: {
    filteredItems() {
      // 在 computed 中发起请求（副作用）
      fetch('/api/items').then(res => {
        this.items = res.data
      })
      return this.items
    },

    badComputed() {
      // 在 computed 中修改其他数据
      this.lastAccessTime = Date.now()
      return this.items.filter(i => i.active)
    },
  },
}
</script>
```

### R7: watch 合理使用 immediate 和 deep
**级别**: 推荐
**描述**: `watch` 按需使用 `immediate` 和 `deep` 选项。`deep` 监听开销较大，只对需要深层监听的对象使用。对象属性监听优先使用字符串路径。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      keyword: '',
      page: 1,
      form: {
        name: '',
        email: '',
        address: {
          city: '',
          street: '',
        },
      },
    }
  },

  watch: {
    // 简单监听，不需要 deep
    keyword(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.page = 1
        this.search()
      }
    },

    // 监听对象特定属性，用点号路径
    'form.address.city'(newVal) {
      this.fetchDistricts(newVal)
    },

    // 需要初始化执行时用 immediate
    userId: {
      handler(newVal) {
        this.fetchUser(newVal)
      },
      immediate: true,
    },

    // 只在确实需要完整对象对比时用 deep
    form: {
      handler(newVal) {
        this.validateForm(newVal)
        this.saveDraft(newVal)
      },
      deep: true,
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  watch: {
    // 所有 watch 都加 deep，性能浪费
    keyword: {
      handler() { this.search() },
      deep: true,   // keyword 是 string，无需 deep
      immediate: true,
    },

    // 监听整个 form 但只需要 city 变化
    form: {
      handler() {
        this.fetchDistricts(this.form.address.city)
      },
      deep: true, // 监听整个 form 过于宽泛
    },
  },
}
</script>
```

### R8: beforeDestroy 中清理资源
**级别**: 必须
**描述**: 在 `beforeDestroy` 钩子中清理定时器、事件监听、WebSocket 连接等资源，防止内存泄漏。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      timer: null,
      resizeObserver: null,
    }
  },

  mounted() {
    this.timer = setInterval(() => {
      this.refreshData()
    }, 30000)

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize()
    })
    this.resizeObserver.observe(this.$el)

    window.addEventListener('resize', this.handleWindowResize)
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    window.removeEventListener('resize', this.handleWindowResize)
  },

  methods: {
    refreshData() { /* ... */ },
    handleResize() { /* ... */ },
    handleWindowResize() { /* ... */ },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  mounted() {
    setInterval(() => {
      this.refreshData()
    }, 30000) // 未保存引用，无法清除

    window.addEventListener('resize', this.handleResize)
    // 缺少 beforeDestroy 清理
  },
}
</script>
```

### R9: 使用 $refs 代替直接 DOM 操作
**级别**: 推荐
**描述**: 需要访问 DOM 元素时使用 `$refs` 引用，避免使用 `document.querySelector` 等直接 DOM 操作。
**正例**:
```vue
<template>
  <div>
    <input ref="searchInput" v-model="keyword" />
    <canvas ref="chartCanvas" />
  </div>
</template>

<script>
export default {
  methods: {
    focusInput() {
      this.$refs.searchInput?.focus()
    },

    initChart() {
      const canvas = this.$refs.chartCanvas
      if (canvas) {
        this.chart = new Chart(canvas, { /* config */ })
      }
    },

    scrollToTop() {
      this.$refs.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  methods: {
    focusInput() {
      // 直接操作 DOM，可能选到其他组件的元素
      document.querySelector('.search-input').focus()
    },

    initChart() {
      const canvas = document.getElementById('chart')
      // 不安全，可能为 null 或选到错误元素
      new Chart(canvas, { /* config */ })
    },
  },
}
</script>
```

### R10: 避免使用 HTML 保留标签名作为组件名
**级别**: 必须
**描述**: 组件名不应与 HTML 保留标签名（如 `header`、`footer`、`section`、`main`、`nav`、`button`、`form`、`table`）冲突，避免 DOM 解析歧义。
**正例**:
```vue
<!-- 注册组件使用不冲突的名称 -->
<script>
export default {
  name: 'AppHeader',
  components: {
    AppHeader: HeaderBar,
    AppFooter: FooterBar,
    NavMenu,
    FormWrapper,
    DataTable,
  },
}
</script>
```
**反例**:
```vue
<!-- 组件名与 HTML 标签冲突 -->
<script>
export default {
  name: 'header',       // 与 <header> 冲突
  components: {
    button: ButtonComponent,   // 与 <button> 冲突
    form: FormComponent,       // 与 <form> 冲突
    table: TableComponent,     // 与 <table> 冲突
  },
}
</script>
```

# Vue2 - 项目目录结构约定

## 适用范围
- 适用于所有基于 Vue CLI + Vue2 的前端项目
- 与组件编写规范、Vuex 状态管理规范配合使用
- 适用于中大型业务项目，小型项目可适当简化

## 规则

### R1: Vue CLI 标准目录结构
**级别**: 必须
**描述**: 项目根目录包含 Vue CLI 配置、Webpack 配置和标准 `src` 目录，使用 `public/index.html` 作为模板。
**正例**:
```
my-vue-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.vue
│   └── main.js
├── package.json
├── vue.config.js
├── babel.config.js
├── .env
├── .env.development
├── .env.production
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```
**反例**:
```
my-vue-app/
├── index.html           # 不应在根目录
├── src/
│   ├── vue.config.js    # 配置不应在 src 中
│   ├── App.vue
│   └── main.js
├── webpack.config.js    # Vue CLI 项目不应直接写 webpack 配置
└── package.json
```

### R2: src 子目录职责划分
**级别**: 必须
**描述**: `src` 目录按职责划分子目录，与 Vue3 项目保持一致的目录理念。
**正例**:
```
src/
├── api/            # 接口请求
├── assets/         # 静态资源
├── components/     # 通用组件
├── directives/     # 自定义指令
├── filters/        # 全局过滤器
├── icons/          # SVG 图标
├── layouts/        # 布局组件
├── mixins/         # 混入
├── router/         # 路由配置
├── store/          # Vuex Store
├── styles/         # 全局样式
├── utils/          # 工具函数
├── views/          # 页面组件
├── App.vue
└── main.js
```
**反例**:
```
src/
├── components/     # 组件、页面、API 混在一起
│   ├── Header.vue
│   ├── LoginPage.vue
│   └── getUserInfo.js
├── helper/         # helper 和 utils 概念重复
├── service/        # service 和 api 概念重复
├── Vuex/           # 命名不统一（大小写混用）
├── style/          # 单数 vs 复数不一致
└── utils.js        # 工具函数直接放在 src 根目录
```

### R3: 路由配置规范
**级别**: 推荐
**描述**: 路由按模块拆分，主文件负责创建实例和全局守卫，子模块按业务分文件。
**正例**:
```
router/
├── index.js          # 创建 router 实例、全局守卫
└── modules/
    ├── user.js       # 用户相关路由
    ├── product.js    # 商品相关路由
    └── admin.js      # 管理后台路由
```
```js
// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import userRoutes from './modules/user'
import productRoutes from './modules/product'
import adminRoutes from './modules/admin'

Vue.use(VueRouter)

const routes = [
  ...userRoutes,
  ...productRoutes,
  ...adminRoutes,
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters['user/isLoggedIn']
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```
**反例**:
```js
// router/index.js 所有路由堆在一起
const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/profile', component: UserProfile },
    { path: '/user/settings', component: UserSettings },
    { path: '/product/list', component: ProductList },
    { path: '/product/detail/:id', component: ProductDetail },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/admin/users', component: AdminUsers },
    // ... 几百行
  ],
})

// 没有路由守卫，权限控制散落在各组件中
```

### R4: axios 拦截器封装
**级别**: 必须
**描述**: 统一封装 axios 实例，配置请求/响应拦截器处理 token 注入、错误处理、loading 状态等。
**正例**:
```
src/api/
├── request.js       # axios 实例封装
├── modules/
│   ├── user.js      # 用户接口
│   └── product.js   # 商品接口
└── index.js         # 统一导出
```
```js
// src/api/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：注入 token
service.interceptors.request.use(
  (config) => {
    const token = store.state.user.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理
service.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0) {
      return data
    }
    Message.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch('user/logout')
      router.push({ name: 'Login' })
    } else {
      Message.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service
```
```js
// src/api/modules/user.js
import request from '../request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function getUserInfo() {
  return request.get('/user/info')
}
```
**反例**:
```vue
<!-- 组件中直接使用 axios -->
<script>
import axios from 'axios'

export default {
  methods: {
    async fetchUser() {
      try {
        const res = await axios.get('http://localhost:3000/api/user')
        this.userInfo = res.data
      } catch (err) {
        alert('出错了') // 错误处理不规范
      }
    },
  },
}
</script>
```

### R5: 全局组件注册规范
**级别**: 推荐
**描述**: 频繁使用的通用组件在 `main.js` 中全局注册，业务组件按需局部注册。全局注册应集中管理。
**正例**:
```js
// src/components/index.js
import Vue from 'vue'
import Button from './Button.vue'
import Modal from './Modal.vue'
import Table from './Table.vue'
import Pagination from './Pagination.vue'

const components = {
  Button,
  Modal,
  Table,
  Pagination,
}

Object.keys(components).forEach((name) => {
  Vue.component(name, components[name])
})
```
```js
// src/main.js
import Vue from 'vue'
import '@/components' // 全局注册通用组件
import App from './App.vue'

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
```
**反例**:
```js
// main.js 中散乱注册
import Vue from 'vue'
import Button from './components/Button.vue'
import Modal from './components/Modal.vue'
import Table from './components/Table.vue'
import UserProfile from './views/UserProfile.vue' // 业务组件不应全局注册

Vue.component('Button', Button)
Vue.component('Modal', Modal)
Vue.component('Table', Table)
Vue.component('UserProfile', UserProfile) // 页面组件全局注册浪费性能
```

### R6: 全局过滤器和指令规范
**级别**: 推荐
**描述**: 全局过滤器和自定义指令集中注册，文件按功能分模块，在 `main.js` 中统一引入。
**正例**:
```
src/filters/
├── index.js       # 统一注册
├── date.js        # 日期格式化
├── number.js      # 数字格式化
└── text.js        # 文本处理

src/directives/
├── index.js       # 统一注册
├── permission.js  # 权限指令 v-permission
├── loading.js     # 加载指令 v-loading
└── lazy.js        # 懒加载指令 v-lazy
```
```js
// src/filters/index.js
import Vue from 'vue'
import { formatDate, formatTime } from './date'
import { formatMoney, formatPercent } from './number'
import { truncate, escapeHtml } from './text'

Vue.filter('date', formatDate)
Vue.filter('time', formatTime)
Vue.filter('money', formatMoney)
Vue.filter('percent', formatPercent)
Vue.filter('truncate', truncate)
```
```js
// src/directives/index.js
import Vue from 'vue'
import permission from './permission'
import loading from './loading'

Vue.directive('permission', permission)
Vue.directive('loading', loading)
```
**反例**:
```js
// main.js 中随意注册
import Vue from 'vue'

Vue.filter('date', (val) => /* ... */)
Vue.filter('money', (val) => /* ... */)
Vue.filter('truncate', (val) => /* ... */)
Vue.directive('permission', { /* ... */ })
Vue.directive('loading', { /* ... */ })
// 过滤器和指令散落在 main.js 中，难以维护
```

### R7: 环境变量使用 VUE_APP_ 前缀
**级别**: 必须
**描述**: Vue CLI 项目中环境变量以 `VUE_APP_` 前缀暴露到客户端，通过 `.env` 文件管理不同环境配置。
**正例**:
```
# .env.development
VUE_APP_TITLE=MyApp Dev
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_ENABLE_MOCK=true

# .env.staging
VUE_APP_TITLE=MyApp Staging
VUE_APP_API_BASE_URL=https://staging-api.example.com
VUE_APP_ENABLE_MOCK=false

# .env.production
VUE_APP_TITLE=MyApp
VUE_APP_API_BASE_URL=https://api.example.com
VUE_APP_ENABLE_MOCK=false
```
```js
// 使用
const baseURL = process.env.VUE_APP_API_BASE_URL
```
**反例**:
```
# .env 不使用 VUE_APP_ 前缀
API_BASE_URL=http://localhost:3000   # 无法在客户端访问

# .env 中存放敏感信息
VUE_APP_SECRET_KEY=abc123            # 暴露给客户端
VUE_APP_DB_PASSWORD=password         # 不应在前端环境变量中
```

### R8: 别名配置
**级别**: 必须
**描述**: 在 `vue.config.js` 中配置 `@` 指向 `src` 目录，简化模块引用路径。
**正例**:
```js
// vue.config.js
const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@store': path.resolve(__dirname, 'src/store'),
      },
    },
  },
}
```
```js
// 使用别名
import Button from '@components/Button.vue'
import { fetchUser } from '@api/modules/user'
import { formatDate } from '@utils/date'
import store from '@store'
```
**反例**:
```js
// 不配置别名，使用多层相对路径
import Button from '../../components/Button.vue'
import { fetchUser } from '../../../api/modules/user'
import { formatDate } from '../../utils/date'
// 文件移动后大量引用路径需要修改
```

# Vue2 - Vuex 状态管理规范

## 适用范围
- 适用于所有 Vue2 项目中使用 Vuex 进行全局状态管理的场景
- 与组件编写规范配合使用
- Vue3 项目应使用 Pinia，不再使用 Vuex

## 规则

### R1: Store 模块化拆分
**级别**: 必须
**描述**: Vuex Store 按业务功能拆分为独立模块，每个模块拥有独立的 state/mutations/actions/getters。
**正例**:
```
store/
├── index.js               # 主入口，组装模块
├── modules/
│   ├── user.js            # 用户模块
│   ├── cart.js            # 购物车模块
│   ├── product.js         # 商品模块
│   └── app.js             # 全局应用状态
└── mutation-types.js      # Mutation 类型常量
```
```js
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import product from './modules/product'
import app from './modules/app'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    cart,
    product,
    app,
  },
  strict: process.env.NODE_ENV !== 'production',
})
```
**反例**:
```js
// store/index.js 所有状态堆在一起
export default new Vuex.Store({
  state: {
    userInfo: null,
    token: '',
    cartItems: [],
    products: [],
    theme: 'light',
    sidebar: { isOpen: true },
    menuList: [],
    permissions: [],
    // ... 几十个字段
  },
  mutations: { /* 几十个 mutation */ },
  actions: { /* 几十个 action */ },
})
```

### R2: State/Mutations/Actions/Getters 职责分明
**级别**: 必须
**描述**: State 存数据，Mutations 同步修改状态，Actions 处理异步逻辑后提交 Mutations，Getters 派生计算。
**正例**:
```js
// store/modules/user.js
export default {
  namespaced: true,

  state: () => ({
    userInfo: null,
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name ?? '未登录',
  },

  // mutations：同步修改 state
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    CLEAR_USER(state) {
      state.userInfo = null
      state.token = ''
    },
  },

  // actions：异步操作后提交 mutation
  actions: {
    async login({ commit }, credentials) {
      const res = await loginApi(credentials)
      commit('SET_TOKEN', res.data.token)
      commit('SET_USER_INFO', res.data.user)
    },

    async logout({ commit }) {
      await logoutApi()
      commit('CLEAR_USER')
    },
  },
}
```
**反例**:
```js
export default {
  state: () => ({ userInfo: null, token: '' }),

  // 在 mutation 中执行异步操作
  mutations: {
    async LOGIN(state, credentials) {
      const res = await loginApi(credentials) // mutation 不应异步
      state.token = res.data.token
    },
  },

  // 在 action 中直接修改 state
  actions: {
    login({ state }, credentials) {
      state.token = 'xxx' // 应通过 commit mutation 修改
    },
  },
}
```

### R3: 异步操作必须放在 Actions 中
**级别**: 必须
**描述**: 所有异步操作（API 请求、定时器等）必须在 Actions 中执行，完成后通过 commit 调用 Mutation 修改状态。Mutation 中禁止异步操作。
**正例**:
```js
// store/modules/product.js
export default {
  namespaced: true,

  state: () => ({
    productList: [],
    loading: false,
    error: null,
  }),

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_PRODUCT_LIST(state, list) {
      state.productList = list
    },
    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    async fetchProducts({ commit }, params) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const res = await getProductList(params)
        commit('SET_PRODUCT_LIST', res.data.list)
      } catch (err) {
        commit('SET_ERROR', err.message)
        throw err
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
}
```
**反例**:
```js
export default {
  state: () => ({ productList: [] }),

  mutations: {
    // mutation 中直接发请求（严重违规）
    LOAD_PRODUCTS(state) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          state.productList = data
        })
    },
  },

  // 组件中绕过 action 直接操作
  // this.$store.state.product.productList = newData
}
```

### R4: 模块必须启用 namespaced
**级别**: 必须
**描述**: 所有 Vuex 模块必须设置 `namespaced: true`，避免命名冲突。
**正例**:
```js
// store/modules/user.js
export default {
  namespaced: true,  // 必须启用

  state: () => ({ token: '' }),

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
  },

  actions: {
    login({ commit }, credentials) {
      commit('SET_TOKEN', 'token-value')
    },
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
  },
}

// 组件中使用时带模块前缀
// this.$store.dispatch('user/login', credentials)
// this.$store.getters['user/isLoggedIn']
```
**反例**:
```js
// 缺少 namespaced
export default {
  state: () => ({ token: '' }),
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
  },
}
// 此时 SET_TOKEN 注册在全局，多个模块可能冲突
```

### R5: 使用 MutationTypes 常量
**级别**: 推荐
**描述**: Mutation 类型使用常量定义，集中管理，避免字符串拼写错误。
**正例**:
```js
// store/mutation-types.js
export const SET_TOKEN = 'SET_TOKEN'
export const SET_USER_INFO = 'SET_USER_INFO'
export const CLEAR_USER = 'CLEAR_USER'
export const SET_PRODUCT_LIST = 'SET_PRODUCT_LIST'
export const ADD_CART_ITEM = 'ADD_CART_ITEM'
export const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM'
```
```js
// store/modules/user.js
import { SET_TOKEN, SET_USER_INFO, CLEAR_USER } from '../mutation-types'

export default {
  namespaced: true,

  state: () => ({ userInfo: null, token: '' }),

  mutations: {
    [SET_TOKEN](state, token) {
      state.token = token
    },
    [SET_USER_INFO](state, userInfo) {
      state.userInfo = userInfo
    },
    [CLEAR_USER](state) {
      state.userInfo = null
      state.token = ''
    },
  },
}
```
**反例**:
```js
// mutation 类型字符串散落各处，容易拼写错误
export default {
  mutations: {
    SET_TOKEN(state, token) { state.token = token },
  },
}

// 组件中直接写字符串
this.$store.commit('SET_TOKNE', token) // 拼写错误，难以排查
```

### R6: 禁止直接修改 State
**级别**: 必须
**描述**: 禁止在组件中直接修改 `this.$store.state.xxx`，必须通过 commit mutation 修改。开启 `strict: true` 模式辅助检测。
**正例**:
```vue
<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  methods: {
    ...mapMutations('user', ['SET_TOKEN']),

    handleLogin() {
      // 通过 commit mutation 修改状态
      this.SET_TOKEN('new-token')

      // 或通过 action
      this.$store.dispatch('user/login', {
        username: 'admin',
        password: '123456',
      })
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  methods: {
    handleLogin() {
      // 直接修改 state（严重违规）
      this.$store.state.user.token = 'new-token'
      this.$store.state.user.userInfo = { name: 'admin' }
    },
  },
}
</script>
```

### R7: 使用 mapState/mapGetters/mapActions 辅助函数
**级别**: 推荐
**描述**: 组件中使用 `mapState`、`mapGetters`、`mapMutations`、`mapActions` 辅助函数简化 Store 访问，减少样板代码。
**正例**:
```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // 映射 state
    ...mapState('user', ['userInfo', 'token']),
    ...mapState('cart', ['items']),

    // 映射 getters
    ...mapGetters('user', ['isLoggedIn', 'userName']),
    ...mapGetters('cart', ['totalCount', 'totalPrice']),
  },

  methods: {
    // 映射 actions
    ...mapActions('user', ['login', 'logout']),
    ...mapActions('cart', ['addItem', 'removeItem']),

    handleLogin() {
      this.login(this.form)
    },
  },
}
</script>

<template>
  <div v-if="isLoggedIn">
    <span>{{ userName }}</span>
    <span>购物车: {{ totalCount }} 件</span>
  </div>
</template>
```
**反例**:
```vue
<script>
export default {
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    },
    isLoggedIn() {
      return this.$store.getters['user/isLoggedIn']
    },
    cartItems() {
      return this.$store.state.cart.items
    },
    // 每个状态都写一个 computed，样板代码过多
  },

  methods: {
    handleLogin() {
      this.$store.dispatch('user/login', this.form)
    },
    handleLogout() {
      this.$store.dispatch('user/logout')
    },
  },
}
</script>
```

### R8: 按业务功能拆分模块
**级别**: 推荐
**描述**: Vuex 模块按业务功能拆分，每个模块职责单一，不过度拆分也不过度合并。
**正例**:
```
store/
├── index.js
├── mutation-types.js
└── modules/
    ├── user.js           # 用户登录、信息
    ├── permission.js     # 权限、菜单、角色
    ├── cart.js           # 购物车
    ├── order.js          # 订单
    └── app.js            # 全局 UI 状态（主题、语言、侧边栏）
```
```js
// 每个模块结构清晰
// store/modules/cart.js
export default {
  namespaced: true,
  state: () => ({
    items: [],
  }),
  getters: {
    totalCount: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  mutations: {
    ADD_ITEM(state, item) { /* ... */ },
    REMOVE_ITEM(state, id) { /* ... */ },
    CLEAR_CART(state) { state.items = [] },
  },
  actions: {
    addItem({ commit }, item) { commit('ADD_ITEM', item) },
    checkout({ state, commit }) { /* 异步提交订单 */ },
  },
}
```
**反例**:
```
store/
├── index.js
└── modules/
    ├── all.js            # 所有逻辑在一个文件
    ├── data.js           # 按技术层划分而非业务
    └── ui.js             # 按技术层划分而非业务
```

## VUE3

# Vue3 - 组件编写规范

## 适用范围
- 适用于所有基于 Vue3 的项目组件编写
- 使用 `<script setup>` + TypeScript 组合式语法
- 与 Composition API 规范、TypeScript 使用规范配合使用

## 规则

### R1: 组件文件使用 PascalCase 命名
**级别**: 必须
**描述**: 组件文件名使用 PascalCase 风格，每个单词首字母大写，与组件注册名保持一致。
**正例**:
```
components/
├── UserProfile.vue
├── SearchBar.vue
├── TodoList.vue
└── DatePicker.vue
```
**反例**:
```
components/
├── userProfile.vue
├── search-bar.vue
├── todolist.vue
└── date_picker.vue
```

### R2: 使用 script setup + TypeScript
**级别**: 必须
**描述**: 组件必须使用 `<script setup lang="ts">` 语法糖，充分利用编译时类型检查。
**正例**:
```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
const increment = (): void => {
  count.value++
}
</script>
```
**反例**:
```vue
<script>
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

### R3: defineProps 配合 TS interface 定义
**级别**: 必须
**描述**: 使用 `defineProps` 泛型方式声明 props，配合 TypeScript interface 明确类型约束。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0,
  },
})
</script>
```

### R4: defineEmits 配合 TS 泛型定义
**级别**: 必须
**描述**: 使用 `defineEmits` 的泛型签名声明事件，明确事件名与参数类型。
**正例**:
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', id: number): void
  (e: 'delete', id: number, reason: string): void
  (e: 'change', value: string): void
}>()

const handleDelete = (): void => {
  emit('delete', props.id, 'expired')
}
</script>
```
**反例**:
```vue
<script setup lang="ts">
const emit = defineEmits(['update', 'delete', 'change'])

const handleDelete = () => {
  emit('delete') // 参数丢失，类型不安全
}
</script>
```

### R5: 组件目录结构组织
**级别**: 推荐
**描述**: 复杂组件采用目录结构，`index.vue` 为入口，配套文件就近放置。
**正例**:
```
components/
├── SearchBar/
│   ├── index.vue
│   ├── SearchBar.types.ts
│   ├── useSearchBar.ts
│   └── SearchBar.module.less
├── UserProfile.vue        # 简单组件可直接单文件
└── index.ts               # 统一导出
```
**反例**:
```
components/
├── SearchBar.vue
├── SearchBarTypes.ts       # 类型和组件分离太远
├── search-helper.ts        # 命名混乱，不关联
├── UserProfile.vue
└── types.ts                # 所有类型堆在一个文件
```

### R6: props 默认值使用 withDefaults
**级别**: 必须
**描述**: 当 props 有可选属性时，使用 `withDefaults` 设置默认值，不使用运行时声明方式。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  pageSize?: number
  disabled?: boolean
  tags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  disabled: false,
  tags: () => ['default'],
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  pageSize?: number
}

const props = defineProps<Props>()
// 不设置默认值，使用时需要反复判断 undefined
const size = props.pageSize ?? 10
const size2 = props.pageSize !== undefined ? props.pageSize : 10
</script>
```

### R7: 使用 defineOptions 设置组件名
**级别**: 推荐
**描述**: 在需要组件名的场景（如 keep-alive、devtools 调试）下，使用 `defineOptions` 设置 name。
**正例**:
```vue
<script setup lang="ts">
defineOptions({
  name: 'UserProfile',
  inheritAttrs: false,
})

interface Props {
  userId: number
}
defineProps<Props>()
</script>
```
**反例**:
```vue
<script lang="ts">
// 额外使用普通 script 只为设置 name
export default {
  name: 'UserProfile',
}
</script>

<script setup lang="ts">
defineProps<{
  userId: number
}>()
</script>
```

### R8: v-slot 使用具名插槽
**级别**: 推荐
**描述**: 使用 `v-slot:name` 或 `#name` 语法声明具名插槽，默认插槽使用 `#default`，避免使用废弃的 `slot` 属性。
**正例**:
```vue
<!-- 父组件 -->
<template>
  <Card>
    <template #header>
      <h2>标题</h2>
    </template>
    <template #default>
      <p>内容区域</p>
    </template>
    <template #footer="{ actions }">
      <Button @click="actions.save">保存</Button>
    </template>
  </Card>
</template>
```
**反例**:
```vue
<!-- 父组件 -->
<template>
  <Card>
    <template v-slot:header>
      <h2>标题</h2>
    </template>
    <!-- 不使用 #default 而是直接写内容与具名插槽混用 -->
    <p>内容区域</p>
    <!-- 使用废弃语法 -->
    <div slot="footer">底部</div>
  </Card>
</template>
```

### R9: 使用 scoped 限定样式作用域
**级别**: 必须
**描述**: 组件样式必须添加 `scoped` 属性，避免样式泄漏影响全局。如需覆盖子组件样式，使用 `:deep()` 选择器。
**正例**:
```vue
<template>
  <div class="user-card">
    <h3 class="user-card__name">{{ name }}</h3>
    <ChildComponent class="child" />
  </div>
</template>

<style scoped>
.user-card {
  padding: 16px;
}

.user-card__name {
  font-size: 18px;
}

/* 需要 override 子组件样式时使用 :deep() */
.user-card :deep(.child__inner) {
  color: red;
}
</style>
```
**反例**:
```vue
<template>
  <div class="user-card">
    <h3>{{ name }}</h3>
  </div>
</template>

<style>
/* 无 scoped，样式污染全局 */
.user-card h3 {
  font-size: 18px;
}

/* 使用废弃的 >>> 或 /deep/ */
.user-card >>> .child-inner {
  color: red;
}
</style>
```

### R10: 模板中不写复杂表达式
**级别**: 推荐
**描述**: template 中只写简单表达式（属性访问、函数调用、三元运算），复杂逻辑抽取到 computed 或方法中。
**正例**:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  price: number
  discount: number
  taxRate: number
}>()

const finalPrice = computed((): string => {
  const discounted = props.price * (1 - props.discount)
  const withTax = discounted * (1 + props.taxRate)
  return withTax.toFixed(2)
})
</script>

<template>
  <span>{{ finalPrice }}</span>
</template>
```
**反例**:
```vue
<template>
  <!-- 复杂计算直接写在模板中 -->
  <span>{{ (price * (1 - discount) * (1 + taxRate)).toFixed(2) }}</span>
</template>
```

### R11: v-for 必须绑定 key
**级别**: 必须
**描述**: 使用 `v-for` 渲染列表时必须绑定唯一的 `key`，优先使用数据 id，禁止使用 index。
**正例**:
```vue
<template>
  <div
    v-for="item in todoList"
    :key="item.id"
    class="todo-item"
  >
    {{ item.text }}
  </div>
</template>
```
**反例**:
```vue
<template>
  <!-- 无 key -->
  <div v-for="item in todoList" class="todo-item">
    {{ item.text }}
  </div>

  <!-- 使用 index 作为 key -->
  <div
    v-for="(item, index) in todoList"
    :key="index"
    class="todo-item"
  >
    {{ item.text }}
  </div>
</template>
```

### R12: 优先使用 props 和 emit 通信
**级别**: 必须
**描述**: 父子组件间优先通过 props 向下传数据、emit 向上发事件。避免使用 provide/inject、事件总线、全局状态等方式替代基础通信。
**正例**:
```vue
<!-- 子组件 TodoItem.vue -->
<script setup lang="ts">
interface Props {
  todo: { id: number; text: string; done: boolean }
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'remove', id: number): void
}>()
</script>

<template>
  <div class="todo-item" @click="emit('toggle', todo.id)">
    <span>{{ todo.text }}</span>
    <button @click.stop="emit('remove', todo.id)">删除</button>
  </div>
</template>
```
**反例**:
```vue
<!-- 子组件直接修改 props 或使用全局事件 -->
<script setup lang="ts">
import { useTodoStore } from '@/stores/todo'

const props = defineProps<{ todo: any }>()
const todoStore = useTodoStore()

// 直接调用 store 方法，绕过 props/emit 通信
const handleRemove = () => {
  todoStore.removeTodo(props.todo.id)
}
</script>
```

# Vue3 - Composition API 规范

## 适用范围
- 适用于所有 Vue3 项目中使用 Composition API 的场景
- 使用 `<script setup>` 语法糖
- 与组件编写规范、TypeScript 使用规范配合使用

## 规则

### R1: ref 用于基本类型，reactive 用于对象
**级别**: 必须
**描述**: 基本类型（string、number、boolean）使用 `ref`，对象类型使用 `reactive`。在 composable 返回值中统一使用 `ref` 保持一致性。
**正例**:
```ts
import { ref, reactive } from 'vue'

// 基本类型用 ref
const count = ref(0)
const message = ref('hello')
const isActive = ref(false)

// 对象用 reactive
const form = reactive({
  username: '',
  password: '',
  remember: false,
})
```
**反例**:
```ts
import { ref, reactive } from 'vue'

// 基本类型用 reactive（不合法，reactive 只接受对象）
const count = reactive(0) // 警告：不能用于基本类型

// 简单对象用 ref 包裹（不必要的 .value 访问）
const form = ref({
  username: '',
  password: '',
})
// 每次都要 form.value.username
```

### R2: 合理使用 computed 缓存计算属性
**级别**: 必须
**描述**: `computed` 具有缓存特性，只在依赖变化时重新计算。需要缓存的派生数据用 `computed`，每次都需要重新执行的逻辑用普通函数。
**正例**:
```ts
import { ref, computed } from 'vue'

const items = ref<Item[]>([])

// 依赖不变时不会重新计算，自动缓存
const activeItems = computed(() => items.value.filter(item => item.active))
const totalCount = computed(() => items.value.length)

// 需要接受参数且不缓存时使用普通函数
const getItemById = (id: number) => items.value.find(item => item.id === id)
```
**反例**:
```ts
import { ref } from 'vue'

const items = ref<Item[]>([])

// 用方法替代 computed，每次渲染都重新计算
const getActiveItems = () => items.value.filter(item => item.active)

// 在 computed 中执行副作用
const badComputed = computed(() => {
  console.log('side effect') // 不应在 computed 中产生副作用
  return items.value.filter(item => item.active)
})
```

### R3: watch 与 watchEffect 的选择
**级别**: 推荐
**描述**: 需要明确监听特定数据源时用 `watch`；需要自动追踪回调内所有响应式依赖时用 `watchEffect`。优先使用 `watch`，因其更明确可控。
**正例**:
```ts
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')
const page = ref(1)

// watch：明确指定监听源，可访问新值和旧值
watch([keyword, page], ([newKeyword, newPage], [oldKeyword, oldPage]) => {
  if (newKeyword !== oldKeyword) {
    page.value = 1 // 关键词变化时重置页码
  }
  fetchData(newKeyword, newPage)
})

// watchEffect：自动追踪依赖，适合初始化时立即执行
watchEffect(() => {
  console.log(`当前关键词: ${keyword.value}, 页码: ${page.value}`)
})
```
**反例**:
```ts
import { ref, watchEffect } from 'vue'

const keyword = ref('')
const page = ref(1)

// 用 watchEffect 替代 watch，无法获取旧值，无法做条件判断
watchEffect(() => {
  // 无法判断是 keyword 变了还是 page 变了
  fetchData(keyword.value, page.value)
})

// 用 watch 监听过多不相关数据
const theme = ref('dark')
const lang = ref('zh')
watch([keyword, page, theme, lang], () => {
  // theme 和 lang 变化不该触发数据请求
  fetchData(keyword.value, page.value)
})
```

### R4: 生命周期钩子使用规范
**级别**: 推荐
**描述**: 在 `setup` 中使用 `onMounted`、`onUnmounted` 等钩子函数，保持成对使用（如 `onMounted` 与 `onUnmounted` 配对清理资源）。
**正例**:
```ts
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    refreshData()
  }, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// keep-alive 组件使用 activated/deactivated
onActivated(() => {
  refreshData()
})
```
**反例**:
```ts
// 在 setup 外使用 Options API 钩子
export default {
  mounted() {
    this.timer = setInterval(() => this.refreshData(), 30000)
  },
}

// 只注册不清除
import { onMounted } from 'vue'

onMounted(() => {
  const timer = setInterval(() => refreshData(), 30000)
  // 缺少 onUnmounted 清理，组件卸载后定时器仍在运行
})
```

### R5: Composable 函数以 use 前缀命名
**级别**: 必须
**描述**: 自定义组合式函数统一以 `use` 前缀命名（如 `useUserList`、`usePagination`），文件名与函数名保持一致。
**正例**:
```ts
// composables/usePagination.ts
import { ref, computed, type ComputedRef } from 'vue'

interface PaginationOptions {
  pageSize?: number
  total?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const currentPage = ref(1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(options.total ?? 0)

  const totalPages: ComputedRef<number> = computed(() =>
    Math.ceil(total.value / pageSize.value)
  )

  const setPage = (page: number): void => {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  return { currentPage, pageSize, total, totalPages, setPage }
}
```
**反例**:
```ts
// composables/pagination.ts
export function getPagination() { // 缺少 use 前缀
  const currentPage = ref(1)
  return { currentPage }
}

// composables/usePag.ts  文件名与导出名不一致
export function usePagination() { /* ... */ }
```

### R6: 使用 toRefs 保持响应性
**级别**: 推荐
**描述**: 从 `reactive` 对象解构或从 composable 返回 reactive 属性时，使用 `toRefs` 保持响应性。从 `props` 解构时使用 `toRefs` 而非直接解构。
**正例**:
```ts
import { reactive, toRefs, toRef } from 'vue'

const state = reactive({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
})

// 使用 toRefs 解构保持响应性
const { name, age } = toRefs(state)
// name.value 仍然是响应式的

// 只取单个属性用 toRef
const email = toRef(state, 'email')
```
**反例**:
```ts
import { reactive } from 'vue'

const state = reactive({
  name: 'Alice',
  age: 25,
})

// 直接解构丢失响应性
const { name, age } = state
// name 和 age 变成普通值，不再是响应式
```

### R7: 不直接解构 reactive 对象
**级别**: 必须
**描述**: 对 `reactive` 对象直接解构会丢失响应性。需要解构时使用 `toRefs`，或将整个对象传递。
**正例**:
```vue
<script setup lang="ts">
import { reactive, toRefs } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

// 使用 toRefs 保持响应性
const { username, password } = toRefs(form)
</script>

<template>
  <input v-model="username" />
  <input v-model="password" />
</template>
```
**反例**:
```vue
<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

// 直接解构，失去响应性
const { username, password } = form
</script>

<template>
  <!-- v-model 绑定后无法更新 -->
  <input v-model="username" />
  <input v-model="password" />
</template>
```

### R9: nextTick 的正确使用场景
**级别**: 推荐
**描述**: 在需要操作 DOM 更新后的状态时使用 `nextTick`，如表单聚焦、获取元素尺寸、操作更新后的 DOM。
**正例**:
```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'

const showInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = async (): Promise<void> => {
  showInput.value = true
  // 等待 DOM 更新完成后再聚焦
  await nextTick()
  inputRef.value?.focus()
}

const list = ref<string[]>(['a', 'b', 'c'])

const addItem = async (item: string): Promise<void> => {
  list.value.push(item)
  await nextTick()
  // DOM 已更新，可以安全获取列表高度
  const container = document.querySelector('.list-container')
  container?.scrollTo({ top: container.scrollHeight })
}
</script>
```
**反例**:
```vue
<script setup lang="ts">
import { ref } from 'vue'

const showInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = (): void => {
  showInput.value = true
  // DOM 还未更新，inputRef 可能为 null
  inputRef.value?.focus()
}
</script>
```

### R10: 卸载时清理副作用
**级别**: 必须
**描述**: 在组件卸载时必须清理所有副作用，包括定时器、事件监听、WebSocket 连接、订阅等，避免内存泄漏。
**正例**:
```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(url: string) {
  const data = ref<string>('')
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    ws = new WebSocket(url)
    ws.onmessage = (event) => {
      data.value = event.data
    }
  })

  onUnmounted(() => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
  })

  return { data }
}
```
**反例**:
```ts
import { ref, onMounted } from 'vue'

export function useWebSocket(url: string) {
  const data = ref<string>('')

  onMounted(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      data.value = event.data
    }
    ws.onclose = () => {
      // 无限重连，组件卸载后仍在运行
      setTimeout(() => {
        const newWs = new WebSocket(url)
        // ...
      }, 3000)
    }
  })
  // 缺少 onUnmounted 清理
  return { data }
}
```

# Vue3 - CSS/LESS 样式规范

## 适用范围
- 适用于所有 Vue3 项目的样式编写
- 推荐使用 LESS 预处理器
- 与组件编写规范配合使用

## 规则

### R1: 组件样式必须使用 scoped
**级别**: 必须
**描述**: 所有组件的 `<style>` 标签必须添加 `scoped` 属性，将样式限制在当前组件作用域内。
**正例**:
```vue
<template>
  <div class="card">
    <h3 class="card__title">{{ title }}</h3>
    <p class="card__desc">{{ desc }}</p>
  </div>
</template>

<style lang="less" scoped>
.card {
  padding: 16px;
  border-radius: 8px;

  &__title {
    font-size: 18px;
    font-weight: bold;
  }

  &__desc {
    color: #666;
    margin-top: 8px;
  }
}
</style>
```
**反例**:
```vue
<template>
  <div class="card">
    <h3>{{ title }}</h3>
  </div>
</template>

<!-- 无 scoped，样式影响全局 -->
<style lang="less">
.card {
  padding: 16px;
}
.card h3 {
  font-size: 18px; /* 所有 .card h3 都受影响 */
}
</style>
```

### R2: BEM 命名规范
**级别**: 推荐
**描述**: CSS 类名遵循 BEM（Block Element Modifier）命名规范：`.block__element--modifier`，避免层级过深。
**正例**:
```vue
<template>
  <div class="user-card">
    <img class="user-card__avatar" :src="avatar" />
    <div class="user-card__info">
      <span class="user-card__name">{{ name }}</span>
      <span class="user-card__role user-card__role--admin">管理员</span>
    </div>
    <button class="user-card__action user-card__action--disabled">
      编辑
    </button>
  </div>
</template>

<style lang="less" scoped>
.user-card {
  display: flex;
  padding: 16px;

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
  }

  &__role--admin {
    color: #1890ff;
  }

  &__action--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```
**反例**:
```vue
<template>
  <div class="card">
    <div class="card top section">
      <img class="avatar" />
      <span class="name">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 类名语义不清，嵌套过深 */
.card .top .section .avatar { }
.card .top .section .name { }
/* 不使用 BEM 难以维护 */
.card .top .section .name.active.highlight { }
</style>
```

### R3: 使用 CSS 变量管理主题
**级别**: 推荐
**描述**: 在全局样式中使用 CSS 自定义属性（CSS Variables）定义主题色、间距等，便于主题切换和统一管理。
**正例**:
```css
/* styles/variables.css */
:root {
  /* 主题色 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #f5222d;
  --color-text: #333;
  --color-text-secondary: #666;
  --color-bg: #fff;
  --color-border: #d9d9d9;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-primary: #177ddc;
  --color-text: #fff;
  --color-bg: #141414;
  --color-border: #434343;
}
```
```vue
<style lang="less" scoped>
.btn {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
}
</style>
```
**反例**:
```vue
<style scoped>
/* 硬编码颜色值，分散在各组件中 */
.btn-primary { background: #1890ff; }
.btn-danger { background: #f5222d; }
.header { color: #333; background: #fff; border: 1px solid #d9d9d9; }
/* 修改主题色需要逐一查找替换 */
</style>
```

### R5: 响应式断点使用 768/992/1200
**级别**: 推荐
**描述**: 统一使用 768px、992px、1200px 作为响应式断点，分别对应移动端、平板、小桌面、大桌面。
**正例**:
```less
// styles/variables.less
@screen-sm: 768px;   // 平板
@screen-md: 992px;   // 小桌面
@screen-lg: 1200px;  // 大桌面

// styles/mixins.less
.responsive-sm(@rules) {
  @media (min-width: @screen-sm) { @rules(); }
}
.responsive-md(@rules) {
  @media (min-width: @screen-md) { @rules(); }
}
.responsive-lg(@rules) {
  @media (min-width: @screen-lg) { @rules(); }
}
```
```vue
<style lang="less" scoped>
.container {
  padding: var(--spacing-sm);

  @media (min-width: @screen-sm) {
    padding: var(--spacing-md);
  }

  @media (min-width: @screen-md) {
    padding: var(--spacing-lg);
    max-width: 960px;
  }

  @media (min-width: @screen-lg) {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
```
**反例**:
```vue
<style scoped>
/* 断点值随意，不统一 */
@media (max-width: 600px) { .container { padding: 8px; } }
@media (min-width: 800px) { .container { padding: 16px; } }
@media (min-width: 1100px) { .container { padding: 24px; } }
/* 与其他组件断点不一致 */
</style>
```

### R6: 使用 :deep() 穿透 scoped 样式
**级别**: 推荐
**描述**: 当需要覆盖子组件样式时，使用 `:deep()` 伪类函数穿透 scoped 限制。禁止使用废弃的 `>>>` 或 `/deep/`。
**正例**:
```vue
<template>
  <div class="wrapper">
    <ChildComponent class="child" />
    <el-table class="data-table" :data="tableData" />
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  padding: 16px;
}

/* 覆盖子组件样式 */
.wrapper :deep(.child__inner) {
  color: red;
}

/* 覆盖 Element Plus 组件样式 */
.data-table :deep(.el-table__header) {
  background-color: #f5f5f5;
}

.data-table :deep(.el-table__cell) {
  padding: 12px 0;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用废弃语法 */
.wrapper >>> .child__inner { color: red; }
.wrapper /deep/ .child__inner { color: red; }

/* 去掉 scoped 来覆盖样式（影响全局） */
</style>

<style>
/* 全局覆盖组件库样式 */
.el-table__header {
  background-color: #f5f5f5;
}
</style>
```

### R7: z-index 分层管理
**级别**: 推荐
**描述**: z-index 按层级使用，通过 CSS 变量统一管理，避免 z-index 军备竞赛。
**正例**:
```css
/* styles/variables.css */
:root {
  --z-index-normal: 1;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal-backdrop: 400;
  --z-index-modal: 500;
  --z-index-popover: 600;
  --z-index-tooltip: 700;
  --z-index-notification: 800;
}
```
```vue
<style lang="less" scoped>
.header {
  position: fixed;
  z-index: var(--z-index-fixed);
}

.dropdown-menu {
  position: absolute;
  z-index: var(--z-index-dropdown);
}

.modal-overlay {
  z-index: var(--z-index-modal-backdrop);
}

.modal-content {
  z-index: var(--z-index-modal);
}
</style>
```
**反例**:
```vue
<style scoped>
/* z-index 值随意递增 */
.header { z-index: 999; }
.dropdown { z-index: 9999; }
.modal { z-index: 99999; }
.tooltip { z-index: 999999; }
.notification { z-index: 9999999; }
/* 无法维护，不断增加 */
</style>
```

### R8: 禁止使用 !important
**级别**: 必须
**描述**: 禁止使用 `!important` 声明。应通过提高选择器优先级、调整 CSS 顺序或使用 `:deep()` 等方式解决样式覆盖问题。
**正例**:
```vue
<style lang="less" scoped>
/* 通过更具体的选择器提高优先级 */
.wrapper .btn.primary {
  background-color: var(--color-primary);
}

/* 使用 :deep 覆盖子组件样式 */
:deep(.el-input__inner) {
  border-color: var(--color-primary);
}

/* 使用 :where 降低优先级（当需要被轻松覆盖时） */
:where(.base-button) {
  padding: 8px 16px;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用 !important 强制覆盖 */
.btn { color: red !important; }
.title { font-size: 16px !important; }
.el-input__inner { border: 1px solid red !important; }

/* 层层叠加 !important */
.wrapper .btn { color: blue !important; }
</style>
```

### R9: 优先使用 Flexbox 和 Grid 布局
**级别**: 推荐
**描述**: 布局优先使用 Flexbox 和 CSS Grid，避免使用 float、table 等传统布局方式。
**正例**:
```vue
<style lang="less" scoped>
/* Flexbox 一维布局 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 56px;
}

/* Grid 二维布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 常见居中 */
.center-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* 侧边栏 + 内容布局 */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用 float 布局 */
.sidebar { float: left; width: 240px; }
.content { float: right; width: calc(100% - 240px); }
.container::after { content: ''; clear: both; display: table; }

/* 使用 table 布局 */
.layout { display: table; width: 100%; }
.sidebar { display: table-cell; width: 240px; }
.content { display: table-cell; }
</style>
```

# Vue3 - 项目目录结构约定

## 适用范围
- 适用于所有基于 Vite + Vue3 + TypeScript 的前端项目
- 与组件编写规范、状态管理规范配合使用
- 适用于中大型业务项目，小型项目可适当简化

## 规则

### R1: Vite + Vue3 标准目录结构
**级别**: 必须
**描述**: 项目根目录包含 Vite 配置、TypeScript 配置和标准 `src` 目录，使用 `index.html` 作为入口。
**正例**:
```
my-vue-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .env
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── public/
│   └── favicon.ico
└── src/
    ├── App.vue
    ├── main.ts
    └── ...
```
**反例**:
```
my-vue-app/
├── public/
│   └── index.html      # 不应放在 public 中
├── src/
│   ├── config/
│   │   └── vite.js      # Vite 配置不应在 src 中
│   ├── App.vue
│   └── main.js          # 缺少 TypeScript
├── vite.config.js       # 应使用 .ts
└── tsconfig.json
```

### R2: src 子目录职责划分
**级别**: 必须
**描述**: `src` 目录下按职责划分子目录，每个目录有明确的职责边界。
**正例**:
```
src/
├── api/            # 接口请求，按模块分文件
├── assets/         # 静态资源（图片、字体等，会被构建处理）
├── components/     # 通用组件
├── composables/    # 组合式函数（useXxx.ts）
├── constants/      # 常量定义
├── directives/     # 自定义指令
├── layouts/        # 布局组件
├── pages/          # 页面级组件（或 views/）
├── plugins/        # 插件配置
├── router/         # 路由配置
├── stores/         # Pinia Store
├── styles/         # 全局样式
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
├── App.vue
└── main.ts
```
**反例**:
```
src/
├── components/     # 组件、页面、布局混在一起
│   ├── Header.vue
│   ├── LoginPage.vue
│   └── AdminLayout.vue
├── helpers/        # helpers 和 utils 概念重复
├── services/       # services 和 api 概念重复
├── store/          # 命名不统一（store vs stores）
├── style/          # 命名不统一（style vs styles）
└── types.ts        # 所有类型堆在一个文件
```

### R3: 路由模块化拆分
**级别**: 推荐
**描述**: 路由按业务模块拆分为独立文件，主路由文件只负责汇总和全局配置。
**正例**:
```
router/
├── index.ts            # 主路由入口，创建 router 实例
├── guards.ts           # 全局路由守卫
├── routes/
│   ├── index.ts        # 汇总所有模块路由
│   ├── user.ts         # 用户模块路由
│   ├── product.ts      # 商品模块路由
│   └── admin.ts        # 管理后台路由
└── types.ts            # 路由元信息类型扩展
```
```ts
// router/routes/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/pages/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
]

export default userRoutes
```
**反例**:
```ts
// router/index.ts 所有路由堆在一个文件
const routes = [
  { path: '/', component: Home },
  { path: '/user/profile', component: UserProfile },
  { path: '/user/settings', component: UserSettings },
  { path: '/product/list', component: ProductList },
  { path: '/product/detail/:id', component: ProductDetail },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/users', component: AdminUsers },
  // ... 几百行路由定义
]
```

### R4: 环境变量使用 .env 文件
**级别**: 必须
**描述**: 环境变量通过 `.env` 文件管理，Vite 项目中以 `VITE_` 前缀暴露到客户端，配合 `ImportMetaEnv` 类型定义。
**正例**:
```
# .env.development
VITE_APP_TITLE=MyApp Dev
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MOCK=true

# .env.production
VITE_APP_TITLE=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK=false
```
```ts
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```
**反例**:
```
# .env 不使用 VITE_ 前缀
API_BASE_URL=http://localhost:3000   # 在客户端中无法访问
SECRET_KEY=abc123                     # 敏感信息不应放在 .env 中暴露给客户端
```

### R5: 组件按用途分组
**级别**: 推荐
**描述**: 组件按用途分为通用组件（components）、业务组件、页面组件（pages/views）和布局组件（layouts），各目录职责明确。
**正例**:
```
src/
├── components/              # 通用基础组件，无业务逻辑
│   ├── Button/
│   │   └── index.vue
│   ├── Modal/
│   │   └── index.vue
│   └── Table/
│       └── index.vue
├── layouts/                 # 布局组件
│   ├── DefaultLayout.vue
│   └── AdminLayout.vue
├── pages/                   # 页面组件，与路由对应
│   ├── user/
│   │   ├── Profile.vue
│   │   └── Settings.vue
│   └── product/
│       ├── List.vue
│       └── Detail.vue
└── components/              # 业务组件可放在 pages 同级
    └── business/
        ├── UserCard.vue
        └── ProductFilter.vue
```
**反例**:
```
src/
├── components/          # 所有组件混在一起
│   ├── Button.vue       # 基础组件
│   ├── DefaultLayout.vue # 布局组件
│   ├── LoginPage.vue    # 页面组件
│   └── UserCard.vue     # 业务组件
├── views/               # components 和 views 语义重叠
│   ├── ButtonView.vue
│   └── LoginView.vue
```

### R6: API 模块化管理
**级别**: 必须
**描述**: API 请求按业务模块拆分文件，统一使用封装后的请求工具，不直接在组件中使用 axios。
**正例**:
```
api/
├── index.ts          # 统一导出
├── request.ts        # axios 实例封装、拦截器
├── user.ts           # 用户相关接口
├── product.ts        # 商品相关接口
└── types.ts          # 接口请求/响应类型
```
```ts
// api/request.ts
import axios from 'axios'
import type { ApiResponse } from './types'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

// api/user.ts
import request from './request'
import type { ApiResponse, LoginParams, User } from './types'

export function login(params: LoginParams): Promise<ApiResponse<{ token: string }>> {
  return request.post('/auth/login', params)
}

export function getUserInfo(): Promise<ApiResponse<User>> {
  return request.get('/user/info')
}
```
**反例**:
```vue
<!-- 组件内直接调用 axios -->
<script setup lang="ts">
import axios from 'axios'

const fetchUsers = async () => {
  const res = await axios.get('http://localhost:3000/api/users') // 硬编码 URL
  return res.data
}
</script>
```

### R7: utils 按职责拆分工具函数
**级别**: 推荐
**描述**: 工具函数按职责拆分为独立文件，每个文件只包含一类工具函数，避免创建大杂烩文件。
**正例**:
```
utils/
├── date.ts          # 日期格式化、计算
├── format.ts        # 数字、字符串格式化
├── storage.ts       # localStorage/sessionStorage 封装
├── validator.ts     # 表单验证规则
├── dom.ts           # DOM 操作工具
└── index.ts         # 统一导出
```
```ts
// utils/date.ts
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  // 格式化实现
  return formatted
}

export function getTimeAgo(date: Date | string): string {
  // 相对时间计算
  return relative
}
```
**反例**:
```ts
// utils/index.ts 所有工具函数堆在一个文件
export function formatDate() { /* ... */ }
export function formatMoney() { /* ... */ }
export function setStorage() { /* ... */ }
export function validateEmail() { /* ... */ }
export function getElement() { /* ... */ }
// ... 几百行代码
```

### R8: TypeScript 类型集中管理
**级别**: 推荐
**描述**: 全局通用的类型定义集中在 `types` 目录，按业务或功能分文件。组件专属类型就近定义。
**正例**:
```
types/
├── api.d.ts         # API 通用响应类型
├── user.d.ts        # 用户相关类型
├── product.d.ts     # 商品相关类型
├── env.d.ts         # 环境变量类型
└── global.d.ts      # 全局类型扩展
```
```ts
// types/api.d.ts
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 组件专属类型就近定义
// pages/user/Profile.vue
interface Props {
  userId: number
  editable?: boolean
}
```
**反例**:
```ts
// 所有类型定义在一个巨大的 global.d.ts 中
declare interface User { /* ... */ }
declare interface Product { /* ... */ }
declare interface Order { /* ... */ }
declare interface ApiResponse { /* ... */ }
// 几百行，无组织

// 组件内重复定义
// A.vue
interface User { id: number; name: string }
// B.vue
interface User { id: number; name: string } // 重复定义
```

### R9: 静态资源统一管理
**级别**: 推荐
**描述**: 静态资源按类型存放在 `assets` 目录下的子目录中，构建工具处理的资源用 `assets`，不变的资源放 `public`。
**正例**:
```
src/assets/
├── images/
│   ├── logo.svg
│   ├── empty-state.png
│   └── icons/
│       ├── arrow.svg
│       └── check.svg
├── fonts/
│   └── custom-font.woff2
└── styles/
    ├── variables.less
    ├── mixins.less
    └── reset.css

public/
├── favicon.ico       # 不变的资源
└── robots.txt        # SEO 文件
```
```vue
<!-- 引用 assets 资源会被构建处理（hash、优化） -->
<template>
  <img :src="logoUrl" alt="Logo" />
</template>

<script setup lang="ts">
import logoUrl from '@/assets/images/logo.svg'
</script>
```
**反例**:
```
src/
├── logo.svg           # 图片散落在 src 根目录
├── components/
│   ├── Header.vue
│   └── header-bg.png  # 图片和组件混放
└── pages/
    └── home-bg.png    # 图片散落在页面目录

<!-- 使用绝对路径引用，不受构建处理 -->
<img src="/src/assets/images/logo.svg" />
```

### R10: 使用 @ 别名简化路径引用
**级别**: 必须
**描述**: 在 `vite.config.ts` 和 `tsconfig.json` 中配置 `@` 指向 `src` 目录，避免使用 `../../../` 相对路径。
**正例**:
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
```ts
// 使用 @ 别名
import { useUserStore } from '@/stores/useUserStore'
import Button from '@/components/Button/index.vue'
import { formatDate } from '@/utils/date'
import type { User } from '@/types/user'
```
**反例**:
```ts
// 使用多层相对路径
import { useUserStore } from '../../../stores/useUserStore'
import Button from '../../components/Button/index.vue'
import { formatDate } from '../../utils/date'
// 文件移动后大量路径需要修改
```

# Vue3 - Pinia 状态管理规范

## 适用范围
- 适用于所有 Vue3 项目中使用 Pinia 进行全局状态管理的场景
- 禁止在新项目中使用 Vuex
- 与组件编写规范、Composition API 规范配合使用

## 规则

### R1: 使用 Setup Store 风格定义 Store
**级别**: 推荐
**描述**: Store 定义优先使用 Setup Store（函数式）风格，与 Composition API 风格一致，更灵活且类型推导更好。
**正例**:
```ts
// stores/useUserStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<User | null>(null)
  const token = ref<string>('')

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name ?? '未登录')

  // actions
  const login = async (credentials: LoginParams): Promise<void> => {
    const res = await loginApi(credentials)
    token.value = res.data.token
    userInfo.value = res.data.user
  }

  const logout = (): void => {
    token.value = ''
    userInfo.value = null
  }

  return { userInfo, token, isLoggedIn, userName, login, logout }
})
```
**反例**:
```ts
// Options Store 风格，与 Composition API 不一致
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as User | null,
    token: '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    login(credentials: LoginParams) {
      // this 指向不够直观
    },
  },
})
```

### R2: Store 命名使用 useXxxStore 格式
**级别**: 必须
**描述**: Store 文件名和导出函数名统一为 `useXxxStore` 格式，与 composable 命名风格一致。
**正例**:
```
stores/
├── useUserStore.ts
├── useCartStore.ts
├── useAppStore.ts
└── index.ts
```
```ts
// stores/useUserStore.ts
export const useUserStore = defineStore('user', () => { /* ... */ })

// stores/useCartStore.ts
export const useCartStore = defineStore('cart', () => { /* ... */ })
```
**反例**:
```
stores/
├── user.ts           // 文件名无 use 前缀
├── cart-store.ts     // 使用 kebab-case
├── store.ts          // 笼统命名
```
```ts
// 导出名与文件名不匹配
export const userStore = defineStore('user', () => { /* ... */ })
export const useCart = defineStore('cart', () => { /* ... */ }) // 缺少 Store 后缀
```

### R3: State/Getters/Actions 职责分离
**级别**: 必须
**描述**: State 存储原始数据，Getters 派生计算值，Actions 处理业务逻辑和异步操作。不要在 getter 中修改状态，不要在 state 中存储可计算的值。
**正例**:
```ts
export const useCartStore = defineStore('cart', () => {
  // state：原始数据
  const items = ref<CartItem[]>([])
  const discount = ref(0)

  // getters：派生计算
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const finalPrice = computed(() => totalPrice.value * (1 - discount.value))
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  // actions：业务逻辑
  const addItem = (item: CartItem): void => {
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push(item)
    }
  }

  return { items, discount, totalPrice, finalPrice, itemCount, addItem }
})
```
**反例**:
```ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // 不应在 state 中存储可计算值
  const totalPrice = ref(0)

  // 手动同步计算，容易遗漏
  const addItem = (item: CartItem): void => {
    items.value.push(item)
    totalPrice.value = items.value.reduce((sum, i) => sum + i.price, 0)
  }

  return { items, totalPrice, addItem }
})
```

### R4: 异步 Action 使用 async/await
**级别**: 必须
**描述**: Store 中的异步操作使用 `async/await` 语法，配合 try/catch 处理错误，避免嵌套回调和 `.then()` 链。
**正例**:
```ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUser = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const res = await getUserById(id)
      userInfo.value = res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { userInfo, loading, error, fetchUser }
})
```
**反例**:
```ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)

  // 使用 .then 链式调用
  const fetchUser = (id: number): void => {
    getUserById(id).then((res) => {
      userInfo.value = res.data
    }).catch((err) => {
      console.log(err) // 仅打印，未正确处理错误
    })
  }

  return { userInfo, fetchUser }
})
```

### R5: Store 之间可组合复用
**级别**: 推荐
**描述**: 一个 Store 可以在另一个 Store 中使用，实现跨 Store 逻辑复用，避免重复代码。
**正例**:
```ts
// stores/useCartStore.ts
import { useUserStore } from './useUserStore'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const userStore = useUserStore()

  const checkout = async (): Promise<OrderResult> => {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    const res = await createOrder({
      userId: userStore.userInfo!.id,
      items: items.value,
    })
    items.value = []
    return res.data
  }

  return { items, checkout }
})
```
**反例**:
```ts
// 在 Store 中绕回组件层获取数据
export const useCartStore = defineStore('cart', () => {
  const checkout = async (): Promise<void> => {
    // 直接调用 localStorage，绕过 UserStore
    const userId = localStorage.getItem('userId')
    if (!userId) throw new Error('请先登录')
    await createOrder({ userId: Number(userId), items: items.value })
  }
  return { checkout }
})
```

### R6: 使用 storeToRefs 解构 Store
**级别**: 必须
**描述**: 在组件中解构 Store 的 state 和 getters 时，使用 `storeToRefs` 保持响应性。Actions 可以直接解构。
**正例**:
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// state 和 getters 用 storeToRefs 保持响应性
const { userInfo, isLoggedIn, userName } = storeToRefs(userStore)

// actions 直接解构即可
const { login, logout } = userStore
</script>

<template>
  <div v-if="isLoggedIn">{{ userName }}</div>
</template>
```
**反例**:
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

// 直接解构 state，丢失响应性
const { userInfo, isLoggedIn } = userStore
// userInfo 和 isLoggedIn 不再是响应式的
</script>
```

### R7: 不在组件外部直接使用 Store
**级别**: 必须
**描述**: Store 实例依赖 Vue 的响应式系统，在组件 setup 或插件安装完成之前不应调用 `useXxxStore()`。在路由守卫、axios 拦截器等场景中应延迟获取。
**正例**:
```ts
// router/index.ts
import { useUserStore } from '@/stores/useUserStore'

router.beforeEach((to) => {
  // 在路由守卫回调内获取 store，此时 Pinia 已安装
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  }
})
```
**反例**:
```ts
// router/index.ts
import { useUserStore } from '@/stores/useUserStore'

// 在模块顶层直接调用，此时 Pinia 可能尚未安装
const userStore = useUserStore() // 报错：getActivePinia was called with no active Pinia

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  }
})
```

### R8: 按功能模块拆分 Store
**级别**: 推荐
**描述**: 按业务功能拆分 Store，每个 Store 职责单一。避免创建一个巨大的全局 Store。
**正例**:
```
stores/
├── useUserStore.ts       # 用户信息、登录状态
├── useCartStore.ts       # 购物车
├── useAppStore.ts        # 全局应用状态（主题、语言、侧边栏）
├── usePermissionStore.ts # 权限、菜单
└── index.ts              # 统一导出
```
**反例**:
```
stores/
├── useStore.ts           # 一个巨大 Store 包含所有状态
└── index.ts
```
```ts
// 所有状态堆在一个 Store 中
export const useStore = defineStore('app', () => {
  const user = ref(null)
  const cart = ref([])
  const theme = ref('dark')
  const menu = ref([])
  const permissions = ref([])
  const notifications = ref([])
  // ... 几百行代码
  return { user, cart, theme, menu, permissions, notifications }
})
```

### R10: 使用 $reset 重置 Store 状态
**级别**: 推荐
**描述**: 需要重置 Store 到初始状态时使用 `$reset()` 方法。Setup Store 需要自行实现重置逻辑。
**正例**:
```ts
// Setup Store 实现重置
export const useFilterStore = defineStore('filter', () => {
  const keyword = ref('')
  const category = ref('')
  const sortBy = ref('date')
  const page = ref(1)

  const initialState = {
    keyword: '',
    category: '',
    sortBy: 'date',
    page: 1,
  }

  const $reset = (): void => {
    keyword.value = initialState.keyword
    category.value = initialState.category
    sortBy.value = initialState.sortBy
    page.value = initialState.page
  }

  return { keyword, category, sortBy, page, $reset }
})

// 组件中使用
const filterStore = useFilterStore()
filterStore.$reset()
```
**反例**:
```ts
// 手动逐个重置，容易遗漏新增字段
const resetFilters = (): void => {
  filterStore.keyword = ''
  filterStore.category = ''
  // 忘记重置 sortBy
  filterStore.page = 1
}
```

# Vue3 - TypeScript 使用规范

## 适用范围
- 适用于所有 Vue3 + TypeScript 项目的类型定义与使用
- 与组件编写规范、Composition API 规范配合使用
- 与独立 TypeScript 编码规范互为补充

## 规则

### R1: interface 优先于 type
**级别**: 推荐
**描述**: 定义对象结构时优先使用 `interface`，便于声明合并和扩展；需要联合类型、交叉类型、映射类型时使用 `type`。
**正例**:
```ts
// 对象结构用 interface，支持 extends 扩展
interface User {
  id: number
  name: string
  email: string
}

interface AdminUser extends User {
  role: 'admin'
  permissions: string[]
}

// 联合类型、工具类型用 type
type Status = 'active' | 'inactive' | 'banned'
type Nullable<T> = T | null
```
**反例**:
```ts
// 简单对象结构也用 type，不利于扩展
type User = {
  id: number
  name: string
  email: string
}

// 用 interface 表示联合类型（不合法）
interface Status extends 'active' | 'inactive' {}
```

### R2: 使用 ApiResponse<T> 泛型封装接口响应
**级别**: 必须
**描述**: 统一定义接口响应类型，使用泛型参数 `T` 承载业务数据类型，保持接口类型一致性。
**正例**:
```ts
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 使用时明确 data 的类型
type UserListResponse = ApiResponse<PageResult<User>>
type LoginResponse = ApiResponse<{ token: string; expiresIn: number }>
```
**反例**:
```ts
// 每个接口单独定义响应结构
interface UserListResponse {
  code: number
  message: string
  data: {
    list: User[]
    total: number
  }
}

interface LoginResponse {
  code: number
  msg: string  // 字段名不一致 message vs msg
  result: { token: string }  // 字段名不一致 data vs result
}
```

### R3: defineProps 使用泛型语法
**级别**: 必须
**描述**: 组件 props 定义使用 `defineProps<T>()` 泛型语法，获得完整的 TypeScript 类型推导。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'active',
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
// 使用运行时声明，丢失类型推导
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array as PropType<string[]>, default: () => [] },
})
</script>
```

### R4: defineEmits 使用泛型签名
**级别**: 必须
**描述**: 事件声明使用 `defineEmits<T>()` 泛型签名，确保 emit 调用时参数类型安全。
**正例**:
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: { username: string; password: string }): void
  (e: 'cancel'): void
}>()

// 调用时参数类型被校验
emit('submit', { username: 'admin', password: '123456' })
</script>
```
**反例**:
```vue
<script setup lang="ts">
// 运行时声明，无类型约束
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// 调用时参数不受校验，可以传任意值
emit('submit', 'wrong argument type')
emit('submit')
</script>
```

### R5: 泛型参数命名遵循 T/K/V 约定
**级别**: 推荐
**描述**: 泛型参数使用大写字母约定：`T` 表示通用类型，`K` 表示键类型，`V` 表示值类型，`E` 表示元素类型，多参数用描述性名称。
**正例**:
```ts
// 标准约定
function identity<T>(value: T): T {
  return value
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 多个泛型参数时使用描述性名称
interface Repository<TEntity, TCreateDto, TUpdateDto> {
  findById(id: number): Promise<TEntity>
  create(dto: TCreateDto): Promise<TEntity>
  update(id: number, dto: TUpdateDto): Promise<TEntity>
}
```
**反例**:
```ts
// 泛型命名不清晰
function identity<MYTYPE>(value: MYTYPE): MYTYPE {
  return value
}

// 单字母不够语义时仍用单字母
interface Store<A, B, C> { // A、B、C 含义不明
  getData(): A
  saveData(data: B): C
}
```

### R6: 优先使用 as const 而非 enum
**级别**: 推荐
**描述**: 对于常量集合，优先使用 `as const` 断言获得类型安全的字面量联合类型，减少编译产物体积。
**正例**:
```ts
// as const 方式：零运行时开销
const ROLE = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const

type Role = typeof ROLE[keyof typeof ROLE]
// Role 类型为 'admin' | 'editor' | 'viewer'

const STATUS = ['active', 'inactive', 'pending'] as const
type Status = typeof STATUS[number]
// Status 类型为 'active' | 'inactive' | 'pending'
```
**反例**:
```ts
// 使用 enum 会生成额外的运行时代码
enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// 数字枚举更糟糕，会产生双向映射
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
// 编译产物中会生成 Direction[0] = "Up" 的反向映射
```

### R7: 使用类型守卫进行类型收窄
**级别**: 推荐
**描述**: 使用类型守卫（type guard）函数或 `typeof`/`instanceof`/`in` 运算符收窄类型，避免不安全的类型断言。
**正例**:
```ts
// 自定义类型守卫
interface Dog { bark(): void; type: 'dog' }
interface Cat { meow(): void; type: 'cat' }
type Pet = Dog | Cat

function isDog(pet: Pet): pet is Dog {
  return pet.type === 'dog'
}

function handlePet(pet: Pet): void {
  if (isDog(pet)) {
    pet.bark()  // TypeScript 知道 pet 是 Dog
  } else {
    pet.meow()  // TypeScript 知道 pet 是 Cat
  }
}

// 使用 in 运算符
function process(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()) // 收窄为 string
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2))    // 收窄为 number
  }
}
```
**反例**:
```ts
// 不安全的类型断言，绕过类型检查
function handlePet(pet: Pet): void {
  const dog = pet as Dog // 强制断言，运行时可能出错
  dog.bark()
}

function process(value: unknown): void {
  // 不做类型判断直接断言
  ;(value as string).toUpperCase()
}
```

### R8: 启用 TypeScript strict 模式
**级别**: 必须
**描述**: `tsconfig.json` 中必须启用 `strict: true`，确保最大程度的类型安全。
**正例**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```
**反例**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### R9: 使用 import type 导入类型
**级别**: 推荐
**描述**: 纯类型导入使用 `import type` 语法，明确标识类型依赖，确保编译时被完全擦除。
**正例**:
```ts
// 纯类型导入
import type { User, UserRole } from '@/types/user'
import type { ApiResponse, PageResult } from '@/types/api'

// 混合导入时分开写
import { ref, computed, type ComputedRef } from 'vue'
import { fetchUsers, type UserListParams } from '@/api/user'
```
**反例**:
```ts
// 类型导入和值导入混在一起
import { User, UserRole } from '@/types/user' // User 是纯类型但没标注

// 全部放在一个 import，难以区分哪些是类型
import { ref, computed, ComputedRef } from 'vue' // ComputedRef 是类型
```

### R10: 禁止使用 any，用 unknown 替代
**级别**: 必须
**描述**: 禁止使用 `any` 类型，它会完全关闭类型检查。类型不确定时使用 `unknown`，迫使使用者做类型收窄。
**正例**:
```ts
// 使用 unknown，强制类型检查
function parseJSON(str: string): unknown {
  return JSON.parse(str)
}

// 使用时必须先做类型判断
const data: unknown = parseJSON('{"name":"Alice"}')
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as { name: string }).name)
}

// 第三方库无法避免时使用 // eslint-disable 注释并加注释说明
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyResult: any = someLegacyLibrary.getData()
```
**反例**:
```ts
// 使用 any 完全绕过类型检查
function parseJSON(str: string): any {
  return JSON.parse(str)
}

const data: any = parseJSON('{"name":"Alice"}')
data.nonExistentMethod() // 编译不报错，运行时崩溃

// 随意标注 any
const userList: any[] = await fetchUsers()
function handleClick(event: any): void {
  // ...
}
```

