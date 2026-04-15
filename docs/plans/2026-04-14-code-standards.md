# Code Standards Plugin 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Claude Code 插件，为 AI 编程助手提供编码规范守卫能力，覆盖 Java/Spring 全家桶 + Vue 前端生态。

**Architecture:** Bootstrap 注入守卫协议到每段对话，AI 自动检测语言/框架后按需加载规范文件，每次代码生成后自动执行质量关卡检查。

**Tech Stack:** JavaScript (ES Module) + Markdown 规范库

---

## 文件清单

| 文件 | 职责 |
|------|------|
| `.claude-plugin/plugin.json` | 插件元数据 |
| `package.json` | NPM 包配置 |
| `.opencode/plugins/code-standards.js` | Bootstrap 注入 + skills 注册 |
| `skills/code-standards/SKILL.md` | 守卫协议（含速查表 + 质量关卡规则） |
| `skills/code-standards/detection-rules.md` | 检测规则详细说明 |
| `standards/java/coding-style.md` | Java 命名、格式规范 |
| `standards/java/comment-standards.md` | Java 注释规范 |
| `standards/java/design-patterns.md` | Java 设计模式 |
| `standards/java/best-practices.md` | Java 最佳实践 |
| `standards/springboot/project-structure.md` | Spring Boot 项目结构 |
| `standards/springboot/api-design.md` | RESTful API 设计规范 |
| `standards/springboot/config-management.md` | 配置管理规范 |
| `standards/springboot/data-access.md` | 数据访问层规范 |
| `standards/springboot/best-practices.md` | Spring Boot 最佳实践 |
| `standards/springcloud/microservice-design.md` | 微服务设计规范 |
| `standards/springcloud/service-discovery.md` | 服务注册与发现 |
| `standards/springcloud/gateway.md` | 网关设计规范 |
| `standards/springcloud/config-center.md` | 配置中心规范 |
| `standards/springcloud-alibaba/nacos.md` | Nacos 规范 |
| `standards/springcloud-alibaba/sentinel.md` | Sentinel 规范 |
| `standards/springcloud-alibaba/seata.md` | Seata 规范 |
| `standards/springcloud-alibaba/dubbo.md` | Dubbo 规范 |
| `standards/vue3/component-standards.md` | Vue3 组件规范 |
| `standards/vue3/composition-api.md` | Composition API 规范 |
| `standards/vue3/typescript-usage.md` | TypeScript 使用规范 |
| `standards/vue3/state-management.md` | Pinia 状态管理规范 |
| `standards/vue3/project-structure.md` | Vue3 项目结构 |
| `standards/vue3/css-standards.md` | CSS/LESS 规范 |
| `standards/vue2/component-standards.md` | Vue2 组件规范 |
| `standards/vue2/state-management.md` | Vuex 状态管理规范 |
| `standards/vue2/project-structure.md` | Vue2 项目结构 |
| `standards/javascript/coding-style.md` | JS 编码风格 |
| `standards/javascript/best-practices.md` | JS 最佳实践 |
| `standards/typescript/coding-style.md` | TS 编码风格 |
| `standards/typescript/type-design.md` | 类型设计规范 |
| `standards/typescript/best-practices.md` | TS 最佳实践 |
| `standards/css/coding-style.md` | CSS/Less 编码风格 |
| `standards/css/naming-conventions.md` | CSS 命名规范 |
| `standards/team/overrides.md` | 团队定制覆盖 |
| `standards/team/README.md` | 团队定制说明 |
| `commands/apply-standard.md` | /apply-standard 命令 |
| `commands/check-code.md` | /check-code 命令 |
| `commands/list-standards.md` | /list-standards 命令 |
| `README.md` | 项目说明文档 |

---

## Phase 1: 基础骨架

### Task 1: 项目脚手架

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `package.json`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p .claude-plugin
mkdir -p .opencode/plugins
mkdir -p skills/code-standards
mkdir -p standards/java standards/springboot standards/springcloud standards/springcloud-alibaba
mkdir -p standards/vue3 standards/vue2 standards/javascript standards/typescript standards/css
mkdir -p standards/team
mkdir -p commands
```

- [ ] **Step 2: 创建 plugin.json**

```json
{
  "name": "code-standards",
  "description": "编码规范守卫插件 - 为 AI 编程助手提供 Java/Spring/Vue 等语言的编码规范，确保生成的代码符合业界标准和团队约定",
  "version": "0.1.0",
  "author": {
    "name": "super-every-code"
  },
  "homepage": "https://github.com/user/code-standards",
  "license": "MIT",
  "keywords": [
    "coding-standards",
    "java",
    "springboot",
    "springcloud",
    "vue",
    "code-review",
    "best-practices"
  ]
}
```

- [ ] **Step 3: 创建 package.json**

```json
{
  "name": "code-standards",
  "version": "0.1.0",
  "type": "module",
  "main": ".opencode/plugins/code-standards.js"
}
```

- [ ] **Step 4: 初始化 git 并提交**

```bash
git init
git add .claude-plugin/plugin.json package.json
git commit -m "chore: init project scaffold"
```

---

### Task 2: Bootstrap 引导脚本

**Files:**
- Create: `.opencode/plugins/code-standards.js`

- [ ] **Step 1: 编写引导脚本**

```javascript
/**
 * Code Standards Plugin for Claude Code
 *
 * 注入编码规范守卫到每段对话，确保 AI 编写代码时遵循规范。
 * 自动注册 skills 目录，无需手动配置。
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return content;
  return match[2];
};

const getGuardContent = () => {
  const skillPath = path.resolve(__dirname, '../../skills/code-standards/SKILL.md');
  if (!fs.existsSync(skillPath)) return null;

  const fullContent = fs.readFileSync(skillPath, 'utf8');
  const body = extractFrontmatter(fullContent);

  return `<CODE_STANDARDS_GUARD>
${body}
</CODE_STANDARDS_GUARD>`;
};

export const CodeStandardsPlugin = async ({ client, directory }) => {
  const skillsDir = path.resolve(__dirname, '../../skills');

  return {
    // 注册 skills 目录
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    // 注入守卫到首条用户消息
    'experimental.chat.messages.transform': async (_input, output) => {
      const guard = getGuardContent();
      if (!guard || !output.messages.length) return;

      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // 防止重复注入
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('CODE_STANDARDS_GUARD'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: guard });
    }
  };
};
```

- [ ] **Step 2: 提交**

```bash
git add .opencode/plugins/code-standards.js
git commit -m "feat: add bootstrap script with guard injection"
```

---

### Task 3: 核心 SKILL.md 守卫协议

**Files:**
- Create: `skills/code-standards/SKILL.md`
- Create: `skills/code-standards/detection-rules.md`

- [ ] **Step 1: 编写 SKILL.md**

```markdown
---
name: code-standards
description: "编码规范守卫。当 AI 编写、编辑、重构任何代码时必须激活。覆盖 Java、Spring Boot、Spring Cloud、Spring Cloud Alibaba、Vue2、Vue3、JavaScript、TypeScript、CSS、LESS 的编码规范、注释规范、最佳实践、架构设计、设计模式。用户说 '写代码'、'新建文件'、'实现功能'、'重构'、'添加接口'、'创建组件' 或任何涉及代码生成的场景时触发。"
version: 0.1.0
---

# 编码规范守卫

你受编码规范守卫约束。无论当前由哪个插件、skill 或流程触发，只要涉及代码编写、编辑、重构，必须遵守以下协议。

## 协议

### P1: 编码前必须检测

在生成任何代码之前，先执行语言/框架检测：

1. 读取目标文件路径，判断语言（扩展名映射见下方速查表）
2. 如需确认框架，检查项目根目录的配置文件（pom.xml / package.json / build.gradle 等）
3. 详细检测规则见 `detection-rules.md`

### P2: 按需加载规范

根据检测结果，使用 Read 工具加载 `standards/` 下对应的规范文件：

**框架检测速查表：**

| 信号 | 必须加载 |
|------|---------|
| `.java` 文件 | `standards/java/coding-style.md` + `standards/java/comment-standards.md` |
| `@SpringBootApplication` / `@RestController` / `@Service` | + `standards/springboot/` 相关文件 |
| `spring-cloud` 依赖 | + `standards/springcloud/` 相关文件 |
| `nacos` / `sentinel` / `seata` 依赖 | + `standards/springcloud-alibaba/` 相关文件 |
| `.vue` 文件（Vue 3.x） | `standards/vue3/` 相关文件 |
| `.vue` 文件（Vue 2.x） | `standards/vue2/` 相关文件 |
| `.ts` / `.tsx` 文件 | `standards/typescript/` 相关文件 |
| `.js` 文件 | `standards/javascript/` 相关文件 |
| `.css` / `.less` 文件 | `standards/css/` 相关文件 |

多语言/框架场景（如 Spring Boot + Vue3 前后端）需全部加载并综合应用。

### P3: 团队定制优先

始终检查 `standards/team/overrides.md`。团队定制的优先级高于所有默认规范。如有冲突，以团队定制为准。

### P4: 按规范生成代码

- 命名规范、注释风格、代码结构必须符合已加载的规范
- 规范中的正例（good example）是生成代码的参照标准
- 每个类/组件/接口都要有符合规范的注释

### P5: 质量关卡（强制）

每次生成、编辑、重构代码后，必须立即执行检查：

1. 对照已加载的规范逐条检查刚生成的代码
2. 生成检查报告，格式：
   ```
   [规范检查] 文件: xxx.java
   - R1 类命名: PASS
   - R2 方法命名: PASS
   - R3 Javadoc 注释: FAIL - 缺少 @since 字段
   ```
3. 行为分支：
   - **用户需确认模式**：展示检查结果，等待用户确认后再继续下一步
   - **用户自动模式**：通过则自动继续；不通过则立即按规范修复，修复后重新检查，直到全部通过

未通过检查的代码不得提交或进入下一步。
```

- [ ] **Step 2: 编写 detection-rules.md**

```markdown
# 语言/框架自动检测规则

## Step 1: 文件级检测

检查当前正在编辑或创建的文件。

### 扩展名映射

| 扩展名 | 语言/框架 | 加载规范 |
|--------|----------|---------|
| `.java` | Java | `standards/java/*` |
| `.vue` | Vue | 需进一步判断版本（见 Step 2） |
| `.ts` / `.tsx` | TypeScript | `standards/typescript/*` |
| `.js` / `.jsx` | JavaScript | `standards/javascript/*` |
| `.css` | CSS | `standards/css/*` |
| `.less` | LESS | `standards/css/*` |

### 内容特征检测

文件内容中包含以下特征时，额外加载对应规范：

| 特征 | 框架 | 额外加载 |
|------|------|---------|
| `@RestController` / `@Controller` / `@Service` / `@Repository` | Spring Boot | `standards/springboot/*` |
| `@FeignClient` / `@EnableDiscoveryClient` | Spring Cloud | `standards/springcloud/*` |
| `@SentinelResource` / `@GlobalTransactional` | Spring Cloud Alibaba | `standards/springcloud-alibaba/*` |
| `<script setup` | Vue 3 Composition API | `standards/vue3/*` |
| `export default {` (在 .vue 中无 setup) | Vue 2 Options API | `standards/vue2/*` |
| `defineStore` | Pinia | `standards/vue3/state-management.md` |
| `new Vuex.Store` | Vuex | `standards/vue2/state-management.md` |

## Step 2: 项目级检测

当文件级检测不足以确定框架时，检查项目根目录。

### Java 后端检测

| 文件 | 含义 | 操作 |
|------|------|------|
| `pom.xml` 存在 | Maven 项目 | 读取 pom.xml |
| `pom.xml` 含 `spring-boot-starter` | Spring Boot 项目 | 加载 `standards/springboot/*` |
| `pom.xml` 含 `spring-cloud` | Spring Cloud | 加载 `standards/springcloud/*` |
| `pom.xml` 含 `nacos` / `sentinel` / `seata` | Spring Cloud Alibaba | 加载 `standards/springcloud-alibaba/*` |
| `build.gradle` 存在 | Gradle 项目 | 检查依赖同上 |
| `src/main/java` 目录存在 | Java 标准目录 | 加载 `standards/java/*` |

### Vue 前端检测

| 信号 | 含义 | 操作 |
|------|------|------|
| `package.json` 中 `vue` 版本 `^3` | Vue 3 | 加载 `standards/vue3/*` |
| `package.json` 中 `vue` 版本 `^2` | Vue 2 | 加载 `standards/vue2/*` |
| `vite.config.ts` 存在 | Vite 构建 | 配合 Vue3 |
| `vue.config.js` 存在 | Vue CLI 构建 | 配合 Vue2 |
| `nuxt.config.ts` 存在 | Nuxt 3 | 配合 Vue3 |
| `nuxt.config.js` 存在 | Nuxt 2 | 配合 Vue2 |

## Step 3: 组合推导

实际项目通常是多框架组合，需综合加载：

| 场景 | 加载组合 |
|------|---------|
| Spring Boot 单体 | `java/*` + `springboot/*` |
| Spring Boot + Vue3 前后端分离 | `java/*` + `springboot/*` + `vue3/*` + `typescript/*` + `css/*` |
| Spring Cloud 微服务 | `java/*` + `springboot/*` + `springcloud/*` |
| Spring Cloud Alibaba | `java/*` + `springboot/*` + `springcloud/*` + `springcloud-alibaba/*` |
| Vue3 SPA | `vue3/*` + `typescript/*` + `css/*` |
| Vue2 SPA | `vue2/*` + `javascript/*` + `css/*` |

## Step 4: 优先级

1. `standards/team/overrides.md` — 最高
2. 对应框架规范（springcloud > springboot > java）
3. 对应语言基础规范（java / typescript / javascript / css）
```

- [ ] **Step 3: 提交**

```bash
git add skills/code-standards/
git commit -m "feat: add core SKILL.md with guard protocol and detection rules"
```

---

## Phase 2: Java 生态规范

### Task 4: Java 基础规范

**Files:**
- Create: `standards/java/coding-style.md`
- Create: `standards/java/comment-standards.md`
- Create: `standards/java/design-patterns.md`
- Create: `standards/java/best-practices.md`

- [ ] **Step 1: 编写 coding-style.md**

参考阿里巴巴 Java 开发手册，覆盖命名、格式、OOP 规约，每条规则含正例/反例。约 15-20 条规则。

核心规则包括：
- 类名 UpperCamelCase，方法名 lowerCamelCase
- 常量全大写下划线分隔
- 包名全小写
- POJO 类使用包装类型
- 方法参数不超过 5 个
- 单个方法行数不超过 80 行
- if/else/for/while/do 后必须使用大括号
- 缩进使用 4 个空格

- [ ] **Step 2: 编写 comment-standards.md**

覆盖类注释、方法注释、字段注释、行内注释规范。每条含 Javadoc 正例/反例。约 10-15 条规则。

核心规则包括：
- 所有 public 类必须有 Javadoc（@author @since @description）
- 所有 public 方法必须有 Javadoc（@param @return @throws）
- 注释应描述 why 而非 what
- TODO 注释必须带作者和日期
- 不使用行尾注释

- [ ] **Step 3: 编写 design-patterns.md**

覆盖 Java 常用设计模式的使用场景和代码模板。约 10 条规则。

核心规则包括：
- 单例模式：推荐使用枚举实现
- 工厂模式：Service 层使用工厂方法创建复杂对象
- 策略模式：消除过长的 if-else
- 建造者模式：多参数对象构建
- 模板方法模式：流程标准化
- 每个模式含 Spring Boot 集成正例

- [ ] **Step 4: 编写 best-practices.md**

覆盖异常处理、并发、集合、字符串、IO 等最佳实践。约 15 条规则。

核心规则包括：
- 不要捕获 Exception 基类，捕获具体异常
- 使用 try-with-resources
- 集合判空使用 CollectionUtils.isEmpty
- 字符串拼接使用 StringBuilder
- 线程池不使用 Executors.newFixedThreadPool
- 日期使用 LocalDateTime 而非 Date

- [ ] **Step 5: 提交**

```bash
git add standards/java/
git commit -m "feat: add Java coding standards"
```

---

### Task 5: Spring Boot 规范

**Files:**
- Create: `standards/springboot/project-structure.md`
- Create: `standards/springboot/api-design.md`
- Create: `standards/springboot/config-management.md`
- Create: `standards/springboot/data-access.md`
- Create: `standards/springboot/best-practices.md`

- [ ] **Step 1: 编写 project-structure.md**

约 10 条规则。核心规则：
- 标准 Maven/Gradle 目录结构
- 分层架构：controller / service / dao / model / config / util
- 包命名约定：com.{company}.{project}.{layer}
- 配置文件分层：application.yml / application-{profile}.yml
- 每条含目录结构正例

- [ ] **Step 2: 编写 api-design.md**

约 15 条规则。核心规则：
- RESTful URL 设计（名词复数、层级关系）
- 统一返回体 Result<T> 包装
- HTTP 方法语义（GET 查询 / POST 新增 / PUT 修改 / DELETE 删除）
- 参数校验使用 @Valid + JSR303
- 全局异常处理 @RestControllerAdvice
- 分页接口规范
- 接口版本管理
- 每条含 Controller 代码正例/反例

- [ ] **Step 3: 编写 config-management.md**

约 10 条规则。核心规则：
- 使用 YAML 而非 properties
- 自定义配置使用 @ConfigurationProperties 而非 @Value
- 配置项分组管理
- 敏感配置使用环境变量或加密
- 多环境配置管理

- [ ] **Step 4: 编写 data-access.md**

约 12 条规则。核心规则：
- Entity 与 DTO 分离
- MyBatis-Plus 使用规范
- JPA 使用规范
- 通用 Mapper / Service 封装
- 事务注解 @Transactional 使用场景
- 批量操作规范
- 每条含代码正例

- [ ] **Step 5: 编写 best-practices.md**

约 12 条规则。核心规则：
- 依赖注入使用构造器注入（@RequiredArgsConstructor）
- 避免在 Controller 写业务逻辑
- 使用 Spring 事件解耦
- 异步处理使用 @Async
- 缓存使用 @Cacheable 及注意事项
- 日志规范（SLF4J + Logback）

- [ ] **Step 6: 提交**

```bash
git add standards/springboot/
git commit -m "feat: add Spring Boot standards"
```

---

### Task 6: Spring Cloud 规范

**Files:**
- Create: `standards/springcloud/microservice-design.md`
- Create: `standards/springcloud/service-discovery.md`
- Create: `standards/springcloud/gateway.md`
- Create: `standards/springcloud/config-center.md`

- [ ] **Step 1: 编写 microservice-design.md**

约 10 条规则。核心规则：
- 微服务拆分原则（按业务域、DDD 限界上下文）
- 服务间通信方式选择（Feign vs RestTemplate vs MQ）
- 服务粒度控制
- API 网关统一入口
- 分布式链路追踪
- 每条含架构图描述和代码正例

- [ ] **Step 2: 编写 service-discovery.md**

约 8 条规则。核心规则：
- 服务注册与发现配置
- 心跳检测与健康检查
- 负载均衡策略
- 服务下线优雅处理

- [ ] **Step 3: 编写 gateway.md**

约 10 条规则。核心规则：
- Gateway 路由配置规范
- 全局过滤器 vs 局部过滤器
- 限流熔断集成
- 统一鉴权
- 跨域配置

- [ ] **Step 4: 编写 config-center.md**

约 8 条规则。核心规则：
- 配置中心选型（Nacos Config / Spring Cloud Config）
- 配置文件命名空间与分组
- 配置热更新
- 配置版本管理

- [ ] **Step 5: 提交**

```bash
git add standards/springcloud/
git commit -m "feat: add Spring Cloud standards"
```

---

### Task 7: Spring Cloud Alibaba 规范

**Files:**
- Create: `standards/springcloud-alibaba/nacos.md`
- Create: `standards/springcloud-alibaba/sentinel.md`
- Create: `standards/springcloud-alibaba/seata.md`
- Create: `standards/springcloud-alibaba/dubbo.md`

- [ ] **Step 1: 编写 nacos.md**

约 10 条规则。核心规则：
- Nacos 注册中心配置规范
- Nacos 配置中心使用规范（namespace / group / dataId）
- 配置热更新最佳实践
- 服务分组与集群规划
- 每条含 YAML 配置正例

- [ ] **Step 2: 编写 sentinel.md**

约 10 条规则。核心规则：
- 流控规则配置
- 降级规则配置
- 热点参数限流
- 系统保护规则
- @SentinelResource 注解使用规范
- Dashboard 规则持久化
- 每条含代码和配置正例

- [ ] **Step 3: 编写 seata.md**

约 8 条规则。核心规则：
- AT 模式使用场景与配置
- TCC 模式使用场景
- @GlobalTransactional 使用规范
- 全局锁与本地锁
- 每条含代码正例

- [ ] **Step 4: 编写 dubbo.md**

约 8 条规则。核心规则：
- Dubbo 协议选择
- 服务暴露与引用规范
- 超时与重试配置
- 负载均衡策略
- 服务降级与熔断
- 每条含代码正例

- [ ] **Step 5: 提交**

```bash
git add standards/springcloud-alibaba/
git commit -m "feat: add Spring Cloud Alibaba standards"
```

---

## Phase 3: 前端生态规范

### Task 8: Vue3 规范

**Files:**
- Create: `standards/vue3/component-standards.md`
- Create: `standards/vue3/composition-api.md`
- Create: `standards/vue3/typescript-usage.md`
- Create: `standards/vue3/state-management.md`
- Create: `standards/vue3/project-structure.md`
- Create: `standards/vue3/css-standards.md`

- [ ] **Step 1: 编写 component-standards.md**

约 12 条规则。核心规则：
- 组件文件 PascalCase 命名
- 统一使用 `<script setup lang="ts">`
- Props 使用 defineProps + TypeScript 接口
- Events 使用 defineEmits + TypeScript 泛型
- 组件目录结构（组件 / 类型 / 样式 / 测试）
- 每条含 SFC 代码正例/反例

- [ ] **Step 2: 编写 composition-api.md**

约 10 条规则。核心规则：
- ref vs reactive 使用场景
- computed 缓存特性使用
- watch vs watchEffect 选择
- 生命周期钩子使用规范
- 组合函数（composables）编写规范
- 每条含代码正例

- [ ] **Step 3: 编写 typescript-usage.md**

约 10 条规则。核心规则：
- 类型定义使用 interface 优先于 type
- API 响应类型定义规范
- 泛型使用规范
- 枚举 vs 常量对象选择
- 类型守卫（type guard）编写
- 严格模式配置

- [ ] **Step 4: 编写 state-management.md**

约 10 条规则。核心规则：
- Pinia store 定义规范（Setup Store 风格）
- Store 命名约定（useXxxStore）
- State / Getters / Actions 划分
- 异步 Action 处理
- Store 组合使用
- 每条含代码正例

- [ ] **Step 5: 编写 project-structure.md**

约 10 条规则。核心规则：
- Vite + Vue3 标准目录结构
- src 下目录划分（views / components / composables / stores / api / utils / types / assets）
- 路由文件组织
- 环境变量管理
- 每条含目录结构正例

- [ ] **Step 6: 编写 css-standards.md**

约 10 条规则。核心规则：
- Scoped 样式使用规范
- BEM 命名约定
- CSS 变量使用
- Less mixin 和函数规范
- 响应式断点规范
- 深度选择器 :deep() 使用

- [ ] **Step 7: 提交**

```bash
git add standards/vue3/
git commit -m "feat: add Vue3 standards"
```

---

### Task 9: Vue2 规范

**Files:**
- Create: `standards/vue2/component-standards.md`
- Create: `standards/vue2/state-management.md`
- Create: `standards/vue2/project-structure.md`

- [ ] **Step 1: 编写 component-standards.md**

约 10 条规则。核心规则：
- Options API 组件结构顺序（name > props > data > computed > watch > methods > lifecycle）
- Props 定义必须含 type 和 default
- $emit 事件声明
- v-model 自定义组件实现
- 每条含代码正例

- [ ] **Step 2: 编写 state-management.md**

约 8 条规则。核心规则：
- Vuex Store 模块化拆分
- State / Mutations / Actions / Getters 职责
- 异步操作放在 Actions
- 命名空间模块
- 每条含代码正例

- [ ] **Step 3: 编写 project-structure.md**

约 8 条规则。核心规则：
- Vue CLI 标准目录结构
- 分层约定
- 路由组织
- API 层封装

- [ ] **Step 4: 提交**

```bash
git add standards/vue2/
git commit -m "feat: add Vue2 standards"
```

---

### Task 10: JavaScript & TypeScript 规范

**Files:**
- Create: `standards/javascript/coding-style.md`
- Create: `standards/javascript/best-practices.md`
- Create: `standards/typescript/coding-style.md`
- Create: `standards/typescript/type-design.md`
- Create: `standards/typescript/best-practices.md`

- [ ] **Step 1: 编写 javascript/coding-style.md**

约 10 条规则。核心规则：
- 使用 const/let，不用 var
- 字符串使用单引号
- 使用模板字符串拼接
- 使用箭头函数
- 对象属性简写
- 每条含代码正例/反例

- [ ] **Step 2: 编写 javascript/best-practices.md**

约 10 条规则。核心规则：
- 使用可选链 ?. 和空值合并 ??
- 数组方法（map/filter/reduce）优先于 for 循环
- 异步操作使用 async/await
- 解构赋值
- 防抖和节流

- [ ] **Step 3: 编写 typescript/coding-style.md**

约 10 条规则。核心规则：
- 显式类型注解（函数参数和返回值）
- interface 优先于 type
- 使用 enum 替代魔法数字
- 泛型命名约定
- 每条含代码正例

- [ ] **Step 4: 编写 typescript/type-design.md**

约 8 条规则。核心规则：
- 使用区分联合（discriminated union）
- 工具类型使用（Partial / Required / Pick / Omit）
- 条件类型
- 类型守卫编写
- 每条含代码正例

- [ ] **Step 5: 编写 typescript/best-practices.md**

约 8 条规则。核心规则：
- strict 模式开启
- 不使用 any，使用 unknown
- 类型导入使用 import type
- 枚举使用 const enum
- 命名空间和模块

- [ ] **Step 6: 提交**

```bash
git add standards/javascript/ standards/typescript/
git commit -m "feat: add JavaScript and TypeScript standards"
```

---

### Task 11: CSS 规范

**Files:**
- Create: `standards/css/coding-style.md`
- Create: `standards/css/naming-conventions.md`

- [ ] **Step 1: 编写 coding-style.md**

约 8 条规则。核心规则：
- 使用 2 空格缩进
- 属性声明顺序（定位 > 盒模型 > 排版 > 视觉 > 动画）
- 使用 CSS 变量管理主题色
- 避免使用 !important
- 媒体查询位置
- 每条含代码正例

- [ ] **Step 2: 编写 naming-conventions.md**

约 8 条规则。核心规则：
- BEM 命名规范（.block__element--modifier）
- ID 不用于样式
- 类名语义化（避免 .red、.mt-10）
- Less 嵌套层级不超过 3 层
- 每条含代码正例

- [ ] **Step 3: 提交**

```bash
git add standards/css/
git commit -m "feat: add CSS standards"
```

---

## Phase 4: Commands & 团队定制

### Task 12: 斜杠命令

**Files:**
- Create: `commands/apply-standard.md`
- Create: `commands/check-code.md`
- Create: `commands/list-standards.md`

- [ ] **Step 1: 编写 apply-standard.md**

```markdown
---
description: 手动指定编码规范并应用到后续代码生成
argument-hint: <lang> [framework]
allowed-tools: [Read, Glob, Grep]
---

# Apply Standard

用户手动指定编码规范。参数: $ARGUMENTS

## 指令

1. 解析参数，确定语言和框架
   - 可选值: java, springboot, springcloud, springcloud-alibaba, vue3, vue2, javascript, typescript, css
   - 多个值用空格分隔，如 `/apply-standard java springboot`

2. 使用 Read 工具加载对应的 standards/ 下的所有规范文件

3. 同时检查 standards/team/overrides.md

4. 向用户确认已加载的规范列表

## 后续行为

从此刻起，本对话中的所有代码生成都必须遵守已加载的规范。
```

- [ ] **Step 2: 编写 check-code.md**

```markdown
---
description: 检查当前代码是否符合编码规范
allowed-tools: [Read, Glob, Grep, Bash]
---

# Check Code

对当前文件执行编码规范检查。

## 指令

1. 检测当前正在编辑的文件的语言和框架
2. 加载对应的 standards/ 规范文件
3. 逐条检查规范中的每条规则
4. 输出检查报告：

```
[规范检查报告] 文件: {文件名}
检测到的语言/框架: {检测结果}
加载的规范: {规范文件列表}

检查结果:
- R{N}: {规则名称} - {PASS / FAIL}
  {如有 FAIL，说明原因和修复建议}

总结: {通过数}/{总数} 条规则通过
```

5. 如有不通过的规则，自动按规范修复并重新检查
```

- [ ] **Step 3: 编写 list-standards.md**

```markdown
---
description: 列出所有可用的编码规范
allowed-tools: [Read, Glob]
---

# List Standards

展示所有可用的编码规范。

## 指令

1. 使用 Glob 扫描 `standards/` 目录下所有 `.md` 文件
2. 读取每个文件的标题行（第一行 # 标题）
3. 按分类展示：

```
可用编码规范:

Java (4)
  - coding-style.md — 命名、格式规范
  - comment-standards.md — 注释规范
  - design-patterns.md — 设计模式
  - best-practices.md — 最佳实践

Spring Boot (5)
  - ...

团队定制 (1)
  - overrides.md — 团队全局覆盖

使用 /apply-standard <lang> 加载指定规范
```
```

- [ ] **Step 4: 提交**

```bash
git add commands/
git commit -m "feat: add slash commands"
```

---

### Task 13: 团队定制机制

**Files:**
- Create: `standards/team/overrides.md`
- Create: `standards/team/README.md`

- [ ] **Step 1: 编写 overrides.md**

```markdown
# 团队定制规范

> 此文件优先级高于所有默认规范。当此文件中的规则与默认规范冲突时，以此文件为准。

## 全局规则

（在此添加团队全局适用的规则）

## Java 覆盖

（在此添加覆盖 Java 默认规范的条目）

## Spring Boot 覆盖

（在此添加覆盖 Spring Boot 默认规范的条目）

## Vue 覆盖

（在此添加覆盖 Vue 默认规范的条目）
```

- [ ] **Step 2: 编写 README.md**

```markdown
# 团队定制说明

## 如何使用

编辑 `overrides.md` 文件，添加你们团队的定制规则。

## 优先级

`overrides.md` 中的规则优先级高于所有默认规范。

## 建议格式

```markdown
## [语言/框架] 覆盖

### 覆盖 R{N}: {原始规则标题}
**原始规则**: {简述原始规则内容}
**团队定制**: {你们团队的规则}
**原因**: {为什么需要定制}
```

## 注意事项

- 升级插件时此文件不会被覆盖
- 不同团队/项目可以有各自的 overrides.md
- 建议将此文件纳入版本控制
```

- [ ] **Step 3: 提交**

```bash
git add standards/team/
git commit -m "feat: add team customization mechanism"
```

---

## Phase 5: 文档与验证

### Task 14: 项目 README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 编写 README.md**

内容包含：
- 插件简介和功能概述
- 安装方式
- 支持的语言/框架列表
- 使用方式（自动模式 + 手动命令）
- 团队定制说明
- 规范文件结构说明
- 跨平台支持计划

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add project README"
```

---

### Task 15: 集成验证

- [ ] **Step 1: 验证目录完整性**

```bash
find . -name "*.md" -o -name "*.json" -o -name "*.js" | sort
```

确认所有设计文档中列出的文件都已创建。

- [ ] **Step 2: 验证 plugin.json 有效性**

```bash
cat .claude-plugin/plugin.json | python -m json.tool
```

- [ ] **Step 3: 验证引导脚本语法**

```bash
node --check .opencode/plugins/code-standards.js
```

- [ ] **Step 4: 手动安装测试**

将插件安装到 Claude Code，发起一段包含代码生成的对话，观察：
- 守卫协议是否被注入
- 语言检测是否正确
- 规范是否被加载
- 质量关卡是否执行

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "chore: complete code-standards plugin v0.1.0"
```
