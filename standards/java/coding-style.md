# Java - 编码风格规范

## 适用范围
- 适用于所有 Java 项目的编码风格约束
- 参考 Alibaba Java Coding Guidelines
- 与代码注释规范、最佳实践规范配合使用

## 规则

### R1: 类名使用 UpperCamelCase
**级别**: 必须
**描述**: 类名使用 UpperCamelCase 风格，应为名词或名词短语。
**正例**:
```java
public class UserService {}
public class OrderController {}
public class MarcoPolo {}
```
**反例**:
```java
public class userService {}
public class ordercontroller {}
public class user_Service {}
```

### R2: 方法名使用 lowerCamelCase
**级别**: 必须
**描述**: 方法名使用 lowerCamelCase 风格，应为动词或动词短语。
**正例**:
```java
public void sendMessage() {}
public String getUserName() {}
public boolean isValid() {}
```
**反例**:
```java
public void SendMessage() {}
public String GetUserName() {}
public boolean is_valid() {}
```

### R3: 常量名全大写下划线分隔
**级别**: 必须
**描述**: 常量名全部大写，单词间用下划线分隔，力求语义完整。
**正例**:
```java
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";
```
**反例**:
```java
public static final int maxRetryCount = 3;
public static final String DefaultCharset = "UTF-8";
```

### R4: 包名全小写使用点分隔
**级别**: 必须
**描述**: 包名统一使用小写，点分隔符之间有且仅有一个自然语义的英语单词。
**正例**:
```java
package com.example.project.user.service;
package org.apache.commons.lang3;
```
**反例**:
```java
package com.example.Project.User.Service;
package com.example.project.userservice;
```

### R5: 抽象类以 Abstract/Base 开头
**级别**: 必须
**描述**: 抽象类命名使用 Abstract 或 Base 开头。
**正例**:
```java
public abstract class AbstractPaymentHandler {}
public abstract class BaseController {}
```
**反例**:
```java
public abstract class PaymentHandler {}
public abstract class ControllerBase {}
```

### R6: 异常类以 Exception 结尾
**级别**: 必须
**描述**: 异常类命名使用 Exception 结尾，准确描述异常场景。
**正例**:
```java
public class BusinessException extends RuntimeException {}
public class InsufficientBalanceException extends RuntimeException {}
```
**反例**:
```java
public class BusinessError extends RuntimeException {}
public class InsufficientBalance extends RuntimeException {}
```

### R7: 测试类以被测类名+Test 结尾
**级别**: 必须
**描述**: 测试类命名以被测试类的类名开头，Test 结尾。
**正例**:
```java
public class UserServiceTest {}
public class OrderControllerTest {}
```
**反例**:
```java
public class TestUserService {}
public class UserServiceTests {}
```

### R8: boolean 变量不加 is 前缀
**级别**: 必须
**描述**: POJO 类中布尔变量不加 is 前缀，避免序列化框架解析歧义。
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
    private Boolean isDeleted;
    private Boolean isFinished;
}
```

### R9: POJO 类使用包装类型
**级别**: 必须
**描述**: POJO 类使用 Long/Integer 等包装类型，不使用基本类型，以区分默认值和未赋值。
**正例**:
```java
public class UserDTO {
    private Long id;
    private Integer age;
    private Boolean active;
}
```
**反例**:
```java
public class UserDTO {
    private long id;
    private int age;
    private boolean active;
}
```

### R10: 方法参数不超过 5 个
**级别**: 必须
**描述**: 方法参数不超过 5 个，超过时使用对象封装。
**正例**:
```java
public void createUser(UserCreateRequest request) {}
```
**反例**:
```java
public void createUser(String name, Integer age, String email,
                       String phone, String address, String role) {}
```

### R11: 单个方法行数不超过 80 行
**级别**: 必须
**描述**: 单个方法体行数不超过 80 行，超出应拆分为多个方法。
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

### R12: if/else/for/while/do 后必须使用大括号
**级别**: 必须
**描述**: 即使只有一行代码，也必须使用大括号。
**正例**:
```java
if (user != null) {
    return user.getName();
}
```
**反例**:
```java
if (user != null)
    return user.getName();
```

### R13: 缩进使用 4 个空格
**级别**: 必须
**描述**: 统一使用 4 个空格缩进，不使用 Tab。
**正例**:
```java
public void example() {
    if (condition) {
        doSomething();
    }
}
```
**反例**:
```java
public void example() {
  if (condition) {
	  doSomething();
  }
}
```

### R14: 单行字符数不超过 120
**级别**: 必须
**描述**: 单行字符数不超过 120 个，超出需换行并合理缩进。
**正例**:
```java
String query = "SELECT id, name, email FROM user "
    + "WHERE status = 'ACTIVE' AND role = 'ADMIN'";
```
**反例**:
```java
String query = "SELECT id, name, email FROM user WHERE status = 'ACTIVE' AND role = 'ADMIN' AND create_time > '2024-01-01' ORDER BY id DESC";
```

### R15: 使用空行分隔逻辑块
**级别**: 必须
**描述**: 方法体内使用空行分隔不同逻辑步骤，提高可读性。
**正例**:
```java
public void process() {
    validateInput();

    Data data = fetchData();

    transformData(data);

    saveResult(data);
}
```
**反例**:
```java
public void process() {
    validateInput();
    Data data = fetchData();
    transformData(data);
    saveResult(data);
}
```