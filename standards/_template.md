---
id: {tech-topic}
title: {技术} - {主题}规范
tags: [{tag1}, {tag2}]
trigger:
  extensions: [.{ext}]
  frameworks: [{framework}]
skip:
  keywords: []
---

# {技术} - {主题}规范

## 适用范围

<!-- 描述本规范的适用场景，例如： -->
<!-- - 适用于所有 Java 后端项目的 RESTful API 设计 -->
<!-- - 适用于使用 Spring Boot 框架的 Controller 层代码 -->

## 规则

### R1: {规则标题}

- **级别**: 必须 | 推荐 | 建议
- **描述**: {规则的具体说明，描述应该做什么或不应该做什么}

**正确示例：**

```java
// 完整可运行的代码片段，展示正确的做法
public class UserController {
    // ...
}
```

**错误示例：**

```java
// 反面教材，展示常见错误
public class userController {
    // ...
}
```

**原因**: {为什么这条规则重要，违反后可能导致什么问题}

---

<!-- 继续添加更多规则：R2, R3, ... -->
<!-- 每个文件建议 2-12 条规则 -->
<!-- 聚焦 AI 容易犯错或需要项目约束的规则 -->
<!-- AI 默认遵守的基础实践不需要列出 -->
