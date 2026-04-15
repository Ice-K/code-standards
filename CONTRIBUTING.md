# 贡献指南

感谢你对 Code Standards Plugin 的贡献！本文档说明如何添加和修改编码规范。

## 快速开始

### 新建规范文件

1. 复制 `standards/_template.md` 到对应的 technology 子目录
2. 重命名为 `{topic}.md`（小写，连字符分隔，如 `api-design.md`）
3. 填写 frontmatter 元数据
4. 编写规则

### 追加规则到已有文件

在文件的 `## 规则` 章节末尾追加新规则，编号顺延（如文件已有 R1-R5，新规则从 R6 开始）。

## 目录结构

| 目录 | 适用技术 |
|------|---------|
| `standards/java/` | Java 语言基础 |
| `standards/springboot/` | Spring Boot 框架 |
| `standards/vue3/` | Vue 3 框架 |
| `standards/vue2/` | Vue 2 框架（仅手动加载） |
| `standards/javascript/` | JavaScript 语言 |
| `standards/typescript/` | TypeScript 语言 |
| `standards/css/` | CSS / LESS 样式 |
| `standards/team/` | 团队定制覆盖 |

## Frontmatter 元数据

每个规范文件必须包含 YAML frontmatter：

```yaml
---
id: {唯一标识}           # kebab-case，如 java-coding-style
title: {技术} - {主题}规范  # 与文件 H1 标题一致
tags: [tag1, tag2]       # 可搜索标签
trigger:
  extensions: [.{ext}]   # 触发加载的文件扩展名
  frameworks: [{name}]   # 触发加载的框架名
skip:
  keywords: []           # 当用户任务包含这些关键词时跳过此文件
---
```

### 字段说明

- **id**: 文件唯一标识符，使用 kebab-case 命名，不得与其他文件重复
- **title**: 与文件中的 `#` 标题完全一致
- **tags**: 2-5 个标签，用于搜索和分类
- **trigger.extensions**: 哪些文件扩展名应触发加载此规范
- **trigger.frameworks**: 哪些框架被检测到时应加载此规范
- **skip.keywords**: 当用户的编码任务描述中包含这些关键词时，跳过此文件以节省 tokens

## 规则编写约定

### 格式

```markdown
### R{N}: {规则标题}

- **级别**: 必须 | 推荐 | 建议
- **描述**: {规则说明}

**正确示例：**
`{代码块}`

**错误示例：**
`{代码块}`

**原因**: {为什么这条规则重要}
```

### 级别说明

| 级别 | 含义 | Profile 映射 |
|------|------|-------------|
| 必须 | 违反会导致 bug 或严重质量问题 | core（最严格） |
| 推荐 | 业界最佳实践，强烈建议遵守 | recommended（默认） |
| 建议 | 可选优化，提升代码可维护性 | extended（最宽松） |

### 编写原则

1. **聚焦 AI 弱点** — 只写 AI 容易犯错的规则，AI 默认遵守的基础实践不列出
2. **每文件 2-12 条** — 宁精勿滥
3. **可运行示例** — 正例和反例必须是完整可运行的代码片段
4. **说明原因** — 每条规则附上"原因"，帮助 AI 理解为什么
5. **规则编号全局唯一** — 同一文件内从 R1 递增，不同文件间不重复编号段

## 验证

提交前运行验证脚本检查规范文件格式：

```bash
node scripts/validate-standards.js
```

验证项包括：frontmatter 完整性、规则编号连续性、必须字段存在性、全局 ID 唯一性。

## 提交流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/new-standard`)
3. 添加或修改规范文件
4. 运行 `node scripts/validate-standards.js` 确保通过
5. 提交 Pull Request
