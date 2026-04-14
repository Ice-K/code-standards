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