---
name: code-standards
description: "编码规范守卫。当 AI 编写、编辑、重构任何代码时必须激活。覆盖 Java、Spring Boot、Spring Cloud、Spring Cloud Alibaba、Vue2、Vue3、JavaScript、TypeScript、CSS、LESS 的编码规范、注释规范、最佳实践、架构设计、设计模式。用户说 '写代码'、'新建文件'、'实现功能'、'重构'、'添加接口'、'创建组件' 或任何涉及代码生成的场景时触发。"
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

**框架检测速查表：**

| 信号 | 必须加载 |
|------|---------|
| `.java` 文件 | `standards/java/coding-style.md` + `standards/java/comment-standards.md` |
| `@SpringBootApplication` / `@RestController` / `@Service` | + `standards/springboot/` 相关文件 |
| `spring-cloud` 依赖 | + `standards/springcloud/` 相关文件 |
| `nacos` / `sentinel` / `seata` 依赖 | + `standards/springcloud-alibaba/` 相关文件 |
| `.vue` 文件（Vue 3.x） | `standards/vue3/` 相关文件 |
| `.vue` 文件（Vue 2.x） | `standards/vue2/` 相关文件 |
| `.ts` / `.tsx` 文件 | `standards/typescript/` 相关文件 |
| `.js` 文件 | `standards/javascript/` 相关文件 |
| `.css` / `.less` 文件 | `standards/css/` 相关文件 |

多语言/框架场景（如 Spring Boot + Vue3 前后端）需全部加载并综合应用。

### P3: 团队定制优先

始终检查 `standards/team/overrides.md`。团队定制的优先级高于所有默认规范。如有冲突，以团队定制为准。

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