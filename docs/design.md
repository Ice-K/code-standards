# Code Standards Plugin - 设计文档

> 日期: 2026-04-14
> 状态: 已批准

## 1. 概述

Code Standards 是一个 Claude Code 插件，为 AI 编程助手提供编码规范守卫能力。无论用户使用哪个插件或 skill 触发代码生成，Code Standards 都能确保输出的代码符合预定义的语言/框架规范。

### 1.1 目标

- 覆盖 Java/Spring 全家桶 + Vue 前端生态的编码规范
- 规范来源：业界标准 + 团队定制
- 以 Claude Code 为优先平台，后续扩展至 Cursor、Copilot、Gemini CLI 等
- 先团队内部使用，成熟后开源发布

### 1.2 覆盖范围

| 领域 | 技术 |
|------|------|
| 后端语言 | Java |
| 后端框架 | Spring Boot、Spring Cloud、Spring Cloud Alibaba |
| 前端框架 | Vue 2、Vue 3 |
| 前端语言 | JavaScript、TypeScript |
| 样式 | CSS、LESS |
| 规范维度 | 开发规范、代码注释、最佳实践、架构设计、设计模式 |

## 2. 核心机制

### 2.1 编码宪法（Bootstrap Guard）

通过 `.opencode/plugins/code-standards.js` 引导脚本，在每段对话的首条用户消息中注入 `<CODE_STANDARDS_GUARD>` 守卫协议。此机制不绑定任何特定插件或 skill，只要对话中涉及编码，守卫规则就会生效。

注入内容约 300-400 token，包含：
- 编码前必须执行检测的规则
- 框架检测速查表（文件扩展名/项目配置 → 规范路径映射）
- 团队定制优先级规则
- 代码生成后自动检查规则

### 2.2 自动检测与按需加载

检测策略采用多信号综合判断：

| 信号来源 | 示例 | 可靠度 |
|---------|------|--------|
| 文件扩展名 | `.java` → Java, `.vue` → Vue | 最高 |
| 项目配置文件 | `pom.xml` → Spring Boot, `package.json` 中 `vue` 依赖 | 高 |
| 目录结构 | `src/main/java` → Java Maven 项目 | 高 |
| 文件内容特征 | `@RestController` → Spring Boot, `<template>` → Vue | 中 |
| 上下文关键词 | 提到"微服务" → 可能涉及 Spring Cloud | 低（辅助） |

根据检测结果按需组合加载规范，非全量加载。场景示例：

- 写 Spring Boot Controller → `java/*` + `springboot/api-design.md` + `springboot/best-practices.md`
- 写 Vue3 组件 → `vue3/component-standards.md` + `vue3/composition-api.md` + `css/coding-style.md`
- Spring Cloud 微服务 → `java/*` + `springboot/*` + `springcloud/*` + `springcloud-alibaba/*`

### 2.3 质量关卡（Quality Gate）

每次代码生成后强制执行自动检查：

1. 对照已加载的规范逐条检查刚生成的代码
2. 生成检查报告（PASS / FAIL + 不满足的规则 + 修复方案）
3. 行为分支：
   - 用户需确认模式：展示检查结果，等待确认后继续
   - 用户自动模式：通过则自动继续，不通过则立即按规范修复并重新检查

此机制与任意插件的工作流无缝协作。例如 superpowers 的 executing-plans 在每个 Task 完成后都会经过此关卡。

### 2.4 团队定制

团队定制通过 `standards/team/overrides.md` 叠加实现：
- 不修改源文件，升级插件时不会被覆盖
- 优先级高于所有默认规范
- 不同团队可以有各自的 overrides

## 3. 项目结构

```
code-standards/
├── .claude-plugin/
│   └── plugin.json                     # 插件元数据
│
├── .opencode/plugins/
│   └── code-standards.js               # Bootstrap 注入 + skills 注册
│
├── skills/
│   └── code-standards/
│       ├── SKILL.md                    # 守卫协议（含速查表）
│       └── detection-rules.md          # 检测规则详细说明
│
├── standards/                          # 规范库（~30 个文件）
│   ├── java/
│   │   ├── coding-style.md             # 命名、格式规范
│   │   ├── comment-standards.md        # Javadoc 和代码注释规范
│   │   ├── design-patterns.md          # 常用设计模式及用法
│   │   └── best-practices.md           # 最佳实践（异常处理、并发、IO）
│   ├── springboot/
│   │   ├── project-structure.md        # 项目目录结构约定
│   │   ├── api-design.md               # RESTful API 设计规范
│   │   ├── config-management.md        # 配置管理规范
│   │   ├── data-access.md              # 数据访问层规范（MyBatis/JPA）
│   │   └── best-practices.md           # Spring Boot 最佳实践
│   ├── springcloud/
│   │   ├── microservice-design.md      # 微服务设计规范
│   │   ├── service-discovery.md        # 服务注册与发现
│   │   ├── gateway.md                  # 网关设计规范
│   │   └── config-center.md            # 配置中心规范
│   ├── springcloud-alibaba/
│   │   ├── nacos.md                    # Nacos 使用规范
│   │   ├── sentinel.md                 # Sentinel 限流降级规范
│   │   ├── seata.md                    # Seata 分布式事务规范
│   │   └── dubbo.md                    # Dubbo RPC 规范
│   ├── vue3/
│   │   ├── component-standards.md      # 组件编写规范
│   │   ├── composition-api.md          # Composition API 使用规范
│   │   ├── typescript-usage.md         # TypeScript 使用规范
│   │   ├── state-management.md         # Pinia 状态管理规范
│   │   ├── project-structure.md        # Vue3 项目结构约定
│   │   └── css-standards.md            # CSS/LESS 规范
│   ├── vue2/
│   │   ├── component-standards.md      # Options API 组件规范
│   │   ├── state-management.md         # Vuex 状态管理规范
│   │   └── project-structure.md        # Vue2 项目结构约定
│   ├── javascript/
│   │   ├── coding-style.md             # JS 编码风格
│   │   └── best-practices.md           # JS 最佳实践
│   ├── typescript/
│   │   ├── coding-style.md             # TS 编码风格
│   │   ├── type-design.md              # 类型设计规范
│   │   └── best-practices.md           # TS 最佳实践
│   ├── css/
│   │   ├── coding-style.md             # CSS/Less 编码风格
│   │   └── naming-conventions.md       # CSS 命名规范（BEM 等）
│   └── team/
│       ├── overrides.md                # 团队级全局覆盖
│       └── README.md                   # 说明如何使用团队定制
│
├── commands/
│   ├── apply-standard.md               # /apply-standard <lang>
│   ├── check-code.md                   # /check-code
│   └── list-standards.md               # /list-standards
│
├── package.json
└── README.md
```

## 4. 规范文件结构约定

每个规范 markdown 文件遵循统一模板：

```markdown
# [语言/框架] - [规范主题]

## 适用范围
- 何时应用此规范
- 与其他规范的关系

## 规则

### R1: [规则标题]
**级别**: 必须 / 推荐 / 建议
**描述**: 具体规则内容
**正例**:
` ` `java
// 好的写法
` ` `
**反例**:
` ` `java
// 不好的写法
` ` `
```

设计原则：
- 每条规则必须有正例和反例，AI 模仿代码比理解文字更准确
- 级别标记（必须/推荐/建议）让 AI 知道哪些不可违反
- 每条规则可被 `/check-code` 逐条验证
- 每个文件 10-20 条规则，不超过 200 行

## 5. 斜杠命令

### `/apply-standard <lang> [framework]`
手动强制指定编码规范。用于 AI 未自动检测到的场景。

### `/check-code`
检测当前文件的语言/框架，加载对应规范，逐条检查并给出报告。

### `/list-standards`
扫描 standards/ 目录，展示所有可用规范及简要说明。

## 6. 引导脚本 (`code-standards.js`)

职责：
1. 注册 skills 目录路径到 Claude Code 配置
2. 注入 `<CODE_STANDARDS_GUARD>` 守卫协议到对话首条消息
3. 确保只注入一次，避免重复

## 7. 跨平台扩展计划

| 平台 | 适配方式 | 预估工作量 |
|------|---------|-----------|
| Claude Code | `.opencode/plugins/xxx.js` + skills | 当前版本 |
| Cursor | `.cursor-plugin/` 适配层 | 小 |
| Copilot | GitHub Copilot Chat Extension | 中 |
| Gemini CLI | `GEMINI.md` + `gemini-extension.json` | 小 |
| OpenCode | `.opencode/` 目录天然兼容 | 零 |

核心规范文件（`standards/`）是纯 markdown，所有平台直接复用。

## 8. 数据流

```
用户发起对话
  |
  v
code-standards.js 注入 <CODE_STANDARDS_GUARD> 到首条消息
  |
  v
用户/任意插件/任意 skill 触发代码编写
  |
  v
Claude 读取守卫规则 -> 执行检测（文件扩展名/项目配置/内容特征）
  |
  v
按需加载 standards/ 下对应的规范文件（Read 工具）
  |
  v
按规范正例生成代码
  |
  v
[质量关卡] 自动 check-code
  +-- 通过 -> 等待用户确认 / 自动继续
  +-- 不通过 -> 按规范修复 -> 重新检查
  |
  v
下一步任务（重复上述流程）
```
