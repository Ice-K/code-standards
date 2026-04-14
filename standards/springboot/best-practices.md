# Spring Boot - 最佳实践

## 适用范围
- 适用于所有 Spring Boot 项目的开发最佳实践
- 与项目目录结构约定、API 设计规范、配置管理规范、数据访问层规范配合使用
- 涵盖依赖注入、异步处理、缓存、日志、异常处理、幂等性等方面

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
    private final UploadConfig uploadConfig;

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

    @Autowired
    private UploadConfig uploadConfig;

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

    @GetMapping("/{id}")
    public Result<OrderVO> getById(@PathVariable Long id) {
        return Result.success(orderService.getOrderDetail(id));
    }
}

// Service - 处理所有业务逻辑
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final StockService stockService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        // 校验商品和库存
        validateProducts(dto.getItems());
        // 计算订单金额
        BigDecimal totalAmount = calculateTotalAmount(dto.getItems());
        // 创建订单
        Order order = buildOrder(dto, totalAmount);
        orderMapper.insert(order);
        // 扣减库存
        stockService.deduct(dto.getItems());
        // 发布订单创建事件
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

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private StockMapper stockMapper;

    @PostMapping
    public Result<Long> create(@RequestBody OrderCreateDTO dto) {
        // Controller 中包含大量业务逻辑
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemDTO item : dto.getItems()) {
            Product product = productMapper.selectById(item.getProductId());
            if (product == null) {
                return Result.fail(400, "商品不存在");
            }
            if (product.getStock() < item.getQuantity()) {
                return Result.fail(400, "库存不足");
            }
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            stockMapper.deduct(item.getProductId(), item.getQuantity());
        }

        Order order = new Order();
        order.setUserId(getCurrentUserId());
        order.setTotalAmount(total);
        order.setStatus(1);
        orderMapper.insert(order);

        return Result.success(order.getId());
    }
}
```

### R3: 使用 Spring 事件 ApplicationEvent 解耦模块
**级别**: 建议
**描述**: 使用 Spring 事件机制解耦模块间的交互，如订单创建后发送通知、记录日志等，避免在主业务流程中直接调用。
**正例**:
```java
// 定义事件
@Getter
public class OrderCreatedEvent extends ApplicationEvent {
    private final Long orderId;
    private final Long userId;

    public OrderCreatedEvent(Object source, Long orderId, Long userId) {
        super(source);
        this.orderId = orderId;
        this.userId = userId;
    }
}

// 发布事件
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final ApplicationEventPublisher eventPublisher;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        Order order = buildAndSaveOrder(dto);
        // 发布事件，解耦后续处理
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order.getId(), dto.getUserId()));
        return order.getId();
    }
}

// 监听事件 - 发送通知
@Component
@Slf4j
public class OrderNotificationListener {

    private final EmailService emailService;
    private final SmsService smsService;

    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("处理订单创建事件，orderId: {}", event.getOrderId());
        emailService.sendOrderConfirmation(event.getOrderId());
        smsService.sendOrderNotification(event.getUserId(), event.getOrderId());
    }
}

// 监听事件 - 记录日志
@Component
public class OrderLogListener {

    private final OperationLogService logService;

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        logService.save(new OperationLog("CREATE_ORDER", event.getOrderId()));
    }
}
```
**反例**:
```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;
    private final EmailService emailService;
    private final SmsService smsService;
    private final OperationLogService logService;
    private final PointService pointService;
    private final CouponService couponService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        Order order = buildAndSaveOrder(dto);
        // 所有后续操作直接调用，强耦合
        emailService.sendOrderConfirmation(order.getId());
        smsService.sendOrderNotification(dto.getUserId(), order.getId());
        logService.save(new OperationLog("CREATE_ORDER", order.getId()));
        pointService.addPoints(dto.getUserId(), order.getTotalAmount());
        couponService.sendNewUserCoupon(dto.getUserId());
        // 任何一个调用失败都会导致整个事务回滚
        return order.getId();
    }
}
```

### R4: 异步处理使用 @Async + 线程池配置
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

// 异步方法
@Service
@Slf4j
public class EmailServiceImpl implements IEmailService {

    @Async("taskExecutor")
    @Override
    public void sendWelcomeEmail(String to, String username) {
        log.info("异步发送欢迎邮件给: {}", to);
        try {
            // 模拟耗时操作
            emailClient.send(to, "欢迎注册", buildWelcomeContent(username));
        } catch (Exception e) {
            log.error("发送邮件失败: to={}", to, e);
        }
    }
}
```
**反例**:
```java
// 使用默认线程池（不推荐）
@Service
public class EmailServiceImpl implements IEmailService {

    @Async  // 没有指定自定义线程池
    public void sendWelcomeEmail(String to, String username) {
        emailClient.send(to, "欢迎注册", buildWelcomeContent(username));
    }
}

// 手动创建线程（无法管理和监控）
@Service
public class EmailServiceImpl implements IEmailService {

    public void sendWelcomeEmail(String to, String username) {
        new Thread(() -> {
            emailClient.send(to, "欢迎注册", buildWelcomeContent(username));
        }).start();
    }
}

// 使用 CompletableFuture 但没有自定义线程池
@Service
public class EmailServiceImpl implements IEmailService {

    public void sendWelcomeEmail(String to, String username) {
        CompletableFuture.runAsync(() -> {
            emailClient.send(to, "欢迎注册", buildWelcomeContent(username));
        });  // 使用 ForkJoinPool.commonPool()
    }
}
```

### R5: 缓存使用 @Cacheable + Redis
**级别**: 建议
**描述**: 高频读取的数据使用 Spring Cache + Redis 缓存，注意 key 设计要有业务含义，并设置合理的过期时间。
**正例**:
```java
// Redis 缓存配置
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        // 用户缓存 30 分钟
        cacheConfigs.put("user", config.entryTtl(Duration.ofMinutes(30)));
        // 字典缓存 24 小时
        cacheConfigs.put("dict", config.entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}

// Service 中使用缓存
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    @Cacheable(value = "user", key = "#id", unless = "#result == null")
    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        return BeanUtil.copyProperties(user, UserVO.class);
    }

    @CacheEvict(value = "user", key = "#id")
    @Override
    public void update(Long id, UserUpdateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setId(id);
        userMapper.updateById(user);
    }

    @CacheEvict(value = "user", key = "#id")
    @Override
    public void delete(Long id) {
        userMapper.deleteById(id);
    }
}
```
**反例**:
```java
// 手动操作 Redis 缓存，代码冗余
@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private StringRedisTemplate redisTemplate;

    public UserVO getById(Long id) {
        String key = "user:" + id;
        String json = redisTemplate.opsForValue().get(key);
        if (json != null) {
            return JSON.parseObject(json, UserVO.class);
        }
        User user = userMapper.selectById(id);
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        redisTemplate.opsForValue().set(key, JSON.toJSONString(vo), 30, TimeUnit.MINUTES);
        return vo;
    }

    public void update(Long id, UserUpdateDTO dto) {
        User user = BeanUtil.copyProperties(dto, User.class);
        user.setId(id);
        userMapper.updateById(user);
        redisTemplate.delete("user:" + id);  // 容易遗漏缓存清理
    }
}

// 缓存 key 设计不合理
@Cacheable(value = "cache", key = "#id")  // key 没有业务含义，不同业务可能冲突
public UserVO getById(Long id) { ... }

// 没有过期时间，可能导致数据不一致
```

### R6: 日志规范使用 SLF4J + Logback
**级别**: 必须
**描述**: 使用 SLF4J 门面 + Logback 实现，禁止使用 System.out.println，日志级别使用合理。
**正例**:
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentMapper paymentMapper;
    private final PaymentClient paymentClient;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentResult processPayment(PaymentRequest request) {
        log.info("开始处理支付，orderId: {}, amount: {}", request.getOrderId(), request.getAmount());

        try {
            PaymentResult result = paymentClient.pay(request);
            log.info("支付成功，orderId: {}, paymentNo: {}", request.getOrderId(), result.getPaymentNo());
            return result;
        } catch (PaymentException e) {
            log.warn("支付失败，orderId: {}, reason: {}", request.getOrderId(), e.getMessage());
            throw new BusinessException(4001, "支付处理失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("支付异常，orderId: {}", request.getOrderId(), e);
            throw new SystemException("支付系统异常");
        }
    }

    // DEBUG 日志在开发环境使用
    public Payment getByOrderId(Long orderId) {
        log.debug("查询支付记录，orderId: {}", orderId);
        return paymentMapper.selectByOrderId(orderId);
    }
}
```
**反例**:
```java
@Service
public class PaymentServiceImpl implements IPaymentService {

    public PaymentResult processPayment(PaymentRequest request) {
        System.out.println("开始处理支付: " + request.getOrderId());   // 禁止使用
        System.out.println("金额: " + request.getAmount());           // 禁止使用

        try {
            PaymentResult result = paymentClient.pay(request);
            System.out.println("支付成功: " + result.getPaymentNo());  // 禁止使用
            return result;
        } catch (Exception e) {
            e.printStackTrace();                                       // 禁止使用
            return null;
        }
    }

    // 日志级别使用不当
    public Payment getByOrderId(Long orderId) {
        log.error("查询支付记录: " + orderId);    // 查询操作不应使用 ERROR 级别
        log.info("debug info: " + orderId);      // 字符串拼接而非占位符
        return paymentMapper.selectByOrderId(orderId);
    }
}
```

### R7: 统一异常体系
**级别**: 必须
**描述**: 建立统一的异常体系，区分业务异常（BusinessException）和系统异常（SystemException），通过全局异常处理器统一处理。
**正例**:
```java
// 业务异常基类
@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}

// 系统异常
@Getter
public class SystemException extends RuntimeException {
    private final int code;

    public SystemException(String message) {
        super(message);
        this.code = 500;
    }

    public SystemException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }
}

// 业务异常子类
public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId) {
        super(4004, "用户不存在: " + userId);
    }
}

public class InsufficientStockException extends BusinessException {
    public InsufficientStockException(String productName) {
        super(4005, "库存不足: " + productName);
    }
}

// 全局异常处理器
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(SystemException.class)
    public Result<Void> handleSystem(SystemException e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return Result.fail(e.getCode(), "系统繁忙，请稍后重试");
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("未知异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}

// 使用示例
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new UserNotFoundException(id);
        }
        return BeanUtil.copyProperties(user, UserVO.class);
    }
}
```
**反例**:
```java
// 直接抛出 RuntimeException，没有异常体系
@Service
public class UserServiceImpl implements IUserService {

    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");  // 不区分异常类型
        }
        return BeanUtil.copyProperties(user, UserVO.class);
    }

    public void create(UserCreateDTO dto) {
        User existing = userMapper.selectByUsername(dto.getUsername());
        if (existing != null) {
            throw new RuntimeException("用户名已存在");  // 无法区分不同业务错误
        }
    }
}

// Controller 中 try-catch 处理所有异常
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {
    try {
        return Result.success(userService.getById(id));
    } catch (RuntimeException e) {
        if (e.getMessage().contains("不存在")) {
            return Result.fail(404, e.getMessage());
        }
        return Result.fail(500, e.getMessage());  // 暴露内部错误
    }
}
```

### R8: 参数校验使用 JSR303 注解 + 自定义校验器
**级别**: 必须
**描述**: 使用 JSR303/Hibernate Validator 注解做基础校验，复杂校验逻辑通过自定义校验注解实现。
**正例**:
```java
// 自定义校验注解 - 手机号校验
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 自定义校验器实现
public class PhoneValidator implements ConstraintValidator<Phone, String> {

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;  // null 交给 @NotBlank 处理
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}

// DTO 中使用
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @Phone
    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码长度8-20个字符")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "密码必须包含大小写字母和数字")
    private String password;
}
```
**反例**:
```java
// 手动校验，代码冗余
@Data
public class UserCreateDTO {
    private String username;
    private String phone;
    private String email;
    private String password;
}

// Service 中手动校验
@Service
public class UserServiceImpl implements IUserService {

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
        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new BusinessException("密码长度至少8个字符");
        }
        // 校验代码比业务代码还多
        // ...
    }
}
```

### R9: 使用 Spring Validation 做参数校验
**级别**: 推荐
**描述**: Controller 方法参数使用 @Validated 或 @Valid 触发校验，支持分组校验以区分不同场景。
**正例**:
```java
// 分组校验接口
public interface Create {}
public interface Update {}

// DTO 使用分组
@Data
public class UserDTO {
    @Null(groups = Create.class, message = "创建时ID必须为空")
    @NotNull(groups = Update.class, message = "更新时ID不能为空")
    private Long id;

    @NotBlank(groups = {Create.class, Update.class}, message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @NotBlank(groups = Create.class, message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码长度8-20个字符")
    private String password;  // 更新时密码可选

    @Email(groups = {Create.class, Update.class}, message = "邮箱格式不正确")
    private String email;
}

// Controller 使用分组校验
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final IUserService userService;

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

    // 方法级别参数校验
    @GetMapping("/check-username")
    public Result<Boolean> checkUsername(
            @NotBlank @Size(min = 2, max = 20) @RequestParam String username) {
        return Result.success(userService.isUsernameAvailable(username));
    }
}
```
**反例**:
```java
// 不使用分组校验，为不同场景创建大量 DTO
@Data
public class UserCreateDTO {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String email;
}

@Data
public class UserUpdateDTO {
    @NotBlank
    private String username;
    // 更新时不传密码，但 DTO 大量重复
    private String email;
}

@Data
public class UserAdminCreateDTO {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String email;
    @NotNull
    private Long roleId;  // 管理员创建时需要角色
}

// Controller 方法不加 @Validated，路径参数不校验
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {
    // id 可能为 null 或负数
    return Result.success(userService.getById(id));
}
```

### R10: 接口幂等性设计
**级别**: 推荐
**描述**: 对写操作接口（创建、更新、支付等）进行幂等性设计，防止重复提交导致数据异常。
**正例**:
```java
// 自定义幂等注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    /** 幂等 key 的 SpEL 表达式 */
    String key();
    /** 过期时间（秒） */
    int expireSeconds() default 60;
}

// 幂等拦截器实现
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
            // 执行失败时删除 key，允许重试
            redisTemplate.delete(key);
            throw e;
        }
    }

    private String parseKey(JoinPoint joinPoint, String spel) {
        // 解析 SpEL 表达式生成幂等 key
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

// Controller 使用幂等注解
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;

    @PostMapping
    @Idempotent(key = "#dto.requestId", expireSeconds = 30)
    public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
        return Result.success(orderService.createOrder(dto));
    }
}
```
**反例**:
```java
// 没有幂等设计，用户多次点击提交按钮
@PostMapping
public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
    // 用户连续点击3次，创建3个订单
    return Result.success(orderService.createOrder(dto));
}

// 前端简单禁用按钮（不可靠）
// 网络超时后用户刷新页面再次提交
// -- 前端方案无法完全保证幂等性

// 使用数据库唯一索引做幂等（性能差）
@PostMapping
public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) {
    try {
        return Result.success(orderService.createOrder(dto));
    } catch (DuplicateKeyException e) {
        return Result.fail(400, "请勿重复提交");
    }
}
```

### R11: 使用 AOP 实现横切关注点
**级别**: 建议
**描述**: 使用 AOP 实现日志记录、权限校验、限流等横切关注点，避免在业务代码中重复编写。
**正例**:
```java
// 自定义操作日志注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {
    String value();              // 操作描述
    OperateType type();          // 操作类型
}

public enum OperateType {
    QUERY, CREATE, UPDATE, DELETE, EXPORT, IMPORT
}

// AOP 切面实现
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class OperationLogAspect {

    private final OperationLogService logService;

    @AfterReturning(pointcut = "@annotation(opLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, OperationLog opLog, Object result) {
        saveLog(joinPoint, opLog, null, result);
    }

    @AfterThrowing(pointcut = "@annotation(opLog)", throwing = "e")
    public void afterThrowing(JoinPoint joinPoint, OperationLog opLog, Exception e) {
        saveLog(joinPoint, opLog, e, null);
    }

    private void saveLog(JoinPoint joinPoint, OperationLog opLog, Exception e, Object result) {
        String username = SecurityUtils.getCurrentUsername();
        String ip = ServletUtils.getClientIP();
        String method = joinPoint.getSignature().getDeclaringTypeName()
                + "." + joinPoint.getSignature().getName();

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUsername(username);
        logEntity.setOperation(opLog.value());
        logEntity.setType(opLog.getType().name());
        logEntity.setMethod(method);
        logEntity.setIp(ip);
        logEntity.setStatus(e == null ? 1 : 0);
        logEntity.setErrorMsg(e != null ? e.getMessage() : null);

        logService.saveAsync(logEntity);
    }
}

// Controller 使用
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @OperationLog(value = "创建用户", type = OperateType.CREATE)
    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }

    @OperationLog(value = "删除用户", type = OperateType.DELETE)
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success(null);
    }

    @OperationLog(value = "导出用户", type = OperateType.EXPORT)
    @GetMapping("/export")
    public void export(HttpServletResponse response) {
        userService.export(response);
    }
}
```
**反例**:
```java
// 每个方法中手动记录日志
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final OperationLogService logService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
        Long id = userService.create(dto);
        // 手动记录日志，每个方法都要重复
        OperationLogEntity log = new OperationLogEntity();
        log.setUsername(SecurityUtils.getCurrentUsername());
        log.setOperation("创建用户");
        log.setMethod("UserController.create");
        log.setIp(ServletUtils.getClientIP());
        log.setStatus(1);
        logService.save(log);
        return Result.success(id);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        // 手动记录日志，容易遗漏
        OperationLogEntity log = new OperationLogEntity();
        log.setUsername(SecurityUtils.getCurrentUsername());
        log.setOperation("删除用户");
        log.setMethod("UserController.delete");
        log.setIp(ServletUtils.getClientIP());
        log.setStatus(1);
        logService.save(log);
        return Result.success(null);
    }
}
```