# Code Standards Plugin

Claude Code 编码规范守卫插件 — 为 AI 编程助手提供 Java/Spring/Vue 生态的编码规范，确保生成的代码符合业界标准和团队约定。

## 功能特性

- **自动检测** — 根据文件类型和项目配置自动识别语言/框架
- **按需加载** — 只加载相关规范，不浪费上下文
- **质量关卡** — 每次代码生成后自动检查规范合规性
- **团队定制** — 支持团队覆盖默认规范
- **手动触发** — 提供斜杠命令主动控制

## 支持的语言/框架

| 分类 | 技术 |
|------|------|
| 后端 | Java、Spring Boot、Spring Cloud、Spring Cloud Alibaba |
| 前端 | Vue 2、Vue 3 |
| 语言 | JavaScript、TypeScript |
| 样式 | CSS、LESS |

## 规范维度

每个语言/框架覆盖以下维度：
- 编码风格（命名、格式）
- 代码注释规范
- 最佳实践
- 架构设计与设计模式
- 项目结构约定

## 安装

```bash
# 克隆到 Claude Code 插件目录
git clone https://github.com/user/code-standards.git ~/.claude/plugins/code-standards
```

## 使用方式

### 自动模式（默认）

安装后无需任何操作。当你在对话中要求 AI 编写代码时，插件会自动：
1. 检测目标文件的语言/框架
2. 加载对应的编码规范
3. 按规范生成代码
4. 自动检查代码合规性

### 手动命令

| 命令 | 说明 |
|------|------|
| `/apply-standard <lang>` | 手动加载指定规范（如 `/apply-standard java springboot`） |
| `/check-code` | 检查当前代码是否符合规范 |
| `/list-standards` | 列出所有可用的编码规范 |

## 团队定制

编辑 `standards/team/overrides.md` 添加团队定制规则。团队定制优先级高于所有默认规范，升级插件时不会被覆盖。

## 项目结构

```
code-standards/
├── .claude-plugin/plugin.json      # 插件元数据
├── .opencode/plugins/               # 引导脚本
├── skills/code-standards/           # 核心 skill（守卫协议 + 检测规则）
├── standards/                       # 规范库
│   ├── java/                        # Java 规范（4 个文件）
│   ├── springboot/                  # Spring Boot 规范（5 个文件）
│   ├── springcloud/                 # Spring Cloud 规范（4 个文件）
│   ├── springcloud-alibaba/         # Spring Cloud Alibaba 规范（4 个文件）
│   ├── vue3/                        # Vue3 规范（6 个文件）
│   ├── vue2/                        # Vue2 规范（3 个文件）
│   ├── javascript/                  # JavaScript 规范（2 个文件）
│   ├── typescript/                  # TypeScript 规范（3 个文件）
│   ├── css/                         # CSS 规范（2 个文件）
│   └── team/                        # 团队定制
├── commands/                        # 斜杠命令
└── README.md
```

## 跨平台支持

当前支持 Claude Code，后续计划支持：
- Cursor
- GitHub Copilot
- Gemini CLI
- OpenCode

核心规范文件（standards/）是纯 Markdown，所有平台可直接复用。

## License

MIT