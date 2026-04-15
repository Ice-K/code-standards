---
id: css-standards
title: CSS - 编码风格与命名规范
tags: [css, less, bem, naming, responsive]
trigger:
  extensions: [.css, .less, .scss, .sass]
  frameworks: []
skip:
  keywords: [SQL, Mapper, 数据库, 后端, Spring, MyBatis, REST, 接口, API]
---

# CSS - 编码风格与命名规范

## 适用范围
- 适用于所有 CSS/Less/Sass 项目的编码风格与命名约束
- 参考 BEM 命名方法论与 Bootstrap CSS 编码规范
- 缩进、颜色格式等基础格式不再列出，AI 默认遵守

## 规则

### R1: 属性声明遵循规范顺序
**级别**: 必须
**描述**: CSS 属性按照"定位 > 盒模型 > 排版 > 视觉 > 动画"顺序书写。
**正例**:
```css
.user-card {
  /* 定位 */
  position: relative;
  z-index: 10;

  /* 盒模型 */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0 auto;

  /* 排版 */
  font-size: 14px;
  line-height: 1.5;

  /* 视觉 */
  color: #333;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;

  /* 动画 */
  transition: all 0.3s ease;
}
```
**反例**:
```css
.user-card {
  color: #333;               /* 视觉 */
  position: relative;        /* 定位 */
  font-size: 14px;           /* 排版 */
  padding: 16px;             /* 盒模型 */
  display: flex;             /* 盒模型 */
  transition: all 0.3s ease; /* 动画 */
}
```

### R2: 使用 CSS 变量管理主题色
**级别**: 必须
**描述**: 颜色、间距、字体等主题值使用 CSS 变量统一管理。
**正例**:
```css
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #f5222d;
  --color-text: #333333;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --border-radius-md: 8px;
}

.primary-button {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```
**反例**:
```css
.primary-button { background-color: #1890ff; }
.secondary-button { background-color: #52c41a; }
/* 修改主题色需要逐个替换 */
```

### R3: 不使用 !important
**级别**: 必须
**描述**: 禁止使用 !important 覆盖样式，应通过提升选择器优先级或调整 CSS 层级解决。
**正例**:
```css
.card .title { font-size: 18px; }
.card.featured .title { font-size: 24px; }
```
**反例**:
```css
.title { font-size: 24px !important; }
.nav-item { color: #1890ff !important; }
```

### R4: 媒体查询放在规则块最后
**级别**: 必须
**描述**: 媒体查询应放在所属选择器规则块内部最后位置。
**正例**:
```css
.user-card {
  padding: 16px;

  @media (max-width: 768px) {
    padding: 8px;
  }
}
```
**反例**:
```css
/* 媒体查询与基础样式分离 */
@media (max-width: 768px) {
  .user-card { padding: 8px; }
}
.user-card { padding: 16px; }
```

### R5: 使用 BEM 命名规范
**级别**: 必须
**描述**: 类名使用 BEM（Block__Element--Modifier）命名规范。
**正例**:
```css
.user-card {}
.user-card__avatar {}
.user-card__name {}
.user-card--featured {}
.user-card__avatar--large {}
```
**反例**:
```css
.card {}
.card .img {}
.card.featured .img.big {}
.user-card__header__title {}  /* 嵌套 BEM */
```

### R6: 类名语义化，ID 不用于样式
**级别**: 必须
**描述**: 类名反映功能含义而非样式表现。禁止使用 ID 选择器和表现型命名。
**正例**:
```css
.error-message { color: #f5222d; }
.section-title { font-weight: 700; }
.page-footer { margin-top: 40px; }
```
**反例**:
```css
.red { color: #f5222d; }
.mt-40 { margin-top: 40px; }
#header { position: sticky; }  /* 禁止 ID 选择器 */
```

### R7: Less/Sass 嵌套不超过 3 层
**级别**: 必须
**描述**: Less/Sass 嵌套层级不超过 3 层，避免生成过深的选择器。
**正例**:
```less
.user-card {
  &__header { display: flex; }
  &__name { font-size: 16px; }
  &--featured {
    .user-card__name { color: var(--color-primary); }
  }
}
```
**反例**:
```less
.page .content .section .article .header .title {
  font-size: 24px;  /* 6 层嵌套 */
}
```

### R8: 状态类使用 is- 前缀，JS 钩子使用 js- 前缀
**级别**: 必须
**描述**: 元素状态类名使用 `.is-` 前缀，仅供 JS 操作的类名使用 `.js-` 前缀且不附加样式。
**正例**:
```html
<button class="btn btn--primary js-submit-btn">提交</button>
```
```css
.btn.is-loading { opacity: 0.7; pointer-events: none; }
.nav-item.is-active { color: var(--color-primary); }
/* js- 前缀的类不出现在 CSS 中 */
```
**反例**:
```css
.nav-item.active {}   /* 状态命名不规范 */
.modal.hidden {}      /* 与功能类混淆 */
```