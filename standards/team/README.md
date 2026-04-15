# 团队定制说明

## 分层覆盖体系

支持多层级的团队定制，优先级从高到低：

| 层级 | 文件 | 说明 |
|------|------|------|
| 1 (最高) | `.codestandardsrc.json` | 项目级配置：禁用规则、禁用文件、profile |
| 2 | `team/overrides.md` | 全局团队覆盖，适用于所有语言 |
| 3 | `team/{lang}-overrides.md` | 语言级团队覆盖，仅适用于对应语言 |
| 4 (最低) | `standards/{tech}/*.md` | 插件默认规范 |

如有冲突，高层级覆盖低层级。

## 覆盖文件

| 文件 | 覆盖范围 |
|------|---------|
| `overrides.md` | 全局覆盖，适用于所有语言/框架 |
| `java-overrides.md` | 覆盖 Java 相关规范（coding-style, best-practices 等） |
| `springboot-overrides.md` | 覆盖 Spring Boot 相关规范（api-design, data-access 等） |
| `vue-overrides.md` | 覆盖 Vue 相关规范（vue3/\*, vue2/\*） |
| `typescript-overrides.md` | 覆盖 TypeScript 相关规范（coding-style, type-design 等） |

## 如何使用

### 方式一：添加团队规则

编辑对应的 `*-overrides.md` 文件，添加团队特有的规则：

```markdown
### R1: 统一使用 Lombok

- **级别**: 必须
- **覆盖**: 无（新增规则）
- **描述**: 所有 POJO 类必须使用 Lombok 注解简化代码

**正确示例：**
@Data
@Builder
public class UserDTO { ... }

**错误示例：**
public class UserDTO {
    private Long id;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    // ... 大量 getter/setter
}
```

### 方式二：覆盖默认规则

```markdown
### 覆盖 R-JAVA-CS-04: 方法行数限制

- **覆盖**: R-JAVA-CS-04（默认 80 行）
- **团队定制**: 单个方法不超过 50 行
- **原因**: 团队代码评审要求更严格的方法粒度
```

### 方式三：通过 .codestandardsrc.json 禁用

```json
{
  "profile": "recommended",
  "disabledRules": ["R-SB-API-08"],
  "disabledFiles": ["standards/java/design-patterns-creational.md"]
}
```

## 注意事项

- 升级插件时 `team/` 目录下的文件不会被覆盖
- 建议将 `team/` 目录纳入版本控制
- 不同团队/项目可以有各自的覆盖文件
- `.codestandardsrc.json` 放在项目根目录，可以按项目定制
