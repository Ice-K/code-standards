# Spring Boot - RESTful API 设计规范

## 适用范围
- 适用于所有 Spring Boot 项目对外暴露的 RESTful API 接口
- 与项目目录结构约定、数据访问层规范配合使用
- 前后端分离项目的后端接口设计必须遵循

## 规则

### R1: URL 使用名词复数
**级别**: 必须
**描述**: API 路径使用名词复数形式表示资源集合，不在 URL 中使用动词描述操作。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public Result<PageResult<UserVO>> list() { ... }

    @PostMapping
    public Result<Void> create(@RequestBody UserCreateDTO dto) { ... }

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) { ... }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/getUserList")          // URL 中包含动词
    public Result<List<UserVO>> list() { ... }

    @PostMapping("/createUser")          // URL 中包含动词
    public Result<Void> create(@RequestBody UserCreateDTO dto) { ... }

    @GetMapping("/user")                 // 单数形式
    public Result<UserVO> getById(@RequestParam Long id) { ... }
}
```

### R2: HTTP 方法语义正确
**级别**: 必须
**描述**: 正确使用 HTTP 方法语义：GET 查询、POST 新增、PUT 全量修改、DELETE 删除、PATCH 部分更新。
**正例**:
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping                          // GET - 查询订单列表
    public Result<PageResult<OrderVO>> list(@Valid OrderQueryDTO query) { ... }

    @GetMapping("/{id}")                 // GET - 查询单个订单
    public Result<OrderVO> getById(@PathVariable Long id) { ... }

    @PostMapping                         // POST - 创建订单
    public Result<Long> create(@Valid @RequestBody OrderCreateDTO dto) { ... }

    @PutMapping("/{id}")                 // PUT - 全量更新订单
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody OrderUpdateDTO dto) { ... }

    @PatchMapping("/{id}/status")        // PATCH - 部分更新订单状态
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody OrderStatusDTO dto) { ... }

    @DeleteMapping("/{id}")              // DELETE - 删除订单
    public Result<Void> delete(@PathVariable Long id) { ... }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping("/list")                // POST 用于查询
    public Result<PageResult<OrderVO>> list(@RequestBody OrderQueryDTO query) { ... }

    @GetMapping("/create")               // GET 用于创建（可能有安全问题）
    public Result<Long> create(OrderCreateDTO dto) { ... }

    @PostMapping("/update/{id}")         // POST 用于更新
    public Result<Void> update(@PathVariable Long id, @RequestBody OrderUpdateDTO dto) { ... }

    @GetMapping("/delete/{id}")          // GET 用于删除
    public Result<Void> delete(@PathVariable Long id) { ... }
}
```

### R3: 统一返回体 Result<T> 包装
**级别**: 必须
**描述**: 所有接口统一使用 Result<T> 包装返回值，包含 code（状态码）、message（提示信息）、data（业务数据）三个字段。
**正例**:
```java
// 统一返回体定义
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}

// Controller 使用
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) {
    UserVO user = userService.getById(id);
    return Result.success(user);
}
```
**反例**:
```java
// 直接返回业务对象，没有统一包装
@GetMapping("/{id}")
public UserVO getById(@PathVariable Long id) {
    return userService.getById(id);
}

// 每个接口自行定义返回格式
@GetMapping("/{id}")
public Map<String, Object> getById(@PathVariable Long id) {
    Map<String, Object> map = new HashMap<>();
    map.put("status", "ok");
    map.put("result", userService.getById(id));
    return map;
}

// 使用不同的包装类
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<UserVO>> getById(@PathVariable Long id) { ... }

@PostMapping
public JsonResult<Long> create(@RequestBody UserCreateDTO dto) { ... }
```

### R4: 使用 @Valid + JSR303 做参数校验
**级别**: 必须
**描述**: 使用 JSR303 注解对请求参数进行校验，结合 @Valid 或 @Validated 触发校验，避免在业务代码中手动校验。
**正例**:
```java
// DTO 中定义校验规则
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度6-20个字符")
    private String password;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "角色不能为空")
    private Long roleId;
}

// Controller 中使用 @Valid 触发校验
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    return Result.success(userService.create(dto));
}
```
**反例**:
```java
// 手动编写校验逻辑
@PostMapping
public Result<Long> create(@RequestBody UserCreateDTO dto) {
    if (dto.getUsername() == null || dto.getUsername().isEmpty()) {
        return Result.fail(400, "用户名不能为空");
    }
    if (dto.getUsername().length() < 2 || dto.getUsername().length() > 20) {
        return Result.fail(400, "用户名长度2-20个字符");
    }
    if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
        return Result.fail(400, "密码不能为空");
    }
    // ... 大量手动校验代码
    return Result.success(userService.create(dto));
}
```

### R5: 全局异常处理 @RestControllerAdvice
**级别**: 必须
**描述**: 使用 @RestControllerAdvice + @ExceptionHandler 统一处理异常，避免异常信息直接暴露给前端。
**正例**:
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}", message);
        return Result.fail(400, message);
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}
```
**反例**:
```java
// 每个 Controller 方法中 try-catch 处理异常
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    try {
        return Result.success(userService.create(dto));
    } catch (BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();                    // 直接打印堆栈
        return Result.fail(500, e.getMessage()); // 暴露内部错误信息
    }
}

// 没有全局异常处理，异常直接返回堆栈信息
// 前端收到: {"timestamp":"2024-01-01T00:00:00.000+00:00","status":500,"error":"Internal Server Error"...}
```

### R6: 分页接口使用 PageRequest/PageResult 封装
**级别**: 推荐
**描述**: 分页查询接口统一使用自定义的 PageRequest 和 PageResult 对象封装分页参数和结果。
**正例**:
```java
// 分页请求对象
@Data
public class PageRequest {
    @Min(value = 1, message = "页码最小为1")
    private int pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 100, message = "每页条数最大为100")
    private int pageSize = 10;
}

// 分页结果对象
@Data
public class PageResult<T> {
    private List<T> records;
    private long total;
    private int pageNum;
    private int pageSize;

    public static <T> PageResult<T> of(List<T> records, long total, int pageNum, int pageSize) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(total);
        result.setPageNum(pageNum);
        result.setPageSize(pageSize);
        return result;
    }
}

// Controller 使用
@GetMapping
public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
    return Result.success(userService.page(query));
}
```
**反例**:
```java
// 直接使用原始参数
@GetMapping
public Result<Map<String, Object>> list(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String keyword) {
    // 手动构建分页结果
    Map<String, Object> result = new HashMap<>();
    result.put("list", userService.list(keyword, page, size));
    result.put("total", userService.count(keyword));
    result.put("page", page);
    result.put("size", size);
    return Result.success(result);
}

// 直接暴露 MyBatis-Plus 的 Page 对象
@GetMapping
public Result<Page<User>> list(@RequestParam int current, @RequestParam int size) {
    return Result.success(userMapper.selectPage(new Page<>(current, size), null));
}
```

### R7: 接口版本管理
**级别**: 建议
**描述**: API 路径中包含版本号，便于接口升级和兼容性管理，推荐使用 /api/v{version}/资源 格式。
**正例**:
```java
// V1 版本
@RestController
@RequestMapping("/api/v1/users")
public class UserV1Controller {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
}

// V2 版本（新增字段或修改逻辑）
@RestController
@RequestMapping("/api/v2/users")
public class UserV2Controller {

    @GetMapping("/{id}")
    public Result<UserV2VO> getById(@PathVariable Long id) {
        return Result.success(userService.getByIdV2(id));
    }
}
```
**反例**:
```java
// 没有版本号，直接修改接口导致旧客户端不兼容
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        // 直接修改返回结构，前端未同步更新会导致异常
        return Result.success(userService.getById(id));
    }
}

// 通过自定义 Header 传递版本号，不够直观
@GetMapping(value = "/{id}", headers = "API-Version=2")
public Result<UserVO> getById(@PathVariable Long id) { ... }
```

### R8: 参数绑定方式正确
**级别**: 必须
**描述**: 查询参数使用 @RequestParam，路径参数使用 @PathVariable，请求体使用 @RequestBody，明确区分参数来源。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // 路径参数 - 标识具体资源
    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) { ... }

    // 查询参数 - 过滤条件
    @GetMapping
    public Result<PageResult<UserVO>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword) { ... }

    // 请求体 - 创建资源
    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) { ... }
}
```
**反例**:
```java
// 混用参数绑定方式
@PostMapping("/{id}")
public Result<Void> update(
        @PathVariable Long id,
        @RequestParam String username,     // 应该用 @RequestBody 接收
        @RequestParam String email) { ... }

// 使用 HttpServletRequest 手动获取参数
@GetMapping
public Result<PageResult<UserVO>> list(HttpServletRequest request) {
    String keyword = request.getParameter("keyword");
    int pageNum = Integer.parseInt(request.getParameter("pageNum"));
    // ...
}

// 路径参数和查询参数混用不明确
@GetMapping("/search/{keyword}")
public Result<List<UserVO>> search(
        @PathVariable String keyword,
        @RequestParam int pageNum) { ... }
```

### R9: 请求体使用 @RequestBody + DTO 接收
**级别**: 必须
**描述**: POST/PUT/PATCH 请求使用 @RequestBody 接收 JSON 请求体，并通过专门的 DTO 类封装参数。
**正例**:
```java
// 创建用户 DTO
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "部门ID不能为空")
    private Long deptId;
}

// 更新用户 DTO（与创建 DTO 分离）
@Data
public class UserUpdateDTO {
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    private Long deptId;
}

// Controller 使用
@PostMapping
public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
    return Result.success(userService.create(dto));
}

@PutMapping("/{id}")
public Result<Void> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) {
    userService.update(id, dto);
    return Result.success(null);
}
```
**反例**:
```java
// 直接使用 Entity 接收参数
@PostMapping
public Result<Long> create(@RequestBody User user) {
    return Result.success(userService.create(user));
}

// 使用 Map 接收参数
@PostMapping
public Result<Long> create(@RequestBody Map<String, Object> params) {
    String username = (String) params.get("username");
    // 类型不安全，没有校验
}

// 创建和更新共用同一个 DTO
@Data
public class UserDTO {
    private Long id;              // 创建时不需要
    private String username;
    private String password;      // 更新时可能不需要
    private String email;
}
```

### R10: Controller 只做参数校验和调用 Service
**级别**: 必须
**描述**: Controller 层职责单一，只负责接收参数、参数校验、调用 Service、返回结果，不包含任何业务逻辑。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody UserCreateDTO dto) {
        Long id = userService.create(dto);
        return Result.success(id);
    }

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        UserVO user = userService.getById(id);
        return Result.success(user);
    }
}
```
**反例**:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public Result<Long> create(@RequestBody UserCreateDTO dto) {
        // Controller 中包含业务逻辑
        User existing = userMapper.selectByUsername(dto.getUsername());
        if (existing != null) {
            return Result.fail(400, "用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(DigestUtils.md5Hex(dto.getPassword()));  // 加密逻辑
        user.setStatus(1);
        user.setCreateTime(new Date());
        userMapper.insert(user);

        emailService.sendWelcomeEmail(user.getEmail());  // 发邮件逻辑
        return Result.success(user.getId());
    }
}
```

### R11: 文件上传接口使用 MultipartFile
**级别**: 必须
**描述**: 文件上传接口使用 MultipartFile 接收文件，并限制文件大小和类型。
**正例**:
```java
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public Result<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "common") String type) {

        // 校验文件大小（10MB）
        if (file.getSize() > 10 * 1024 * 1024) {
            return Result.fail(400, "文件大小不能超过10MB");
        }

        // 校验文件类型
        String contentType = file.getContentType();
        List<String> allowedTypes = List.of("image/jpeg", "image/png", "application/pdf");
        if (!allowedTypes.contains(contentType)) {
            return Result.fail(400, "不支持的文件类型");
        }

        String url = fileService.upload(file, type);
        return Result.success(url);
    }

    @PostMapping("/batch-upload")
    public Result<List<String>> batchUpload(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = fileService.batchUpload(files);
        return Result.success(urls);
    }
}
```
**反例**:
```java
@PostMapping("/upload")
public Result<String> upload(HttpServletRequest request) {
    // 手动解析 multipart 请求
    MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
    MultipartFile file = multipartRequest.getFile("file");
    // 没有文件大小和类型校验
    // 没有限制上传格式
    String path = "/upload/" + file.getOriginalFilename();
    file.transferTo(new File(path));  // 直接使用原始文件名，存在安全风险
    return Result.success(path);
}
```

### R12: 接口必须有 Swagger/OpenAPI 注解
**级别**: 推荐
**描述**: 所有接口必须添加 Swagger/OpenAPI 注解，描述接口用途、参数含义和返回值，便于生成 API 文档。
**正例**:
```java
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户相关接口")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @Operation(summary = "根据ID查询用户", description = "返回指定用户的详细信息")
    @Parameter(name = "id", description = "用户ID", required = true)
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @Operation(summary = "创建用户", description = "创建新用户并返回用户ID")
    @PostMapping
    public Result<Long> create(
            @Parameter(description = "用户创建参数")
            @Valid @RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }

    @Operation(summary = "分页查询用户列表")
    @GetMapping
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
        return Result.success(userService.page(query));
    }
}
```
**反例**:
```java
// 没有任何注解说明
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    public Result<Long> create(@RequestBody UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }
}

// 使用过时的 Swagger 2 注解（应迁移到 OpenAPI 3）
@ApiOperation(value = "获取用户")
@GetMapping("/{id}")
public Result<UserVO> getById(@PathVariable Long id) { ... }
```