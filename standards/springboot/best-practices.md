---
id: springboot-best-practices
title: Spring Boot - 最佳实践（核心）
tags: [springboot, best-practices, di, validation, logging]
trigger:
  extensions: [.java]
  frameworks: [springboot]
skip:
  keywords: [组件, 页面, UI, CSS, 样式]
---

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