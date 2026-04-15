---
description: 手动指定编码规范并应用到后续代码生成
argument-hint: <lang|rule-id...> [framework] [--profile core|recommended|extended]
allowed-tools: [Read, Glob, Grep]
---

# Apply Standard

用户手动指定编码规范。参数: $ARGUMENTS

## 指令

1. 解析参数，确定加载方式
   - **按语言/框架**: `java`, `springboot`, `vue3`, `vue2`, `javascript`, `typescript`, `css`
   - **按全局规则 ID**: `R-SB-API-01`, `R-JAVA-CS-02` 等格式（查阅 `skills/code-standards/rule-index.md`）
   - **Profile 覆盖**: `--profile core|recommended|extended`
   - 多个值用空格分隔，如 `/apply-standard java springboot` 或 `/apply-standard R-SB-API-01 R-SB-API-04 --profile core`

2. 如指定了全局规则 ID，从 `skills/code-standards/rule-index.md` 定位规则所在文件，仅加载并注入匹配的规则（精确注入模式）

3. 如指定了语言/框架，使用 Read 工具加载对应的 standards/ 下的所有规范文件，然后根据 profile 过滤规则级别

4. 同时检查 `standards/team/overrides.md` 和对应的 `standards/team/{lang}-overrides.md`

5. 向用户确认已加载的规范列表（含 profile 和规则数量）

## 后续行为

从此刻起，本对话中的所有代码生成都必须遵守已加载的规范。