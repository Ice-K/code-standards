---
id: springboot-advanced-patterns
title: Spring Boot - 进阶模式
tags: [springboot, advanced, event, async, cache, idempotent, aop]
trigger:
  extensions: [.java]
  frameworks: [springboot]
skip:
  keywords: [增删改查, CRUD, 列表, 表单, 组件, 页面, UI, CSS, 样式]
---

# Spring Boot - 进阶模式

## 适用范围
- 适用于 Spring Boot 项目中使用事件驱动、异步处理、缓存、幂等、AOP 等进阶模式
- 核心最佳实践（依赖注入、分层、日志、异常、校验）见 `best-practices.md`
- 与微服务设计规范、网关规范配合使用

## 规则

### R1: 使用 Spring 事件 ApplicationEvent 解耦模块
**级别**: 建议
**描述**: 使用 Spring 事件机制解耦模块间交互，如订单创建后发送通知、记录日志等，避免在主业务流程中直接调用。
**正例**:
```java
// 定义事件
@Getter
public class OrderCreatedEvent extends ApplicationEvent {
    private final Long orderId;
    public OrderCreatedEvent(Object source, Long orderId) {
        super(source);
        this.orderId = orderId;
    }
}

// 发布事件
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderCreateDTO dto) {
        Order order = buildAndSaveOrder(dto);
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order.getId()));
        return order.getId();
    }
}

// 监听事件（可多个监听器，互不干扰）
@Component
@Slf4j
public class OrderNotificationListener {

    @EventListener
    @Async("taskExecutor")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("处理订单创建事件，orderId: {}", event.getOrderId());
        emailService.sendOrderConfirmation(event.getOrderId());
    }
}
```
**反例**:
```java
// 主流程中直接调用所有后续服务，强耦合
@Transactional(rollbackFor = Exception.class)
public Long createOrder(OrderCreateDTO dto) {
    Order order = buildAndSaveOrder(dto);
    emailService.sendOrderConfirmation(order.getId());      // 任一失败全部回滚
    smsService.sendOrderNotification(dto.getUserId(), order.getId());
    logService.save(new OperationLog("CREATE_ORDER", order.getId()));
    pointService.addPoints(dto.getUserId(), order.getTotalAmount());
    couponService.sendNewUserCoupon(dto.getUserId());
    return order.getId();
}
```

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

### R3: 缓存使用 @Cacheable + Redis
**级别**: 建议
**描述**: 高频读取的数据使用 Spring Cache + Redis 缓存，注意 key 设计要有业务含义，并设置合理的过期时间。
**正例**:
```java
// Redis 缓存配置——按业务分组设置不同 TTL
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        configs.put("user", defaults.entryTtl(Duration.ofMinutes(30)));
        configs.put("dict", defaults.entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaults)
                .withInitialCacheConfigurations(configs)
                .build();
    }
}

// Service 中使用缓存——key 有业务含义，更新/删除时清除缓存
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    @Cacheable(value = "user", key = "#id", unless = "#result == null")
    @Override
    public UserVO getById(Long id) {
        return BeanUtil.copyProperties(userMapper.selectById(id), UserVO.class);
    }

    @CacheEvict(value = "user", key = "#id")
    @Override
    public void update(Long id, UserUpdateDTO dto) {
        userMapper.updateById(BeanUtil.copyProperties(dto, User.class));
    }
}
```
**反例**:
```java
// 手动操作 Redis，代码冗余且容易遗漏缓存清理
@Autowired private StringRedisTemplate redisTemplate;

public UserVO getById(Long id) {
    String json = redisTemplate.opsForValue().get("user:" + id);
    if (json != null) return JSON.parseObject(json, UserVO.class);
    UserVO vo = BeanUtil.copyProperties(userMapper.selectById(id), UserVO.class);
    redisTemplate.opsForValue().set("user:" + id, JSON.toJSONString(vo), 30, TimeUnit.MINUTES);
    return vo;
}

@Cacheable(value = "cache", key = "#id")  // key 无业务含义，不同业务可能冲突
public UserVO getById(Long id) { ... }
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

### R5: 使用 AOP 实现横切关注点
**级别**: 建议
**描述**: 使用 AOP 实现操作日志、权限校验等横切关注点，避免在业务代码中重复编写。
**正例**:
```java
// 自定义操作日志注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {
    String value();
    OperateType type();
}

// AOP 切面
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class OperationLogAspect {

    private final OperationLogService logService;

    @AfterReturning(pointcut = "@annotation(opLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, OperationLog opLog, Object result) {
        saveLog(joinPoint, opLog, null);
    }

    @AfterThrowing(pointcut = "@annotation(opLog)", throwing = "e")
    public void afterThrowing(JoinPoint joinPoint, OperationLog opLog, Exception e) {
        saveLog(joinPoint, opLog, e);
    }

    private void saveLog(JoinPoint joinPoint, OperationLog opLog, Exception e) {
        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUsername(SecurityUtils.getCurrentUsername());
        logEntity.setOperation(opLog.value());
        logEntity.setMethod(joinPoint.getSignature().toShortString());
        logEntity.setStatus(e == null ? 1 : 0);
        logEntity.setErrorMsg(e != null ? e.getMessage() : null);
        logService.saveAsync(logEntity);
    }
}

// Controller 使用——一行注解替代手动记录
@OperationLog(value = "创建用户", type = OperateType.CREATE)
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    return Result.success(userService.create(dto));
}
```
**反例**:
```java
// 每个方法手动记录日志，容易遗漏
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    Long id = userService.create(dto);
    OperationLogEntity log = new OperationLogEntity();
    log.setUsername(SecurityUtils.getCurrentUsername());
    log.setOperation("创建用户");
    log.setMethod("UserController.create");
    log.setStatus(1);
    logService.save(log);            // 每个方法都重复这段代码
    return Result.success(id);
}
```