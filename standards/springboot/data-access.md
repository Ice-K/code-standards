# Spring Boot - 数据访问层规范

## 适用范围
- 适用于 Spring Boot 项目中使用 MyBatis / MyBatis-Plus 进行数据访问的模块
- 与项目目录结构约定、RESTful API 设计规范配合使用
- 基于 MyBatis-Plus 3.x 版本

## 规则

### R1: Entity 与 DTO/VO 分离
**级别**: 必须
**描述**: 数据库实体（Entity）与数据传输对象（DTO）、视图对象（VO）严格分离，不得将数据库实体直接暴露到 Controller 层或返回给前端。
**正例**:
```java
// Entity - 对应数据库表
@Data
@TableName("sys_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String email;
    private Integer status;
    @TableLogic
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

// DTO - 接收前端请求
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
    @Email(message = "邮箱格式不正确")
    private String email;
}

// VO - 返回给前端
@Data
public class UserVO {
    private Long id;
    private String username;
    private String email;
    private String statusName;
    private LocalDateTime createTime;
}

// Service 层做转换
@Override
public UserVO getById(Long id) {
    User user = userMapper.selectById(id);
    UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
    vo.setStatusName(StatusEnum.getDesc(user.getStatus()));
    return vo;
}
```
**反例**:
```java
// 直接将 Entity 返回给前端
@GetMapping("/{id}")
public Result<User> getById(@PathVariable Long id) {
    User user = userMapper.selectById(id);
    return Result.success(user);  // 暴露了 password 字段
}

// 使用 Map 代替 VO
@GetMapping("/{id}")
public Result<Map<String, Object>> getById(@PathVariable Long id) {
    User user = userMapper.selectById(id);
    Map<String, Object> map = new HashMap<>();
    map.put("id", user.getId());
    map.put("username", user.getUsername());
    map.put("password", user.getPassword());  // 敏感字段泄露
    return Result.success(map);
}
```

### R2: MyBatis-Plus 使用规范
**级别**: 必须
**描述**: Mapper 接口继承 BaseMapper<T>，ServiceImpl 继承 ServiceImpl<M, T> 并实现对应的 Service 接口。
**正例**:
```java
// Mapper 接口
@Mapper
public interface UserMapper extends BaseMapper<User> {

    // 自定义复杂查询
    List<UserVO> selectUserList(@Param("query") UserQueryDTO query);
}

// Service 接口
public interface IUserService extends IService<User> {
    UserVO getById(Long id);
    Long create(UserCreateDTO dto);
    PageResult<UserVO> page(UserQueryDTO query);
}

// Service 实现类
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    @Override
    public UserVO getById(Long id) {
        User user = baseMapper.selectById(id);
        return BeanUtil.copyProperties(user, UserVO.class);
    }

    @Override
    public Long create(UserCreateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        baseMapper.insert(user);
        return user.getId();
    }
}
```
**反例**:
```java
// Mapper 不继承 BaseMapper，自己写基础方法
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM sys_user WHERE id = #{id}")
    User selectById(Long id);

    @Insert("INSERT INTO sys_user(username, password) VALUES(#{username}, #{password})")
    int insert(User user);

    @Update("UPDATE sys_user SET username = #{username} WHERE id = #{id}")
    int update(User user);
}

// Service 不继承 ServiceImpl，手动注入 Mapper
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public User getById(Long id) {
        return userMapper.selectById(id);
    }
}
```

### R3: 通用查询使用 QueryWrapper/LambdaQueryWrapper
**级别**: 推荐
**描述**: 简单查询条件使用 MyBatis-Plus 的 QueryWrapper 或 LambdaQueryWrapper 构建，优先使用 Lambda 形式避免字段名硬编码。
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

### R4: 复杂查询使用 XML 映射而非注解 SQL
**级别**: 推荐
**描述**: 超过 3 个表关联或包含动态条件、子查询等复杂 SQL 应使用 XML 映射文件，不使用 @Select 等注解。
**正例**:
```xml
<!-- resources/mapper/OrderMapper.xml -->
<mapper namespace="com.example.project.dao.OrderMapper">

    <select id="selectOrderDetailList" resultType="com.example.project.model.vo.OrderDetailVO">
        SELECT
            o.id, o.order_no, o.status, o.total_amount,
            u.username AS buyer_name,
            d.name AS delivery_name, d.phone AS delivery_phone,
            od.product_name, od.quantity, od.unit_price
        FROM t_order o
        LEFT JOIN sys_user u ON o.user_id = u.id
        LEFT JOIN t_delivery d ON o.delivery_id = d.id
        LEFT JOIN t_order_item od ON o.id = od.order_id
        <where>
            o.deleted = 0
            <if test="query.orderNo != null and query.orderNo != ''">
                AND o.order_no LIKE CONCAT('%', #{query.orderNo}, '%')
            </if>
            <if test="query.status != null">
                AND o.status = #{query.status}
            </if>
            <if test="query.startTime != null">
                AND o.create_time &gt;= #{query.startTime}
            </if>
            <if test="query.endTime != null">
                AND o.create_time &lt;= #{query.endTime}
            </if>
        </where>
        ORDER BY o.create_time DESC
    </select>
</mapper>
```
**反例**:
```java
// 复杂查询使用注解，难以维护
@Select("SELECT o.id, o.order_no, o.status, u.username AS buyer_name " +
        "FROM t_order o LEFT JOIN sys_user u ON o.user_id = u.id " +
        "WHERE o.deleted = 0 " +
        "<if test='orderNo != null'> AND o.order_no LIKE CONCAT('%', #{orderNo}, '%') </if>" +
        "ORDER BY o.create_time DESC")
List<OrderDetailVO> selectOrderList(@Param("orderNo") String orderNo);

// 在 Java 代码中拼接 SQL 字符串
public List<Order> queryOrders(String orderNo, Integer status) {
    String sql = "SELECT * FROM t_order WHERE deleted = 0";
    if (orderNo != null) {
        sql += " AND order_no LIKE '%" + orderNo + "%'";  // SQL 注入风险
    }
    // ...
}
```

### R5: @Transactional 只标注在 Service 层方法上
**级别**: 必须
**描述**: 事务注解 @Transactional 只能标注在 Service 层方法上，不在 Controller 或 Mapper 层使用事务。
**正例**:
```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final StockMapper stockMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        // 创建订单
        Order order = BeanUtil.copyProperties(dto, Order.class);
        order.setOrderNo(generateOrderNo());
        orderMapper.insert(order);

        // 创建订单明细
        List<OrderItem> items = dto.getItems().stream()
                .map(item -> {
                    OrderItem oi = new OrderItem();
                    oi.setOrderId(order.getId());
                    oi.setProductId(item.getProductId());
                    oi.setQuantity(item.getQuantity());
                    return oi;
                }).collect(Collectors.toList());
        orderItemMapper.insertBatchSomeColumn(items);

        // 扣减库存
        dto.getItems().forEach(item ->
            stockMapper.deduct(item.getProductId(), item.getQuantity())
        );

        return order.getId();
    }
}
```
**反例**:
```java
// 在 Controller 上加事务
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping
    @Transactional   // 错误：事务不应在 Controller 层
    public Result<Long> create(@RequestBody OrderCreateDTO dto) {
        return Result.success(orderService.createOrder(dto));
    }
}

// 在 Service 类上使用 @Transactional（粒度太粗）
@Service
@Transactional(rollbackFor = Exception.class)  // 所有方法都在事务中
public class UserServiceImpl implements IUserService {

    public UserVO getById(Long id) {
        // 纯查询不需要事务
    }

    public void create(UserCreateDTO dto) {
        // 写操作需要事务
    }
}

// 没有指定 rollbackFor
@Transactional  // 默认只回滚 RuntimeException，不回滚 Exception
public void createOrder(OrderCreateDTO dto) { ... }
```

### R6: 批量操作使用 saveBatch/updateBatchById
**级别**: 推荐
**描述**: 批量插入和更新使用 MyBatis-Plus 提供的 saveBatch / updateBatchById 等批量方法，避免循环单条操作。
**正例**:
```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements IProductService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importProducts(List<ProductImportDTO> dtoList) {
        List<Product> products = dtoList.stream()
                .map(dto -> {
                    Product product = new Product();
                    product.setName(dto.getName());
                    product.setPrice(dto.getPrice());
                    product.setStock(dto.getStock());
                    return product;
                }).collect(Collectors.toList());

        // 使用批量插入，默认每批 1000 条
        saveBatch(products, 500);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUpdatePrice(List<ProductPriceDTO> dtoList) {
        List<Product> products = dtoList.stream()
                .map(dto -> {
                    Product product = new Product();
                    product.setId(dto.getId());
                    product.setPrice(dto.getPrice());
                    return product;
                }).collect(Collectors.toList());

        updateBatchById(products, 500);
    }
}
```
**反例**:
```java
@Service
public class ProductServiceImpl implements IProductService {

    @Autowired
    private ProductMapper productMapper;

    public void importProducts(List<ProductImportDTO> dtoList) {
        // 循环单条插入，性能差
        for (ProductImportDTO dto : dtoList) {
            Product product = new Product();
            product.setName(dto.getName());
            product.setPrice(dto.getPrice());
            productMapper.insert(product);  // 每条一个 SQL
        }
    }
}
```

### R7: 逻辑删除使用 @TableLogic
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
@Data
@TableName("sys_user")
public class User {
    private Long id;
    private String username;
    private Integer deleted;  // 没有 @TableLogic 注解
}

// Mapper 中手动处理
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

### R8: 自动填充字段使用 @TableField(fill = FieldFill)
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
// 手动设置时间字段
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

### R9: 分页查询使用 Page 对象
**级别**: 推荐
**描述**: 使用 MyBatis-Plus 的 Page 对象进行分页查询，配合自定义的 PageResult 封装返回结果。
**正例**:
```java
// Service 实现
@Override
public PageResult<UserVO> page(UserQueryDTO query) {
    Page<User> page = new Page<>(query.getPageNum(), query.getPageSize());

    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(query.getKeyword()), User::getUsername, query.getKeyword())
           .eq(query.getStatus() != null, User::getStatus, query.getStatus())
           .orderByDesc(User::getCreateTime);

    Page<User> result = userMapper.selectPage(page, wrapper);

    List<UserVO> voList = result.getRecords().stream()
            .map(user -> BeanUtil.copyProperties(user, UserVO.class))
            .collect(Collectors.toList());

    return PageResult.of(voList, result.getTotal(), query.getPageNum(), query.getPageSize());
}

// 分页拦截器配置（必须配置否则分页不生效）
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```
**反例**:
```java
// 手动实现分页
public Map<String, Object> page(int pageNum, int pageSize, String keyword) {
    // 手动计算 offset
    int offset = (pageNum - 1) * pageSize;

    // 手动拼接分页 SQL
    List<User> list = userMapper.selectList(keyword, offset, pageSize);
    int total = userMapper.selectCount(keyword);

    Map<String, Object> result = new HashMap<>();
    result.put("list", list);
    result.put("total", total);
    return result;
}

// 使用 PageHelper（非 MyBatis-Plus 原生方式）
public PageInfo<User> page(int pageNum, int pageSize) {
    PageHelper.startPage(pageNum, pageSize);
    List<User> list = userMapper.selectAll();
    return new PageInfo<>(list);
}
```

### R10: 枚举字段使用 @EnumValue 注解
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
```yaml
# 全局配置枚举处理
mybatis-plus:
  configuration:
    default-enum-type-handler: org.apache.ibatis.type.EnumOrdinalTypeHandler
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
user.setStatus(2);                  // 2 是什么状态？

// 使用 ordinal() 存储，增加枚举值后数据错乱
public enum UserStatus {
    DISABLED,   // ordinal = 0
    ENABLED,    // ordinal = 1
    LOCKED      // ordinal = 2
    // 如果在中间插入一个值，所有 ordinal 都会变化
}
```

### R11: 不在 Controller 层直接调用 Mapper
**级别**: 必须
**描述**: Controller 层只能调用 Service 层，禁止直接注入和调用 Mapper 层，保持分层架构的清晰性。
**正例**:
```java
// Controller 调用 Service
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @GetMapping
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
        return Result.success(userService.page(query));
    }
}

// Service 调用 Mapper
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        return BeanUtil.copyProperties(user, UserVO.class);
    }
}
```
**反例**:
```java
// Controller 直接注入 Mapper
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserMapper userMapper;      // 错误：直接注入 Mapper

    @Autowired
    private RoleMapper roleMapper;      // 错误：Controller 中调用多个 Mapper

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        // Controller 中包含业务逻辑
        if (user.getRoleId() != null) {
            Role role = roleMapper.selectById(user.getRoleId());
            user.setRoleName(role.getName());
        }
        return Result.success(user);    // 直接返回 Entity
    }
}
```