---
description: 列出所有可用的编码规范
allowed-tools: [Read, Glob]
---

# List Standards

展示所有可用的编码规范。

## 指令

1. 使用 Glob 扫描 standards/ 目录下所有 .md 文件（排除 `_template.md`）
2. 读取每个文件的标题行和 frontmatter 元数据
3. 读取 `.codestandardsrc.json` 获取当前 profile 设置
4. 按分类展示所有可用规范，格式：

```
[编码规范列表] 当前 Profile: {profile}

## Java ({文件数}个规范)
- coding-style.md — Java 编码风格规范 [必须:{n} 推荐:{n} 建议:{n}]
- ...

## Spring Boot ({文件数}个规范)
- ...

## Vue3 ({文件数}个规范)
- ...
```

5. 提示用户：
   - 使用 `/apply-standard <lang>` 加载规范
   - 使用 `/apply-standard R-XXX-NN` 精确加载单条规则
   - 修改 `.codestandardsrc.json` 切换 profile