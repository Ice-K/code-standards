# CSS - 命名规范

## 适用范围
- 适用于所有 CSS/Less/Sass 项目的命名约束
- 参考 BEM 命名方法论
- 与编码风格规范配合使用

## 规则

### R1: 使用 BEM 命名规范
**级别**: 必须
**描述**: 类名使用 BEM（Block__Element--Modifier）命名规范，保证命名唯一性和可读性。
**正例**:
```css
/* Block */
.user-card {}

/* Element */
.user-card__avatar {}
.user-card__name {}
.user-card__description {}

/* Modifier */
.user-card--featured {}
.user-card--compact {}
.user-card__avatar--large {}
.user-card__name--highlighted {}
```
```html
<!-- HTML 使用 -->
<div class="user-card user-card--featured">
  <img class="user-card__avatar user-card__avatar--large" src="..." />
  <span class="user-card__name user-card__name--highlighted">Alice</span>
  <p class="user-card__description">Frontend Developer</p>
</div>
```
**反例**:
```css
/* 无命名规范 */
.card {}
.card .img {}
.card .text {}
.card.featured {}
.card.featured .img.big {}

/* 嵌套 BEM（不推荐） */
.user-card__header__title {}
.user-card__body__content__text {}
```

### R2: ID 不用于样式
**级别**: 必须
**描述**: 禁止使用 ID 选择器编写样式，只用 class 选择器。ID 仅用于 JavaScript 和锚点。
**正例**:
```css
/* 使用 class 选择器 */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.hero-banner {
  height: 400px;
  background-size: cover;
}
```
```html
<header class="page-header">
  <div class="hero-banner"></div>
</header>
```
**反例**:
```css
/* 使用 ID 选择器 */
#header {
  position: sticky;
  top: 0;
}

#hero-banner {
  height: 400px;
}
```
```html
<header id="header">
  <div id="hero-banner"></div>
</header>
```

### R3: 类名语义化
**级别**: 必须
**描述**: 类名应反映元素的功能和含义，而非样式表现。禁止使用 .red、.mt-10、.bold 等表现型命名。
**正例**:
```css
/* 语义化命名 */
.error-message {
  color: #f5222d;
}

.section-title {
  font-weight: 700;
}

.page-footer {
  margin-top: 40px;
}

.price-highlight {
  color: #ff4d4f;
  font-size: 24px;
}

.sidebar-navigation {
  width: 240px;
}
```
**反例**:
```css
/* 表现型命名 */
.red {
  color: #f5222d;
}

.bold {
  font-weight: 700;
}

.mt-40 {
  margin-top: 40px;
}

.text-red-large {
  color: #ff4d4f;
  font-size: 24px;
}

.w-240 {
  width: 240px;
}
```

### R4: Less/Sass 嵌套不超过 3 层
**级别**: 必须
**描述**: Less/Sass 嵌套层级不超过 3 层，避免生成过深的选择器。
**正例**:
```less
.user-card {
  padding: 16px;
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
  }

  &--featured {
    border-color: var(--color-primary);

    .user-card__name {
      color: var(--color-primary);
    }
  }
}
```
**反例**:
```less
.page {
  .content {
    .section {
      .article {
        .header {
          .title {
            font-size: 24px;
            /* 编译为 .page .content .section .article .header .title {} */
            /* 6 层嵌套，选择器优先级过高 */
          }
        }
      }
    }
  }
}
```

### R5: 统一使用 class 选择器
**级别**: 必须
**描述**: 样式规则统一使用 class 选择器，不使用标签选择器、属性选择器做通用样式。
**正例**:
```css
/* 使用 class 选择器 */
.nav-item {
  display: inline-block;
  padding: 8px 16px;
}

.text-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
```
**反例**:
```css
/* 标签选择器做通用样式 */
div {
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

/* 属性选择器做通用样式 */
[href] {
  color: #1890ff;
}

[data-type="button"] {
  cursor: pointer;
}
```

### R6: 状态类使用 is- 前缀
**级别**: 必须
**描述**: 元素状态类名统一使用 .is- 前缀，如 .is-active、.is-hidden、.is-loading。
**正例**:
```css
/* 状态类 */
.nav-item.is-active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.modal.is-hidden {
  display: none;
}

.button.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.panel.is-collapsed .panel__content {
  max-height: 0;
  overflow: hidden;
}

.input.is-error {
  border-color: var(--color-error);
}
```
**反例**:
```css
/* 状态命名不规范 */
.nav-item.active {}
.modal.hidden {}
.button.loading {}
.panel.collapsed {}
.input.error {}

/* 与功能类混淆 */
.active {}
.selected {}
.disabled {}
```

### R7: JavaScript 钩子使用 js- 前缀
**级别**: 必须
**描述**: 仅供 JavaScript 操作使用的类名使用 .js- 前缀，不附加任何样式。
**正例**:
```html
<!-- HTML 结构 -->
<button class="btn btn--primary js-submit-btn">提交</button>
<div class="modal js-login-modal">
  <input class="modal__input js-username-input" />
  <input class="modal__input js-password-input" type="password" />
</div>
```
```css
/* CSS 只关注样式类 */
.btn { /* ... */ }
.btn--primary { /* ... */ }
.modal { /* ... */ }
.modal__input { /* ... */ }
/* js- 前缀的类不出现在 CSS 中 */
```
```javascript
// JavaScript 使用 js- 前缀选择器
document.querySelector('.js-submit-btn').addEventListener('click', handleSubmit);
document.querySelector('.js-login-modal').classList.toggle('is-hidden');
```
**反例**:
```html
<!-- JavaScript 直接使用样式类名 -->
<button class="btn btn--primary">提交</button>
```
```javascript
// JS 依赖样式类名，样式重构时 JS 会崩溃
document.querySelector('.btn--primary').addEventListener('click', handleSubmit);
document.querySelector('.modal').style.display = 'none';
```

### R8: 避免过度嵌套选择器
**级别**: 必须
**描述**: CSS 选择器嵌套不超过 3 层，保持低优先级，便于覆盖。
**正例**:
```css
/* 扁平的 BEM 结构 */
.user-card { /* 1 层 */ }
.user-card__name { /* 1 层 */ }
.user-card__avatar { /* 1 层 */ }
.user-card--featured { /* 1 层 */ }

/* 必要的层级限定 */
.user-card--featured .user-card__name { /* 2 层 */ }
.nav .nav-item.is-active { /* 3 层 */ }

/* 推荐的嵌套深度 */
.theme-dark .button { /* 2 层，主题限定 */ }
```
**反例**:
```css
/* 选择器嵌套过深 */
body .wrapper .container .main .content .article .title {
  font-size: 24px;
}

/* 父子关系嵌套过深 */
.header .nav .menu .item .link .icon {
  color: #1890ff;
}

/* 依赖 DOM 结构 */
#app > div:nth-child(2) > section:first-child > div > ul > li:nth-child(3) > a {
  color: red;
}
```