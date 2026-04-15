---
name: code-standards
description: "编码规范守卫。当 AI 编写、编辑、重构任何代码时必须激活。覆盖 Java、Spring Boot、Vue2、Vue3、JavaScript、TypeScript、CSS、LESS 的编码规范、注释规范、最佳实践、架构设计、设计模式。用户说 '写代码'、'新建文件'、'实现功能'、'重构'、'添加接口'、'创建组件' 或任何涉及代码生成的场景时触发。"
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

**2.1 读取 Profile 配置**

读取项目根目录的 `.codestandardsrc.json`，获取当前 profile 设置。如文件不存在，默认 `recommended`。

| Profile | 加载范围 | 说明 |
|---------|---------|------|
| `core` | 仅 `必须` 级别规则 | 最严格，最小 token 消耗 |
| `recommended` | `必须` + `推荐` 级别规则 | 默认值，平衡质量与成本 |
| `extended` | 全部规则（含 `建议`） | 最全面，最大 token 消耗 |

如 `.codestandardsrc.json` 中指定了 `disabledFiles`，跳过列表中的文件。如指定了 `disabledRules`，跳过对应的全局规则 ID。

**2.2 框架检测速查表**

| 信号 | 必须加载 |
|------|---------|
| `.java` 文件 | `standards/java/coding-style.md` + `standards/java/comment-standards.md` |
| `@SpringBootApplication` / `@RestController` / `@Service` | + `standards/springboot/` 相关文件 |
| `.vue` 文件（Vue 3.x） | `standards/vue3/` 相关文件 |
| `.vue` 文件（Vue 2.x） | `standards/vue2/` 相关文件 |
| `.ts` / `.tsx` 文件 | `standards/typescript/` 相关文件 |
| `.js` 文件 | `standards/javascript/` 相关文件 |
| `.css` / `.less` 文件 | `standards/css/` 相关文件 |

多语言/框架场景（如 Spring Boot + Vue3 前后端）需全部加载并综合应用。

**2.3 Profile 过滤**

加载规范文件后，根据当前 profile 过滤规则：
- 读取每条规则的 `**级别**` 字段
- `core`：只保留 `必须` 规则
- `recommended`：保留 `必须` 和 `推荐` 规则，跳过 `建议`
- `extended`：保留全部规则

**2.4 精确注入（可选）**

如需极致节省 token，可查阅 `skills/code-standards/rule-index.md`，通过全局规则 ID（如 `R-SB-API-01`）精确加载单条规则，而非整个文件。

### P2a: 任务上下文分析（在 P2 检测之后，加载之前）

分析用户请求的任务类型，根据规范文件的 `skip.keywords` 元数据跳过不相关文件：

1. 提取用户消息中的关键词
2. 对每个候选规范文件，检查其 frontmatter 中的 `skip.keywords`
3. 如果用户消息中包含任意一个 skip 关键词，则跳过该文件

**任务类型速查表：**

| 用户意图 | 典型关键词 | 通常跳过的规范 |
|---------|-----------|--------------|
| CRUD / 业务接口 | 增删改查, 列表, 表单, Controller, Service | design-patterns-\*, advanced-patterns |
| 配置管理 | 配置, yml, properties, 环境变量 | api-design, data-access, component-standards |
| 数据库操作 | SQL, Mapper, 表结构, 数据库 | component-standards, css-standards, state-management |
| 前端组件 | 组件, 页面, UI, CSS, 样式 | data-access, config-management |
| 重构 / 优化 | 重构, 优化, 提取, 设计模式 | **不跳过任何文件**（全量加载） |

**例外**：如果用户明确要求"加载全部规范"或使用 `/apply-standard` 指定了框架名，则忽略 skip 规则。

### P3: 团队定制优先（分层覆盖）

按以下顺序检查覆盖，后加载的覆盖优先级更高：

1. 检查 `standards/team/{lang}-overrides.md`（语言级覆盖）
   - Java 任务 → `standards/team/java-overrides.md`
   - Spring Boot 任务 → `standards/team/springboot-overrides.md`
   - Vue 任务 → `standards/team/vue-overrides.md`
   - TypeScript 任务 → `standards/team/typescript-overrides.md`
2. 检查 `standards/team/overrides.md`（全局覆盖）
3. 检查 `.codestandardsrc.json` 中的 `disabledRules` 和 `disabledFiles`

如有冲突，优先级：`.codestandardsrc.json` > `team/overrides.md` > `team/{lang}-overrides.md` > 默认规范

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