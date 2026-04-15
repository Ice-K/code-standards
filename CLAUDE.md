# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Code Standards Plugin — 一个 Claude Code 编码规范守卫插件。核心功能是检测用户正在编写的代码语言/框架，按需加载对应规范文件，确保 AI 生成的代码符合编码标准。

技术栈：纯 JavaScript (ES Module) + Markdown 规范库，无构建工具、无测试框架、无运行时依赖。

## 架构

三层架构，数据流从上到下：

1. **Bootstrap 层** (`.opencode/plugins/code-standards.js`) — OpenCode 引导脚本。注册 skills 目录路径，将 `skills/code-standards/SKILL.md` 内容以 `<CODE_STANDARDS_GUARD>` 标签注入到对话首条用户消息中。包含防重复注入机制。
2. **Skill 层** (`skills/code-standards/`) — `SKILL.md` 定义守卫协议（P1-P5：检测→加载→团队优先→生成→质量关卡），`detection-rules.md` 定义多信号检测策略（扩展名→内容特征→项目配置→组合推导）。
3. **Standards 层** (`standards/`) — 纯 Markdown 规范文件库。每个文件遵循统一模板：规则编号 R1/R2/...、级别（必须/推荐/建议）、正例/反例代码。

**检测与加载机制**：扩展名映射（如 `.java` → Java）→ 项目配置检测（`pom.xml`/`package.json`）→ 内容特征检测（`@RestController` 等）→ 任务上下文分析（跳过不相关文件）→ 按需组合加载，非全量加载。

**Profile 机制**：通过 `.codestandardsrc.json` 配置 profile（core=仅必须 / recommended=必须+推荐 / extended=全部），加载后按 profile 过滤规则级别。

**优先级**：`.codestandardsrc.json` > `team/overrides.md` > `team/{lang}-overrides.md` > 框架规范（springboot > java）> 语言基础规范

## 目录结构

```
.claude-plugin/plugin.json          # 插件元数据
.codestandardsrc.json               # 项目级配置（profile, disabledRules, disabledFiles）
.opencode/plugins/code-standards.js # Bootstrap 引导脚本（注入守卫 + 注册 skills）
skills/code-standards/              # 核心 Skill（守卫协议 + 检测规则 + 规则索引）
standards/                          # 规范库，按技术分类子目录
  java/                             # coding-style, comment-standards, best-practices, design-patterns-{creational,structural,behavioral}
  springboot/                       # project-structure, api-design, config-management, data-access, best-practices, advanced-patterns
  vue3/                             # component-standards, composition-api, typescript-usage, state-management, project-structure, css-standards
  vue2/                             # component-standards, state-management, project-structure（仅手动 /apply-standard vue2 加载）
  javascript/                       # best-practices（coding-style 已删除，AI 默认遵守）
  typescript/                       # coding-style, type-design, best-practices
  css/                              # css-standards
  team/                             # overrides.md, {lang}-overrides.md, README.md
commands/                           # 斜杠命令定义: apply-standard, check-code, list-standards
scripts/                            # validate-standards.js, post-write-check.js, adapt.js
adapters/                           # 多平台适配输出（cursor, copilot, claude-code）
docs/                               # design.md（设计文档）, plans/（实施计划）
```

## 常用命令

```bash
# 验证引导脚本语法
node --check .opencode/plugins/code-standards.js

# 验证所有规范文件格式和元数据
node scripts/validate-standards.js

# 列出所有规范文件
find standards -name "*.md" ! -name "_*" | sort

# 统计规范规则数量
grep -r "^### R" standards/ | wc -l

# 导出为 Cursor 格式
node scripts/adapt.js cursor

# 导出为 Copilot 格式
node scripts/adapt.js copilot

# 导出所有格式
node scripts/adapt.js all
```

## 斜杠命令

| 命令 | 说明 |
|------|------|
| `/apply-standard <lang\|rule-id...> [--profile X]` | 手动加载规范或精确规则（如 `R-SB-API-01`） |
| `/check-code [rule-id...]` | 检查当前代码是否符合规范 |
| `/list-standards` | 列出所有可用规范及 profile 信息 |

## 规范文件编写约定

- 每个文件必须包含 YAML frontmatter（id, title, tags, trigger, skip）
- 每条规则格式：`### R{N}: {规则标题}` + 级别（必须/推荐/建议）+ 描述 + 正例 + 反例
- 每个文件 2-12 条规则，聚焦 AI 容易犯错或需要项目约束的规则，AI 默认遵守的基础实践不列出
- 规则编号全局唯一，同一文件内递增
- 全局规则 ID 格式：`R-{CATEGORY}-{N}`（详见 `skills/code-standards/rule-index.md`）
- 文件标题格式：`# {技术} - {主题}规范`
- 所有代码示例必须是可运行的完整片段
- 新建规范文件请复制 `standards/_template.md` 模板