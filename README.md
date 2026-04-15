# Code Standards Plugin

Claude Code 编码规范守卫插件 — 为 AI 编程助手提供 Java/Spring/Vue 生态的编码规范，确保生成的代码符合业界标准和团队约定。

## 功能特性

- **自动检测** — 根据文件扩展名、项目配置、内容特征多信号识别语言/框架
- **按需加载** — 只加载相关规范，结合任务上下文智能跳过无关文件
- **Profile 分级** — core（仅必须）/ recommended（默认）/ extended（全部），灵活控制规范严格程度
- **精确注入** — 184 条规则均有全局 ID（如 `R-SB-API-01`），可精确注入单条规则
- **团队定制** — 支持分层覆盖：语言级 → 全局级 → 项目配置
- **实时检查** — PostToolUse Hook 在文件写入后自动检查常见违规
- **多平台适配** — 一键导出为 Cursor / GitHub Copilot 格式

## 快速开始

### 安装

```bash
# 1. 添加 marketplace
/plugin marketplace add Ice-K/code-standards-marketplace

# 2. 安装插件
/plugin install code-standards@code-standards-marketplace
```

### 本地测试

```bash
git clone https://github.com/Ice-K/code-standards.git
cd code-standards
/plugin marketplace add .
/plugin install code-standards@code-standards
```

## 使用方式

### 自动模式（默认）

安装后无需任何操作。当你在对话中要求 AI 编写代码时，插件会自动：

1. 检测目标文件的语言/框架
2. 读取 `.codestandardsrc.json` 获取 profile 配置
3. 分析任务上下文，跳过不相关规范
4. 按 profile 过滤后加载对应规范
5. 按规范生成代码并通过质量关卡检查

### 斜杠命令

| 命令 | 说明 |
|------|------|
| `/apply-standard <lang\|rule-id...> [--profile X]` | 手动加载规范或精确规则 |
| `/check-code [rule-id...]` | 检查当前代码是否符合规范 |
| `/list-standards` | 列出所有可用规范及 profile 信息 |

**示例：**

```bash
# 加载 Java + Spring Boot 规范
/apply-standard java springboot

# 只加载 Controller 相关的 2 条规则
/apply-standard R-SB-API-01 R-SB-API-04

# 以 core profile 加载
/apply-standard java --profile core

# 检查特定规则
/check-code R-JAVA-BP-01 R-JAVA-BP-03
```

## 支持的语言/框架

| 分类 | 技术 | 规范文件数 | 规则数 |
|------|------|-----------|--------|
| 后端 | Java | 6 | 42 |
| 后端 | Spring Boot | 6 | 47 |
| 前端 | Vue 3 | 6 | 45 |
| 前端 | Vue 2 | 3 | 22 |
| 语言 | JavaScript | 1 | 7 |
| 语言 | TypeScript | 3 | 22 |
| 样式 | CSS | 1 | 6 |

共计 **28 个规范文件**、**184 条规则**（含必须/推荐/建议三级）。

## Profile 分级

通过项目根目录的 `.codestandardsrc.json` 配置：

```json
{
  "profile": "recommended",
  "disabledRules": [],
  "disabledFiles": []
}
```

| Profile | 加载规则 | 适用场景 |
|---------|---------|---------|
| `core` | 仅「必须」级别 | 新项目快速启动，只关注关键规则 |
| `recommended` | 「必须」+「推荐」（默认） | 日常开发，平衡质量与效率 |
| `extended` | 全部（含「建议」） | 代码审查、质量提升阶段 |

## 团队定制

分层覆盖系统，优先级从高到低：

1. `.codestandardsrc.json` — 项目级配置（禁用规则/文件）
2. `team/overrides.md` — 全局团队定制
3. `team/{lang}-overrides.md` — 语言级定制（如 `java-overrides.md`）
4. 框架规范（springboot > java）
5. 语言基础规范

在 `standards/team/` 目录下编辑对应文件，升级插件时不会被覆盖。

## 项目结构

```
code-standards/
├── .claude-plugin/plugin.json          # 插件元数据
├── .codestandardsrc.json               # 项目级配置
├── .opencode/plugins/code-standards.js # Bootstrap 引导脚本
├── skills/code-standards/              # 核心 skill
│   ├── SKILL.md                        #   守卫协议（P1-P5）
│   ├── detection-rules.md              #   多信号检测策略
│   └── rule-index.md                   #   全局规则索引（184条）
├── standards/                          # 规范库
│   ├── _template.md                    #   新建规范模板
│   ├── java/                           #   Java 规范（6 个文件）
│   ├── springboot/                     #   Spring Boot 规范（6 个文件）
│   ├── vue3/                           #   Vue 3 规范（6 个文件）
│   ├── vue2/                           #   Vue 2 规范（3 个文件）
│   ├── javascript/                     #   JavaScript 规范
│   ├── typescript/                     #   TypeScript 规范（3 个文件）
│   ├── css/                            #   CSS 规范
│   └── team/                           #   团队定制（4 个模板）
├── commands/                           # 斜杠命令
│   ├── apply-standard.md
│   ├── check-code.md
│   └── list-standards.md
├── scripts/
│   ├── validate-standards.js           # 规范文件格式验证
│   ├── post-write-check.js             # PostToolUse Hook
│   └── adapt.js                        # 多平台适配转换
├── adapters/                           # 多平台输出
│   ├── claude-code/                    #   Claude Code（原生格式）
│   ├── cursor/.cursorrules             #   Cursor 格式
│   └── copilot/.github/                #   Copilot 格式
├── CONTRIBUTING.md                     # 贡献指南
├── CLAUDE.md                           # Claude Code 开发指引
└── marketplace.json                    # Marketplace 目录文件
```

## 多平台适配

核心规范文件（`standards/`）是纯 Markdown，通过适配脚本可导出到其他 AI 编码助手：

```bash
# 导出为 Cursor 格式
node scripts/adapt.js cursor

# 导出为 GitHub Copilot 格式
node scripts/adapt.js copilot

# 导出所有格式
node scripts/adapt.js all
```

导出文件自动按当前 profile 过滤规则级别。

## 开发

```bash
# 验证引导脚本语法
node --check .opencode/plugins/code-standards.js

# 验证所有规范文件格式和元数据
node scripts/validate-standards.js

# 统计规则数量
grep -r "^### R" standards/ | wc -l
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何添加新规则。

## License

MIT
