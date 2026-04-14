# Spring Boot - 项目目录结构约定

## 适用范围
- 适用于所有基于 Spring Boot 的后端项目
- 与 RESTful API 设计规范、数据访问层规范、配置管理规范配合使用
- 适用于 Maven 构建的项目（Gradle 项目参考调整）

## 规则

### R1: 标准 Maven 目录结构
**级别**: 必须
**描述**: 项目必须遵循标准 Maven 目录布局，源码放 src/main/java，资源放 src/main/resources，测试放 src/test/java。
**正例**:
```
my-project/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
└── README.md
```
**反例**:
```
my-project/
├── pom.xml
├── src/
│   ├── com/example/demo/        # 直接放在 src 下
│   └── resources/
│       └── config.xml            # 配置散落在根目录
├── test/                         # 测试不在 src/test 下
└── README.md
```

### R2: 分层架构包结构
**级别**: 必须
**描述**: 按职责分层组织包结构，包含 controller、service、dao（mapper）、model（entity/dto/vo）、config、util、constant 等包。
**正例**:
```
com.example.project/
├── controller/        # 控制器层，接收请求
├── service/           # 业务逻辑层
│   └── impl/          # Service 实现类
├── dao/               # 数据访问层（也可用 mapper）
├── model/
│   ├── entity/        # 数据库实体
│   ├── dto/           # 数据传输对象
│   └── vo/            # 视图对象
├── config/            # 配置类
├── util/              # 工具类
├── constant/          # 常量定义
├── enums/             # 枚举类
├── exception/         # 自定义异常
└── interceptor/       # 拦截器
```
**反例**:
```
com.example.project/
├── controller/
├── service/
├── mapper/
├── entity/            # entity、dto、vo 混在一起
├── dto/
├── vo/
├── utils/             # 命名不统一（util vs utils）
├── Config.java        # 配置类散落在根包
└── Constants.java     # 常量类散落在根包
```

### R3: 包命名约定
**级别**: 必须
**描述**: 包名使用 com.{company}.{project}.{layer} 格式，全部小写，不使用下划线或大写字母。
**正例**:
```java
package com.acme.order.controller;
package com.acme.order.service;
package com.acme.order.dao;
package com.acme.order.model.entity;
package com.acme.order.model.dto;
```
**反例**:
```java
package com.Acme.Order.Controller;   // 大写字母
package com.acme.order_service;      // 下划线
package controller;                   // 没有公司/项目前缀
package com.acme.order.user;          // 按实体而非层分包
```

### R4: 配置文件分层管理
**级别**: 必须
**描述**: 使用 application.yml 作为主配置，通过 application-{profile}.yml 管理多环境配置。
**正例**:
```
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
└── application-prod.yml         # 生产环境
```
**反例**:
```
src/main/resources/
├── application.properties       # 混用 properties 格式
├── application-dev.properties
├── config/
│   ├── db.yml                   # 配置散落在子目录
│   ├── redis.yml
│   └── mq.yml
└── application-prod.yml
```

### R5: 静态资源存放位置
**级别**: 必须
**描述**: 静态资源（CSS、JS、图片等）统一放在 src/main/resources/static 目录下，模板文件放 templates 目录。
**正例**:
```
src/main/resources/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── templates/
    └── index.html
```
**反例**:
```
src/main/resources/
├── public/                  # 同时使用 static 和 public
│   └── style.css
├── static/
│   └── app.js
├── webapp/                  # 旧式 Servlet 项目结构
│   └── WEB-INF/
└── templates/
```

### R6: MyBatis XML 映射文件存放位置
**级别**: 推荐
**描述**: MyBatis 的 XML 映射文件统一放在 resources/mapper/ 目录下，按业务模块分子目录。
**正例**:
```
src/main/resources/
└── mapper/
    ├── UserMapper.xml
    ├── OrderMapper.xml
    └── product/
        └── ProductMapper.xml
```
**反例**:
```
src/main/resources/
├── UserMapper.xml            # 映射文件散落在 resources 根目录
├── OrderMapper.xml
├── mybatis/
│   └── ProductMapper.xml     # 命名不统一（mapper vs mybatis）
└── com/example/demo/dao/     # 放在与 Java 源码相同的包路径下
    └── UserMapper.xml
```

### R7: SQL 脚本存放位置
**级别**: 推荐
**描述**: 数据库初始化脚本和变更脚本统一放在 resources/db/ 目录下，按版本管理。
**正例**:
```
src/main/resources/
└── db/
    ├── schema/               # 建表脚本
    │   ├── V1__init.sql
    │   └── V2__add_order.sql
    └── data/                 # 初始数据
        └── V1__init_data.sql
```
**反例**:
```
src/main/resources/
├── init.sql                  # SQL 脚本散落在根目录
├── update_v2.sql
├── sql/                      # 命名不统一
│   └── create_table.sql
└── db/
    └── migration.sql         # 所有变更合并在一个文件中
```

### R8: 单个 Controller 接口数量限制
**级别**: 推荐
**描述**: 单个 Controller 类中接口方法不超过 10 个，超过时应按职责拆分为多个 Controller。
**正例**:
```java
// 按职责拆分为多个 Controller
@RestController
@RequestMapping("/api/users")
public class UserController {
    // 用户 CRUD 相关，约 5-6 个方法
    @GetMapping
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) { ... }

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) { ... }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody UserCreateDTO dto) { ... }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) { ... }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) { ... }
}

@RestController
@RequestMapping("/api/users/profile")
public class UserProfileController {
    // 用户资料相关，约 3-4 个方法
    @GetMapping("/me")
    public Result<UserProfileVO> getMyProfile() { ... }

    @PutMapping("/me")
    public Result<Void> updateProfile(@Valid @RequestBody ProfileUpdateDTO dto) { ... }

    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam MultipartFile file) { ... }
}
```
**反例**:
```java
// 一个 Controller 包含所有用户相关接口，超过 20 个方法
@RestController
@RequestMapping("/api")
public class UserApiController {
    @GetMapping("/users")                           // 1
    public Result list() { ... }
    @GetMapping("/users/{id}")                      // 2
    public Result getById() { ... }
    @PostMapping("/users")                          // 3
    public Result create() { ... }
    @PutMapping("/users/{id}")                      // 4
    public Result update() { ... }
    @DeleteMapping("/users/{id}")                   // 5
    public Result delete() { ... }
    @PostMapping("/users/{id}/avatar")              // 6
    public Result uploadAvatar() { ... }
    @GetMapping("/users/{id}/orders")               // 7
    public Result getOrders() { ... }
    @PostMapping("/users/{id}/roles")               // 8
    public Result assignRole() { ... }
    @GetMapping("/users/{id}/permissions")          // 9
    public Result getPermissions() { ... }
    @PutMapping("/users/{id}/password")             // 10
    public Result changePassword() { ... }
    @PutMapping("/users/{id}/status")               // 11
    public Result changeStatus() { ... }
    @GetMapping("/users/{id}/logs")                 // 12
    public Result getLogs() { ... }
    // ... 更多方法
}
```

### R9: Service 接口和实现分离
**级别**: 推荐
**描述**: Service 层应定义接口（以 I 前缀命名）和实现类（以 Impl 后缀命名），面向接口编程。
**正例**:
```java
// 接口定义
public interface IUserService {
    UserVO getById(Long id);
    Long create(UserCreateDTO dto);
    void update(Long id, UserUpdateDTO dto);
    void delete(Long id);
    PageResult<UserVO> page(UserQueryDTO query);
}

// 实现类
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserMapper userMapper;

    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        return BeanUtil.copyProperties(user, UserVO.class);
    }

    // ... 其他方法实现
}

// Controller 中注入接口
@RestController
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;
}
```
**反例**:
```java
// 直接定义实现类，没有接口
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        return BeanUtil.copyProperties(user, UserVO.class);
    }
}

// Controller 直接依赖实现类
@RestController
public class UserController {
    @Autowired
    private UserService userService;  // 直接依赖实现类
}
```

### R10: 启动类放根包下
**级别**: 必须
**描述**: Spring Boot 启动类（@SpringBootApplication）放在根包下，其他组件在子包中，利用自动包扫描机制。
**正例**:
```
com.example.project/
├── ProjectApplication.java          # @SpringBootApplication 在根包
├── controller/
│   └── UserController.java
├── service/
│   ├── IUserService.java
│   └── impl/
│       └── UserServiceImpl.java
├── dao/
│   └── UserMapper.java
└── model/
    └── entity/
        └── User.java
```
```java
package com.example.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjectApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);
    }
}
```
**反例**:
```
com.example.project/
├── config/
│   └── ProjectApplication.java      # 启动类不在根包
├── controller/
│   └── UserController.java
└── service/
    └── UserService.java
```
```java
package com.example.project.config;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.project")  // 需要手动配置扫描
public class ProjectApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);
    }
}
```