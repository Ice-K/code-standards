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