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
| `<script setup` | Vue 3 Composition API | `standards/vue3/*` |
| `export default {` (在 .vue 中无 setup) | Vue 2 Options API | 仅手动 `/apply-standard vue2` 时加载 |
| `defineStore` | Pinia | `standards/vue3/state-management.md` |
| `new Vuex.Store` | Vuex | `standards/vue2/state-management.md` |

## Step 2: 项目级检测

当文件级检测不足以确定框架时，检查项目根目录。

### Java 后端检测

| 文件 | 含义 | 操作 |
|------|------|------|
| `pom.xml` 存在 | Maven 项目 | 读取 pom.xml |
| `pom.xml` 含 `spring-boot-starter` | Spring Boot 项目 | 加载 `standards/springboot/*` |
| `build.gradle` 存在 | Gradle 项目 | 检查依赖同上 |
| `src/main/java` 目录存在 | Java 标准目录 | 加载 `standards/java/*` |

### Vue 前端检测

| 信号 | 含义 | 操作 |
|------|------|------|
| `package.json` 中 `vue` 版本 `^3` | Vue 3 | 加载 `standards/vue3/*` |
| `package.json` 中 `vue` 版本 `^2` | Vue 2 | 仅手动 `/apply-standard vue2` 时加载 |
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
| Vue3 SPA | `vue3/*` + `typescript/*` + `css/*` |
| Vue2 SPA | 手动 `/apply-standard vue2` 时加载 `vue2/*` + `javascript/*` + `css/*` |

## Step 4: 优先级

1. `.codestandardsrc.json` 中的 `disabledRules` / `disabledFiles` — 最高
2. `standards/team/overrides.md` — 全局团队覆盖
3. `standards/team/{lang}-overrides.md` — 语言级团队覆盖
4. 对应框架规范（springboot > java）
5. 对应语言基础规范（java / typescript / javascript / css）

## Step 5: Profile 过滤

加载规范文件后，根据 profile 过滤规则级别：

1. 读取项目根目录 `.codestandardsrc.json` 的 `profile` 字段，默认 `recommended`
2. 过滤规则：
   - `core`：仅保留级别为 `必须` 的规则
   - `recommended`：保留 `必须` 和 `推荐`，跳过 `建议`
   - `extended`：保留全部规则
3. 过滤发生在文件加载之后、规则注入之前
4. 被过滤掉的规则不参与质量关卡（P5）检查

## Step 6: 任务上下文分析

在文件选择完成后、实际加载之前，分析用户请求以跳过不相关文件：

1. 提取用户消息中的关键词和意图
2. 对每个候选规范文件，读取其 frontmatter 中的 `skip.keywords`
3. 如果用户消息包含任意一个 skip 关键词，则跳过该文件（不加载）

**判断流程：**
```
候选文件列表 → 读取每个文件的 skip.keywords → 匹配用户消息 → 跳过匹配的文件 → 剩余文件进入加载
```

**特殊情况：**
- 用户使用 `/apply-standard <lang>` 或 `/apply-standard R-XXX-NN` 手动指定时，忽略 skip 规则
- 用户消息包含"重构"、"优化"、"设计模式"时，不跳过任何文件（全量加载）
- 如果规范文件的 `skip.keywords` 为空数组，该文件永不跳过