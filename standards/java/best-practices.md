# Java - 最佳实践

## 适用范围
- 适用于所有 Java/Spring Boot 项目的编码实践
- 与编码风格规范、设计模式规范配合使用
- 聚焦日常开发中高频出现的问题

## 规则

### R1: 不捕获 Exception 基类
**级别**: 必须
**描述**: catch 块必须捕获具体异常类型，不捕获 Exception 基类。
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

### R2: 使用 try-with-resources 管理 IO 资源
**级别**: 必须
**描述**: 实现 AutoCloseable 的资源必须使用 try-with-resources。
**正例**:
```java
try (InputStream is = new FileInputStream("data.txt");
     BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
    return reader.lines().collect(Collectors.toList());
}
```
**反例**:
```java
InputStream is = null;
try {
    is = new FileInputStream("data.txt");
    // ...
} finally {
    if (is != null) { is.close(); }
}
```

### R3: 集合判空使用工具方法
**级别**: 必须
**描述**: 使用 CollectionUtils.isEmpty() 或 list.isEmpty() 判空，不使用 null 判断。
**正例**:
```java
if (CollectionUtils.isEmpty(userList)) {
    return Collections.emptyList();
}
```
**反例**:
```java
if (userList == null || userList.size() == 0) {
    return new ArrayList<>();
}
```

### R4: 字符串拼接使用 StringBuilder 或 String.format
**级别**: 推荐
**描述**: 循环中字符串拼接使用 StringBuilder，格式化使用 String.format。
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

### R5: 线程池使用 ThreadPoolExecutor
**级别**: 必须
**描述**: 禁止使用 Executors 创建线程池，必须使用 ThreadPoolExecutor 明确参数。
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

### R6: 日期使用 LocalDateTime
**级别**: 必须
**描述**: 使用 java.time 包（LocalDateTime/LocalDate），不使用 java.util.Date。
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

### R7: 金额使用 BigDecimal
**级别**: 必须
**描述**: 金额计算使用 BigDecimal，禁止使用 float 或 double。
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

### R8: 集合转数组使用正确方式
**级别**: 推荐
**描述**: 集合转数组使用 list.toArray(new String[0])。
**正例**:
```java
List<String> names = Arrays.asList("Alice", "Bob");
String[] array = names.toArray(new String[0]);
```
**反例**:
```java
List<String> names = Arrays.asList("Alice", "Bob");
String[] array = names.toArray(new String[names.size()]);
```

### R9: Map 使用 computeIfAbsent
**级别**: 推荐
**描述**: 使用 computeIfAbsent 替代 containsKey + put 组合。
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

### R10: 使用 Optional 替代 null 返回值
**级别**: 推荐
**描述**: 方法返回值可能为空时使用 Optional 包装。
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

### R11: 避免在循环中创建大量对象
**级别**: 必须
**描述**: 循环内避免重复创建可复用对象，将创建移到循环外。
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

### R12: 使用枚举替代魔法值
**级别**: 必须
**描述**: 魔法数字和字符串常量必须定义为枚举。
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

### R13: 序列化使用 JSON 而非 Java 序列化
**级别**: 必须
**描述**: 对象序列化使用 Jackson/Gson 等 JSON 方式，不使用 Java 原生序列化。
**正例**:
```java
ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(user);
User copy = mapper.readValue(json, User.class);
```
**反例**:
```java
ByteArrayOutputStream bos = new ByteArrayOutputStream();
ObjectOutputStream oos = new ObjectOutputStream(bos);
oos.writeObject(user);
```

### R14: 日志使用 SLF4J 门面
**级别**: 必须
**描述**: 日志调用使用 SLF4J（@Slf4j），不直接依赖 Log4j/Logback。
**正例**:
```java
@Slf4j
@Service
public class UserService {
    public void create(UserDTO dto) {
        log.info("创建用户: username={}", dto.getUsername());
    }
}
```
**反例**:
```java
import org.apache.log4j.Logger;
public class UserService {
    private Logger logger = Logger.getLogger(UserService.class);
}
```

### R15: 避免使用 System.out.println
**级别**: 必须
**描述**: 禁止使用 System.out/err 做日志输出，必须使用日志框架。
**正例**:
```java
log.info("处理完成, count={}", count);
log.error("处理失败, orderId={}", orderId, e);
```
**反例**:
```java
System.out.println("处理完成, count=" + count);
e.printStackTrace();
```