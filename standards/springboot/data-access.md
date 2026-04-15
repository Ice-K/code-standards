---
id: springboot-data-access
title: Spring Boot - 数据访问层规范
tags: [springboot, data-access, mybatis, mapper, database]
trigger:
  extensions: [.java, .xml]
  frameworks: [springboot]
skip:
  keywords: [组件, 页面, UI, CSS, 样式, 配置文件, yml, properties]
---

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

### R4: 枚举字段使用 @EnumValue 注解
**级别**: 建议
**描述**: 数据库中存储枚举类型的字段，使用 @EnumValue 标注需要持久化的枚举值，避免使用序号（ordinal）存储。
**正例**:
```java
// 枚举定义
@Getter
@AllArgsConstructor
public enum UserStatus {
    DISABLED(0, "禁用"),
    ENABLED(1, "启用"),
    LOCKED(2, "锁定");

    @EnumValue              // 标注存入数据库的值
    private final int code;
    private final String desc;
}

// Entity 使用枚举类型
@Data
@TableName("sys_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private UserStatus status;   // 枚举类型
}
```
**反例**:
```java
// 使用整数类型，没有类型安全
@Data
@TableName("sys_user")
public class User {
    private Long id;
    private String username;
    private Integer status;  // 0-禁用 1-启用 2-锁定，含义不明确
}

// 代码中到处使用魔法值
if (user.getStatus() == 1) {       // 1 是什么状态？
    // ...
}

// 使用 ordinal() 存储，增加枚举值后数据错乱
public enum UserStatus {
    DISABLED,   // ordinal = 0
    ENABLED,    // ordinal = 1
    LOCKED      // ordinal = 2
    // 如果在中间插入一个值，所有 ordinal 都会变化
}
```