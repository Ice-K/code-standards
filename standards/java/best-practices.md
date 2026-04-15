---
id: java-best-practices
title: Java - 最佳实践
tags: [java, best-practices, concurrency, exception]
trigger:
  extensions: [.java]
  frameworks: []
skip:
  keywords: []
---

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