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