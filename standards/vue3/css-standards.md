# Vue3 - CSS/LESS 样式规范

## 适用范围
- 适用于所有 Vue3 项目的样式编写
- 推荐使用 LESS 预处理器
- 与组件编写规范配合使用

## 规则

### R1: 组件样式必须使用 scoped
**级别**: 必须
**描述**: 所有组件的 `<style>` 标签必须添加 `scoped` 属性，将样式限制在当前组件作用域内。
**正例**:
```vue
<template>
  <div class="card">
    <h3 class="card__title">{{ title }}</h3>
    <p class="card__desc">{{ desc }}</p>
  </div>
</template>

<style lang="less" scoped>
.card {
  padding: 16px;
  border-radius: 8px;

  &__title {
    font-size: 18px;
    font-weight: bold;
  }

  &__desc {
    color: #666;
    margin-top: 8px;
  }
}
</style>
```
**反例**:
```vue
<template>
  <div class="card">
    <h3>{{ title }}</h3>
  </div>
</template>

<!-- 无 scoped，样式影响全局 -->
<style lang="less">
.card {
  padding: 16px;
}
.card h3 {
  font-size: 18px; /* 所有 .card h3 都受影响 */
}
</style>
```

### R2: BEM 命名规范
**级别**: 推荐
**描述**: CSS 类名遵循 BEM（Block Element Modifier）命名规范：`.block__element--modifier`，避免层级过深。
**正例**:
```vue
<template>
  <div class="user-card">
    <img class="user-card__avatar" :src="avatar" />
    <div class="user-card__info">
      <span class="user-card__name">{{ name }}</span>
      <span class="user-card__role user-card__role--admin">管理员</span>
    </div>
    <button class="user-card__action user-card__action--disabled">
      编辑
    </button>
  </div>
</template>

<style lang="less" scoped>
.user-card {
  display: flex;
  padding: 16px;

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
  }

  &__role--admin {
    color: #1890ff;
  }

  &__action--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```
**反例**:
```vue
<template>
  <div class="card">
    <div class="card top section">
      <img class="avatar" />
      <span class="name">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 类名语义不清，嵌套过深 */
.card .top .section .avatar { }
.card .top .section .name { }
/* 不使用 BEM 难以维护 */
.card .top .section .name.active.highlight { }
</style>
```

### R3: 使用 CSS 变量管理主题
**级别**: 推荐
**描述**: 在全局样式中使用 CSS 自定义属性（CSS Variables）定义主题色、间距等，便于主题切换和统一管理。
**正例**:
```css
/* styles/variables.css */
:root {
  /* 主题色 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #f5222d;
  --color-text: #333;
  --color-text-secondary: #666;
  --color-bg: #fff;
  --color-border: #d9d9d9;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-primary: #177ddc;
  --color-text: #fff;
  --color-bg: #141414;
  --color-border: #434343;
}
```
```vue
<style lang="less" scoped>
.btn {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
}
</style>
```
**反例**:
```vue
<style scoped>
/* 硬编码颜色值，分散在各组件中 */
.btn-primary { background: #1890ff; }
.btn-danger { background: #f5222d; }
.header { color: #333; background: #fff; border: 1px solid #d9d9d9; }
/* 修改主题色需要逐一查找替换 */
</style>
```

### R4: LESS mixin 复用样式
**级别**: 建议
**描述**: 使用 LESS mixin 封装可复用的样式片段，避免重复代码。常用 mixin 包括：文本截断、清除浮动、居中对齐等。
**正例**:
```less
// styles/mixins.less

// 单行文本截断
.ellipsis() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行文本截断
.multi-ellipsis(@lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: @lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Flex 居中
.flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 清除浮动
.clearfix() {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}
```
```vue
<style lang="less" scoped>
@import '@/styles/mixins.less';

.card-title {
  .ellipsis();
  max-width: 200px;
}

.modal-body {
  .multi-ellipsis(3);
}

.icon-wrapper {
  .flex-center();
  width: 40px;
  height: 40px;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 每个组件重复写相同的样式 */
.card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-title {
  overflow: hidden;       /* 再次重复 */
  text-overflow: ellipsis;
  white-space: nowrap;
}

.another-text {
  overflow: hidden;       /* 第三次重复 */
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

### R5: 响应式断点使用 768/992/1200
**级别**: 推荐
**描述**: 统一使用 768px、992px、1200px 作为响应式断点，分别对应移动端、平板、小桌面、大桌面。
**正例**:
```less
// styles/variables.less
@screen-sm: 768px;   // 平板
@screen-md: 992px;   // 小桌面
@screen-lg: 1200px;  // 大桌面

// styles/mixins.less
.responsive-sm(@rules) {
  @media (min-width: @screen-sm) { @rules(); }
}
.responsive-md(@rules) {
  @media (min-width: @screen-md) { @rules(); }
}
.responsive-lg(@rules) {
  @media (min-width: @screen-lg) { @rules(); }
}
```
```vue
<style lang="less" scoped>
.container {
  padding: var(--spacing-sm);

  @media (min-width: @screen-sm) {
    padding: var(--spacing-md);
  }

  @media (min-width: @screen-md) {
    padding: var(--spacing-lg);
    max-width: 960px;
  }

  @media (min-width: @screen-lg) {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
```
**反例**:
```vue
<style scoped>
/* 断点值随意，不统一 */
@media (max-width: 600px) { .container { padding: 8px; } }
@media (min-width: 800px) { .container { padding: 16px; } }
@media (min-width: 1100px) { .container { padding: 24px; } }
/* 与其他组件断点不一致 */
</style>
```

### R6: 使用 :deep() 穿透 scoped 样式
**级别**: 推荐
**描述**: 当需要覆盖子组件样式时，使用 `:deep()` 伪类函数穿透 scoped 限制。禁止使用废弃的 `>>>` 或 `/deep/`。
**正例**:
```vue
<template>
  <div class="wrapper">
    <ChildComponent class="child" />
    <el-table class="data-table" :data="tableData" />
  </div>
</template>

<style lang="less" scoped>
.wrapper {
  padding: 16px;
}

/* 覆盖子组件样式 */
.wrapper :deep(.child__inner) {
  color: red;
}

/* 覆盖 Element Plus 组件样式 */
.data-table :deep(.el-table__header) {
  background-color: #f5f5f5;
}

.data-table :deep(.el-table__cell) {
  padding: 12px 0;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用废弃语法 */
.wrapper >>> .child__inner { color: red; }
.wrapper /deep/ .child__inner { color: red; }

/* 去掉 scoped 来覆盖样式（影响全局） */
</style>

<style>
/* 全局覆盖组件库样式 */
.el-table__header {
  background-color: #f5f5f5;
}
</style>
```

### R7: z-index 分层管理
**级别**: 推荐
**描述**: z-index 按层级使用，通过 CSS 变量统一管理，避免 z-index 军备竞赛。
**正例**:
```css
/* styles/variables.css */
:root {
  --z-index-normal: 1;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal-backdrop: 400;
  --z-index-modal: 500;
  --z-index-popover: 600;
  --z-index-tooltip: 700;
  --z-index-notification: 800;
}
```
```vue
<style lang="less" scoped>
.header {
  position: fixed;
  z-index: var(--z-index-fixed);
}

.dropdown-menu {
  position: absolute;
  z-index: var(--z-index-dropdown);
}

.modal-overlay {
  z-index: var(--z-index-modal-backdrop);
}

.modal-content {
  z-index: var(--z-index-modal);
}
</style>
```
**反例**:
```vue
<style scoped>
/* z-index 值随意递增 */
.header { z-index: 999; }
.dropdown { z-index: 9999; }
.modal { z-index: 99999; }
.tooltip { z-index: 999999; }
.notification { z-index: 9999999; }
/* 无法维护，不断增加 */
</style>
```

### R8: 禁止使用 !important
**级别**: 必须
**描述**: 禁止使用 `!important` 声明。应通过提高选择器优先级、调整 CSS 顺序或使用 `:deep()` 等方式解决样式覆盖问题。
**正例**:
```vue
<style lang="less" scoped>
/* 通过更具体的选择器提高优先级 */
.wrapper .btn.primary {
  background-color: var(--color-primary);
}

/* 使用 :deep 覆盖子组件样式 */
:deep(.el-input__inner) {
  border-color: var(--color-primary);
}

/* 使用 :where 降低优先级（当需要被轻松覆盖时） */
:where(.base-button) {
  padding: 8px 16px;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用 !important 强制覆盖 */
.btn { color: red !important; }
.title { font-size: 16px !important; }
.el-input__inner { border: 1px solid red !important; }

/* 层层叠加 !important */
.wrapper .btn { color: blue !important; }
</style>
```

### R9: 优先使用 Flexbox 和 Grid 布局
**级别**: 推荐
**描述**: 布局优先使用 Flexbox 和 CSS Grid，避免使用 float、table 等传统布局方式。
**正例**:
```vue
<style lang="less" scoped>
/* Flexbox 一维布局 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 56px;
}

/* Grid 二维布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 常见居中 */
.center-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* 侧边栏 + 内容布局 */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 使用 float 布局 */
.sidebar { float: left; width: 240px; }
.content { float: right; width: calc(100% - 240px); }
.container::after { content: ''; clear: both; display: table; }

/* 使用 table 布局 */
.layout { display: table; width: 100%; }
.sidebar { display: table-cell; width: 240px; }
.content { display: table-cell; }
</style>
```

### R10: CSS 属性声明顺序
**级别**: 建议
**描述**: CSS 属性按功能分组有序书写：定位 > 盒模型 > 排版 > 视觉 > 动画 > 其他。
**正例**:
```vue
<style lang="less" scoped>
.example {
  /* 1. 定位 */
  position: relative;
  top: 0;
  z-index: 1;

  /* 2. 盒模型 */
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: auto;
  padding: 16px;
  margin: 0 auto;

  /* 3. 排版 */
  font-size: 14px;
  line-height: 1.5;
  text-align: center;

  /* 4. 视觉 */
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 5. 动画 */
  transition: all 0.3s ease;
  animation: fadeIn 0.5s;

  /* 6. 其他 */
  cursor: pointer;
  overflow: hidden;
}
</style>
```
**反例**:
```vue
<style scoped>
/* 属性顺序混乱 */
.example {
  color: #333;               /* 视觉 */
  width: 100%;               /* 盒模型 */
  position: relative;        /* 定位 */
  font-size: 14px;           /* 排版 */
  padding: 16px;             /* 盒模型 */
  cursor: pointer;           /* 其他 */
  background: #fff;          /* 视觉 */
  top: 0;                    /* 定位 */
  margin: 0 auto;            /* 盒模型 */
  transition: all 0.3s;      /* 动画 */
  display: flex;             /* 盒模型 */
  border-radius: 8px;        /* 视觉 */
}
</style>
```