# 规则索引

全局规则 ID 格式：`R-{CATEGORY}-{N}`，用于精确加载单条规则。

## Java

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-JAVA-CS-01 | R1 | java/coding-style.md | boolean 变量不加 is 前缀 | 必须 |
| R-JAVA-CS-02 | R2 | java/coding-style.md | POJO 类使用包装类型 | 必须 |
| R-JAVA-CS-03 | R3 | java/coding-style.md | 方法参数不超过 5 个 | 必须 |
| R-JAVA-CS-04 | R4 | java/coding-style.md | 单个方法行数不超过 80 行 | 必须 |
| R-JAVA-BP-01 | R1 | java/best-practices.md | 不捕获 Exception 基类 | 必须 |
| R-JAVA-BP-02 | R2 | java/best-practices.md | 字符串拼接使用 StringBuilder 或 String.format | 推荐 |
| R-JAVA-BP-03 | R3 | java/best-practices.md | 线程池使用 ThreadPoolExecutor | 必须 |
| R-JAVA-BP-04 | R4 | java/best-practices.md | 日期使用 LocalDateTime | 必须 |
| R-JAVA-BP-05 | R5 | java/best-practices.md | 金额使用 BigDecimal | 必须 |
| R-JAVA-BP-06 | R6 | java/best-practices.md | Map 使用 computeIfAbsent | 推荐 |
| R-JAVA-BP-07 | R7 | java/best-practices.md | 使用 Optional 替代 null 返回值 | 推荐 |
| R-JAVA-BP-08 | R8 | java/best-practices.md | 避免在循环中创建大量对象 | 必须 |
| R-JAVA-BP-09 | R9 | java/best-practices.md | 使用枚举替代魔法值 | 必须 |
| R-JAVA-CM-01 | R1 | java/comment-standards.md | 所有 public 类必须有 Javadoc | 必须 |
| R-JAVA-CM-02 | R2 | java/comment-standards.md | 所有 public 方法必须有 Javadoc | 必须 |
| R-JAVA-CM-03 | R3 | java/comment-standards.md | 注释描述 why 而非 what | 必须 |
| R-JAVA-CM-04 | R4 | java/comment-standards.md | TODO 注释必须带作者和日期 | 必须 |
| R-JAVA-CM-05 | R5 | java/comment-standards.md | 不使用行尾注释 | 推荐 |
| R-JAVA-CM-06 | R6 | java/comment-standards.md | 复杂逻辑上方必须添加行内注释 | 必须 |
| R-JAVA-CM-07 | R7 | java/comment-standards.md | 常量必须有注释说明用途 | 必须 |
| R-JAVA-CM-08 | R8 | java/comment-standards.md | 接口方法注释放在接口中 | 必须 |
| R-JAVA-CM-09 | R9 | java/comment-standards.md | 枚举值必须有 Javadoc 注释 | 必须 |
| R-JAVA-CM-10 | R10 | java/comment-standards.md | 中文注释和英文注释不混用 | 必须 |
| R-JAVA-DP-CR-01 | R1 | java/design-patterns-creational.md | 单例模式（Singleton） | 推荐 |
| R-JAVA-DP-CR-02 | R2 | java/design-patterns-creational.md | 工厂方法模式（Factory Method） | 推荐 |
| R-JAVA-DP-CR-03 | R3 | java/design-patterns-creational.md | 抽象工厂模式（Abstract Factory） | 建议 |
| R-JAVA-DP-CR-04 | R4 | java/design-patterns-creational.md | 建造者模式（Builder） | 必须 |
| R-JAVA-DP-CR-05 | R5 | java/design-patterns-creational.md | 原型模式（Prototype） | 建议 |
| R-JAVA-DP-ST-01 | R1 | java/design-patterns-structural.md | 适配器模式（Adapter） | 推荐 |
| R-JAVA-DP-ST-02 | R2 | java/design-patterns-structural.md | 桥接模式（Bridge） | 建议 |
| R-JAVA-DP-ST-03 | R3 | java/design-patterns-structural.md | 组合模式（Composite） | 建议 |
| R-JAVA-DP-ST-04 | R4 | java/design-patterns-structural.md | 装饰器模式（Decorator） | 推荐 |
| R-JAVA-DP-ST-05 | R5 | java/design-patterns-structural.md | 门面模式（Facade） | 推荐 |
| R-JAVA-DP-ST-06 | R6 | java/design-patterns-structural.md | 代理模式（Proxy） | 推荐 |
| R-JAVA-DP-BH-01 | R1 | java/design-patterns-behavioral.md | 责任链模式（Chain of Responsibility） | 推荐 |
| R-JAVA-DP-BH-02 | R2 | java/design-patterns-behavioral.md | 命令模式（Command） | 建议 |
| R-JAVA-DP-BH-03 | R3 | java/design-patterns-behavioral.md | 观察者模式（Observer） | 必须 |
| R-JAVA-DP-BH-04 | R4 | java/design-patterns-behavioral.md | 状态模式（State） | 推荐 |
| R-JAVA-DP-BH-05 | R5 | java/design-patterns-behavioral.md | 策略模式（Strategy） | 必须 |
| R-JAVA-DP-BH-06 | R6 | java/design-patterns-behavioral.md | 模板方法模式（Template Method） | 推荐 |

## Spring Boot

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-SB-PS-01 | R1 | springboot/project-structure.md | 分层架构包结构 | 必须 |
| R-SB-PS-02 | R2 | springboot/project-structure.md | 配置文件分层管理 | 必须 |
| R-SB-PS-03 | R3 | springboot/project-structure.md | SQL 脚本存放位置 | 推荐 |
| R-SB-API-01 | R1 | springboot/api-design.md | HTTP 方法语义正确 | 必须 |
| R-SB-API-02 | R2 | springboot/api-design.md | 统一返回体 Result<T> 包装 | 必须 |
| R-SB-API-03 | R3 | springboot/api-design.md | 使用 @Valid + JSR303 做参数校验 | 必须 |
| R-SB-API-04 | R4 | springboot/api-design.md | 全局异常处理 @RestControllerAdvice | 必须 |
| R-SB-API-05 | R5 | springboot/api-design.md | 分页接口使用 PageRequest 封装 | 推荐 |
| R-SB-API-06 | R6 | springboot/api-design.md | 请求体使用 @RequestBody + DTO 接收 | 必须 |
| R-SB-API-07 | R7 | springboot/api-design.md | Controller 只做参数校验和调用 Service | 必须 |
| R-SB-API-08 | R8 | springboot/api-design.md | 接口必须有 Swagger/OpenAPI 注解 | 推荐 |
| R-SB-CFG-01 | R1 | springboot/config-management.md | 自定义配置使用 @ConfigurationProperties | 必须 |
| R-SB-CFG-02 | R2 | springboot/config-management.md | 敏感配置使用环境变量或加密 | 必须 |
| R-SB-CFG-03 | R3 | springboot/config-management.md | 配置变更需有注释说明 | 建议 |
| R-SB-CFG-04 | R4 | springboot/config-management.md | 不在代码中硬编码配置值 | 必须 |
| R-SB-DA-01 | R1 | springboot/data-access.md | 通用查询使用 LambdaQueryWrapper | 推荐 |
| R-SB-DA-02 | R2 | springboot/data-access.md | 逻辑删除使用 @TableLogic | 推荐 |
| R-SB-DA-03 | R3 | springboot/data-access.md | 自动填充字段使用 @TableField(fill = FieldFill) | 推荐 |
| R-SB-DA-04 | R4 | springboot/data-access.md | 枚举字段使用 @EnumValue 注解 | 建议 |
| R-SB-BP-01 | R1 | springboot/best-practices.md | 依赖注入使用构造器注入 | 推荐 |
| R-SB-BP-02 | R2 | springboot/best-practices.md | 避免在 Controller 写业务逻辑 | 必须 |
| R-SB-BP-03 | R3 | springboot/best-practices.md | 参数校验使用 JSR303 + 分组校验 | 必须 |
| R-SB-AP-01 | R1 | springboot/advanced-patterns.md | 使用 Spring 事件 ApplicationEvent 解耦模块 | 建议 |
| R-SB-AP-02 | R2 | springboot/advanced-patterns.md | 异步处理使用 @Async + 自定义线程池 | 推荐 |
| R-SB-AP-03 | R3 | springboot/advanced-patterns.md | 缓存使用 @Cacheable + Redis | 建议 |
| R-SB-AP-04 | R4 | springboot/advanced-patterns.md | 接口幂等性设计 | 推荐 |
| R-SB-AP-05 | R5 | springboot/advanced-patterns.md | 使用 AOP 实现横切关注点 | 建议 |

## Vue3

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-V3-CS-01 | R1 | vue3/component-standards.md | 组件文件使用 PascalCase 命名 | 必须 |
| R-V3-CS-02 | R2 | vue3/component-standards.md | 使用 script setup + TypeScript | 必须 |
| R-V3-CS-03 | R3 | vue3/component-standards.md | defineProps 配合 TS interface 定义 | 必须 |
| R-V3-CS-04 | R4 | vue3/component-standards.md | defineEmits 配合 TS 泛型定义 | 必须 |
| R-V3-CS-05 | R5 | vue3/component-standards.md | 组件目录结构组织 | 推荐 |
| R-V3-CS-06 | R6 | vue3/component-standards.md | props 默认值使用 withDefaults | 必须 |
| R-V3-CS-07 | R7 | vue3/component-standards.md | 使用 defineOptions 设置组件名 | 推荐 |
| R-V3-CS-08 | R8 | vue3/component-standards.md | v-slot 使用具名插槽 | 推荐 |
| R-V3-CS-09 | R9 | vue3/component-standards.md | 使用 scoped 限定样式作用域 | 必须 |
| R-V3-CS-10 | R10 | vue3/component-standards.md | 模板中不写复杂表达式 | 推荐 |
| R-V3-CS-11 | R11 | vue3/component-standards.md | v-for 必须绑定 key | 必须 |
| R-V3-CS-12 | R12 | vue3/component-standards.md | 优先使用 props 和 emit 通信 | 必须 |
| R-V3-CA-01 | R1 | vue3/composition-api.md | ref 用于基本类型，reactive 用于对象 | 必须 |
| R-V3-CA-02 | R2 | vue3/composition-api.md | 合理使用 computed 缓存计算属性 | 必须 |
| R-V3-CA-03 | R3 | vue3/composition-api.md | watch 与 watchEffect 的选择 | 推荐 |
| R-V3-CA-04 | R4 | vue3/composition-api.md | 生命周期钩子使用规范 | 推荐 |
| R-V3-CA-05 | R5 | vue3/composition-api.md | Composable 函数以 use 前缀命名 | 必须 |
| R-V3-CA-06 | R6 | vue3/composition-api.md | 使用 toRefs 保持响应性 | 推荐 |
| R-V3-CA-07 | R7 | vue3/composition-api.md | 不直接解构 reactive 对象 | 必须 |
| R-V3-CA-08 | R8 | vue3/composition-api.md | 使用 shallowRef 优化大对象性能 | 建议 |
| R-V3-CA-09 | R9 | vue3/composition-api.md | nextTick 的正确使用场景 | 推荐 |
| R-V3-CA-10 | R10 | vue3/composition-api.md | 卸载时清理副作用 | 必须 |
| R-V3-TS-01 | R1 | vue3/typescript-usage.md | interface 优先于 type | 推荐 |
| R-V3-TS-02 | R2 | vue3/typescript-usage.md | 使用 ApiResponse<T> 泛型封装接口响应 | 必须 |
| R-V3-TS-03 | R3 | vue3/typescript-usage.md | defineProps 使用泛型语法 | 必须 |
| R-V3-TS-04 | R4 | vue3/typescript-usage.md | defineEmits 使用泛型签名 | 必须 |
| R-V3-TS-05 | R5 | vue3/typescript-usage.md | 泛型参数命名遵循 T/K/V 约定 | 推荐 |
| R-V3-TS-06 | R6 | vue3/typescript-usage.md | 优先使用 as const 而非 enum | 推荐 |
| R-V3-TS-07 | R7 | vue3/typescript-usage.md | 使用类型守卫进行类型收窄 | 推荐 |
| R-V3-TS-08 | R8 | vue3/typescript-usage.md | 启用 TypeScript strict 模式 | 必须 |
| R-V3-TS-09 | R9 | vue3/typescript-usage.md | 使用 import type 导入类型 | 推荐 |
| R-V3-TS-10 | R10 | vue3/typescript-usage.md | 禁止使用 any，用 unknown 替代 | 必须 |
| R-V3-SM-01 | R1 | vue3/state-management.md | 使用 Setup Store 风格定义 Store | 推荐 |
| R-V3-SM-02 | R2 | vue3/state-management.md | Store 命名使用 useXxxStore 格式 | 必须 |
| R-V3-SM-03 | R3 | vue3/state-management.md | State/Getters/Actions 职责分离 | 必须 |
| R-V3-SM-04 | R4 | vue3/state-management.md | 异步 Action 使用 async/await | 必须 |
| R-V3-SM-05 | R5 | vue3/state-management.md | Store 之间可组合复用 | 推荐 |
| R-V3-SM-06 | R6 | vue3/state-management.md | 使用 storeToRefs 解构 Store | 必须 |
| R-V3-SM-07 | R7 | vue3/state-management.md | 不在组件外部直接使用 Store | 必须 |
| R-V3-SM-08 | R8 | vue3/state-management.md | 按功能模块拆分 Store | 推荐 |
| R-V3-SM-09 | R9 | vue3/state-management.md | 持久化使用 pinia-plugin-persistedstate | 建议 |
| R-V3-SM-10 | R10 | vue3/state-management.md | 使用 $reset 重置 Store 状态 | 推荐 |
| R-V3-PS-01 | R1 | vue3/project-structure.md | Vite + Vue3 标准目录结构 | 必须 |
| R-V3-PS-02 | R2 | vue3/project-structure.md | src 子目录职责划分 | 必须 |
| R-V3-PS-03 | R3 | vue3/project-structure.md | 路由模块化拆分 | 推荐 |
| R-V3-PS-04 | R4 | vue3/project-structure.md | 环境变量使用 .env 文件 | 必须 |
| R-V3-PS-05 | R5 | vue3/project-structure.md | 组件按用途分组 | 推荐 |
| R-V3-PS-06 | R6 | vue3/project-structure.md | API 模块化管理 | 必须 |
| R-V3-PS-07 | R7 | vue3/project-structure.md | utils 按职责拆分工具函数 | 推荐 |
| R-V3-PS-08 | R8 | vue3/project-structure.md | TypeScript 类型集中管理 | 推荐 |
| R-V3-PS-09 | R9 | vue3/project-structure.md | 静态资源统一管理 | 推荐 |
| R-V3-PS-10 | R10 | vue3/project-structure.md | 使用 @ 别名简化路径引用 | 必须 |
| R-V3-CSS-01 | R1 | vue3/css-standards.md | 组件样式必须使用 scoped | 必须 |
| R-V3-CSS-02 | R2 | vue3/css-standards.md | BEM 命名规范 | 推荐 |
| R-V3-CSS-03 | R3 | vue3/css-standards.md | 使用 CSS 变量管理主题 | 推荐 |
| R-V3-CSS-04 | R4 | vue3/css-standards.md | LESS mixin 复用样式 | 建议 |
| R-V3-CSS-05 | R5 | vue3/css-standards.md | 响应式断点使用 768/992/1200 | 推荐 |
| R-V3-CSS-06 | R6 | vue3/css-standards.md | 使用 :deep() 穿透 scoped 样式 | 推荐 |
| R-V3-CSS-07 | R7 | vue3/css-standards.md | z-index 分层管理 | 推荐 |
| R-V3-CSS-08 | R8 | vue3/css-standards.md | 禁止使用 !important | 必须 |
| R-V3-CSS-09 | R9 | vue3/css-standards.md | 优先使用 Flexbox 和 Grid 布局 | 推荐 |
| R-V3-CSS-10 | R10 | vue3/css-standards.md | CSS 属性声明顺序 | 建议 |

## Vue2

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-V2-CS-01 | R1 | vue2/component-standards.md | 组件属性声明顺序 | 必须 |
| R-V2-CS-02 | R2 | vue2/component-standards.md | props 必须包含 type 和 default | 必须 |
| R-V2-CS-03 | R3 | vue2/component-standards.md | 使用 $emit 声明自定义事件 | 必须 |
| R-V2-CS-04 | R4 | vue2/component-standards.md | v-model 自定义实现规范 | 推荐 |
| R-V2-CS-05 | R5 | vue2/component-standards.md | data 必须是函数 | 必须 |
| R-V2-CS-06 | R6 | vue2/component-standards.md | computed 不应有副作用 | 必须 |
| R-V2-CS-07 | R7 | vue2/component-standards.md | watch 合理使用 immediate 和 deep | 推荐 |
| R-V2-CS-08 | R8 | vue2/component-standards.md | beforeDestroy 中清理资源 | 必须 |
| R-V2-CS-09 | R9 | vue2/component-standards.md | 使用 $refs 代替直接 DOM 操作 | 推荐 |
| R-V2-CS-10 | R10 | vue2/component-standards.md | 避免使用 HTML 保留标签名作为组件名 | 必须 |
| R-V2-SM-01 | R1 | vue2/state-management.md | Store 模块化拆分 | 必须 |
| R-V2-SM-02 | R2 | vue2/state-management.md | State/Mutations/Actions/Getters 职责分明 | 必须 |
| R-V2-SM-03 | R3 | vue2/state-management.md | 异步操作必须放在 Actions 中 | 必须 |
| R-V2-SM-04 | R4 | vue2/state-management.md | 模块必须启用 namespaced | 必须 |
| R-V2-SM-05 | R5 | vue2/state-management.md | 使用 MutationTypes 常量 | 推荐 |
| R-V2-SM-06 | R6 | vue2/state-management.md | 禁止直接修改 State | 必须 |
| R-V2-SM-07 | R7 | vue2/state-management.md | 使用 mapState/mapGetters/mapActions 辅助函数 | 推荐 |
| R-V2-SM-08 | R8 | vue2/state-management.md | 按业务功能拆分模块 | 推荐 |
| R-V2-PS-01 | R1 | vue2/project-structure.md | Vue CLI 标准目录结构 | 必须 |
| R-V2-PS-02 | R2 | vue2/project-structure.md | src 子目录职责划分 | 必须 |
| R-V2-PS-03 | R3 | vue2/project-structure.md | 路由配置规范 | 推荐 |
| R-V2-PS-04 | R4 | vue2/project-structure.md | axios 拦截器封装 | 必须 |
| R-V2-PS-05 | R5 | vue2/project-structure.md | 全局组件注册规范 | 推荐 |
| R-V2-PS-06 | R6 | vue2/project-structure.md | 全局过滤器和指令规范 | 推荐 |
| R-V2-PS-07 | R7 | vue2/project-structure.md | 环境变量使用 VUE_APP_ 前缀 | 必须 |
| R-V2-PS-08 | R8 | vue2/project-structure.md | 别名配置 | 必须 |

## JavaScript

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-JS-BP-01 | R1 | javascript/best-practices.md | 对高频事件使用防抖或节流 | 必须 |
| R-JS-BP-02 | R2 | javascript/best-practices.md | 使用解构赋值设置默认值 | 推荐 |

## TypeScript

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-TS-CS-01 | R1 | typescript/coding-style.md | 函数参数和返回值使用显式类型注解 | 必须 |
| R-TS-CS-02 | R2 | typescript/coding-style.md | 使用 enum 替代魔法数字 | 必须 |
| R-TS-CS-03 | R3 | typescript/coding-style.md | 泛型参数使用有意义的命名 | 推荐 |
| R-TS-TD-01 | R1 | typescript/type-design.md | 使用可辨识联合（Discriminated Union） | 必须 |
| R-TS-TD-02 | R2 | typescript/type-design.md | 使用工具类型（Partial/Required/Pick/Omit） | 推荐 |
| R-TS-TD-03 | R3 | typescript/type-design.md | 使用条件类型 | 推荐 |
| R-TS-TD-04 | R4 | typescript/type-design.md | 编写类型守卫 | 必须 |
| R-TS-TD-05 | R5 | typescript/type-design.md | 使用泛型约束 extends | 必须 |
| R-TS-TD-06 | R6 | typescript/type-design.md | 使用映射类型 | 推荐 |
| R-TS-TD-07 | R7 | typescript/type-design.md | 使用模板字面量类型 | 推荐 |
| R-TS-TD-08 | R8 | typescript/type-design.md | 使用 infer 关键字 | 推荐 |
| R-TS-BP-01 | R1 | typescript/best-practices.md | 启用 strict 模式 | 必须 |
| R-TS-BP-02 | R2 | typescript/best-practices.md | 不使用 any，使用 unknown | 必须 |
| R-TS-BP-03 | R3 | typescript/best-practices.md | 使用 import type 导入类型 | 必须 |
| R-TS-BP-04 | R4 | typescript/best-practices.md | 使用 const enum | 推荐 |
| R-TS-BP-05 | R5 | typescript/best-practices.md | 使用类型收窄 | 必须 |
| R-TS-BP-06 | R6 | typescript/best-practices.md | 使用 satisfies 运算符 | 推荐 |
| R-TS-BP-07 | R7 | typescript/best-practices.md | 避免类型断言，使用类型守卫 | 必须 |
| R-TS-BP-08 | R8 | typescript/best-practices.md | 正确选择 Record 和 Map | 推荐 |

## CSS

| 全局ID | 本地ID | 文件 | 规则标题 | 级别 |
|--------|--------|------|---------|------|
| R-CSS-01 | R1 | css/css-standards.md | 属性声明遵循规范顺序 | 必须 |
| R-CSS-02 | R2 | css/css-standards.md | 使用 CSS 变量管理主题色 | 必须 |
| R-CSS-03 | R3 | css/css-standards.md | 不使用 !important | 必须 |
| R-CSS-04 | R4 | css/css-standards.md | 媒体查询放在规则块最后 | 必须 |
| R-CSS-05 | R5 | css/css-standards.md | 使用 BEM 命名规范 | 必须 |
| R-CSS-06 | R6 | css/css-standards.md | 类名语义化，ID 不用于样式 | 必须 |
| R-CSS-07 | R7 | css/css-standards.md | Less/Sass 嵌套不超过 3 层 | 必须 |
| R-CSS-08 | R8 | css/css-standards.md | 状态类使用 is- 前缀，JS 钩子使用 js- 前缀 | 必须 |

## 场景速查

按常见开发场景快速定位相关规则：

| 场景 | 相关规则 |
|------|---------|
| 写 Controller | R-SB-API-01 ~ R-SB-API-08, R-SB-BP-02, R-SB-BP-03 |
| 写 Service | R-SB-BP-01, R-SB-BP-02, R-JAVA-BP-01 ~ R-JAVA-BP-09 |
| 写 DTO / Entity | R-JAVA-CS-02, R-JAVA-CS-03, R-JAVA-CM-01, R-JAVA-CM-02 |
| 写 Mapper | R-SB-DA-01 ~ R-SB-DA-04 |
| 写 Vue 组件 | R-V3-CS-01 ~ R-V3-CS-12, R-V3-CA-01 ~ R-V3-CA-10 |
| 写 Pinia Store | R-V3-SM-01 ~ R-V3-SM-10 |
| 写 CSS 样式 | R-V3-CSS-01 ~ R-V3-CSS-10, R-CSS-01 ~ R-CSS-08 |
| 配置管理 | R-SB-CFG-01 ~ R-SB-CFG-04 |
| 异常处理 | R-JAVA-BP-01, R-SB-API-04 |
| 创建复杂对象 | R-JAVA-DP-CR-04 |
| 解耦模块 | R-SB-AP-01, R-JAVA-DP-BH-03 |

## 分类码映射

| 分类码 | 目录/文件 | 规则数 |
|--------|----------|--------|
| JAVA-CS | java/coding-style.md | 4 |
| JAVA-BP | java/best-practices.md | 9 |
| JAVA-CM | java/comment-standards.md | 10 |
| JAVA-DP-CR | java/design-patterns-creational.md | 5 |
| JAVA-DP-ST | java/design-patterns-structural.md | 6 |
| JAVA-DP-BH | java/design-patterns-behavioral.md | 6 |
| SB-PS | springboot/project-structure.md | 3 |
| SB-API | springboot/api-design.md | 8 |
| SB-CFG | springboot/config-management.md | 4 |
| SB-DA | springboot/data-access.md | 4 |
| SB-BP | springboot/best-practices.md | 3 |
| SB-AP | springboot/advanced-patterns.md | 5 |
| V3-CS | vue3/component-standards.md | 12 |
| V3-CA | vue3/composition-api.md | 10 |
| V3-TS | vue3/typescript-usage.md | 10 |
| V3-SM | vue3/state-management.md | 10 |
| V3-PS | vue3/project-structure.md | 10 |
| V3-CSS | vue3/css-standards.md | 10 |
| V2-CS | vue2/component-standards.md | 10 |
| V2-SM | vue2/state-management.md | 8 |
| V2-PS | vue2/project-structure.md | 8 |
| JS-BP | javascript/best-practices.md | 2 |
| TS-CS | typescript/coding-style.md | 3 |
| TS-TD | typescript/type-design.md | 8 |
| TS-BP | typescript/best-practices.md | 8 |
| CSS | css/css-standards.md | 8 |
| **合计** | | **184** |
