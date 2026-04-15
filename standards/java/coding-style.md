---
id: java-coding-style
title: Java - 编码风格规范
tags: [java, coding-style, naming, formatting]
trigger:
  extensions: [.java]
  frameworks: []
skip:
  keywords: []
---

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