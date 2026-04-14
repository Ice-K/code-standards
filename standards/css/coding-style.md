# CSS - 编码风格规范

## 适用范围
- 适用于所有 CSS/Less/Sass 项目的编码风格约束
- 参考 Bootstrap CSS 编码规范
- 与命名规范配合使用

## 规则

### R1: 使用 2 空格缩进
**级别**: 必须
**描述**: CSS 代码统一使用 2 个空格缩进，不使用 Tab。
**正例**:
```css
.user-card {
  padding: 16px;
  border-radius: 8px;
}

.user-card .title {
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .user-card {
    padding: 8px;
  }
}
```
**反例**:
```css
.user-card {
    padding: 16px;      /* 4 空格 */
	border-radius: 8px; /* Tab 缩进 */
}

  .user-card {          /* 层级不一致 */
  padding: 16px;
}
```

### R2: 属性声明遵循规范顺序
**级别**: 必须
**描述**: CSS 属性按照"定位 > 盒模型 > 排版 > 视觉 > 动画"顺序书写。
**正例**:
```css
.user-card {
  /* 定位 */
  position: relative;
  z-index: 10;
  top: 0;

  /* 盒模型 */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0 auto;
  box-sizing: border-box;

  /* 排版 */
  font-size: 14px;
  line-height: 1.5;
  text-align: center;

  /* 视觉 */
  color: #333;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 动画 */
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}
```
**反例**:
```css
.user-card {
  color: #333;               /* 视觉 */
  position: relative;        /* 定位 */
  font-size: 14px;           /* 排版 */
  padding: 16px;             /* 盒模型 */
  border-radius: 8px;        /* 视觉 */
  display: flex;             /* 盒模型 */
  transition: all 0.3s ease; /* 动画 */
  width: 100%;               /* 盒模型 */
  z-index: 10;               /* 定位 */
  text-align: center;        /* 排版 */
  background-color: #fff;    /* 视觉 */
}
```

### R3: 使用 CSS 变量管理主题色
**级别**: 必须
**描述**: 颜色、间距、字体等主题值使用 CSS 变量（Custom Properties）统一管理。
**正例**:
```css
:root {
  /* 主题色 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #f5222d;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-background: #f0f2f5;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

.primary-button {
  background-color: var(--color-primary);
  color: #fff;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```
**反例**:
```css
.primary-button {
  background-color: #1890ff;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
}

.secondary-button {
  background-color: #52c41a;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
}

/* 修改主题色需要逐个替换 */
```

### R4: 不使用 !important
**级别**: 必须
**描述**: 禁止使用 !important 覆盖样式，应通过提升选择器优先级或调整 CSS 层级解决。
**正例**:
```css
/* 提升选择器特异性 */
.card .title {
  font-size: 18px;
}

.card.featured .title {
  font-size: 24px;
}

/* 使用更具体的选择器 */
#app .navigation .nav-item.active {
  color: var(--color-primary);
}

/* 使用 CSS 层叠层（@layer） */
@layer base {
  h1 { font-size: 24px; }
}

@layer components {
  h1 { font-size: 32px; } /* components 层优先级更高 */
}
```
**反例**:
```css
.title {
  font-size: 24px !important;
}

.nav-item {
  color: #1890ff !important;
}

.hidden {
  display: none !important;
}
```

### R5: 媒体查询放在规则块最后
**级别**: 必须
**描述**: 媒体查询（@media）应放在所属选择器规则块内部最后位置，集中管理响应式样式。
**正例**:
```css
.user-card {
  padding: 16px;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 4px;
    font-size: 11px;
  }
}

.sidebar {
  width: 240px;

  @media (max-width: 1024px) {
    width: 200px;
  }
}
```
**反例**:
```css
/* 媒体查询与基础样式分离，难以维护 */
@media (max-width: 768px) {
  .user-card {
    padding: 8px;
  }
  .sidebar {
    width: 200px;
  }
}

.user-card {
  padding: 16px;
}

.sidebar {
  width: 240px;
}

@media (max-width: 480px) {
  .user-card {
    padding: 4px;
  }
}
```

### R6: 谨慎使用简写属性
**级别**: 推荐
**描述**: 只在需要同时设置多个值时使用简写属性，避免意外覆盖。
**正例**:
```css
/* 明确指定需要的属性 */
.element {
  margin-top: 10px;
  margin-bottom: 20px;
  padding-left: 16px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fff;
  background-image: url('pattern.png');
  background-repeat: repeat-x;
}

/* 需要设置所有值时使用简写 */
.reset {
  margin: 0;
  padding: 0;
}
```
**反例**:
```css
/* 简写属性会重置未指定的值 */
.element {
  margin: 10px 0 20px; /* 左右被重置为 0 */
  padding: 0 0 0 16px; /* 上下右被重置为 0 */
  background: #fff url('pattern.png') repeat-x;
  /* background-position, background-size 等被重置 */
}
```

### R7: 颜色值统一使用 hex 或 rgba
**级别**: 必须
**描述**: 颜色值统一使用 #RRGGBB 或 rgba() 格式，同一项目内保持一致。
**正例**:
```css
.element {
  color: #333333;
  background-color: rgba(0, 0, 0, 0.5);
  border-color: #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* hex 可以简写 */
.text-primary {
  color: #1890ff;
}

.text-muted {
  color: #999;
}
```
**反例**:
```css
.element {
  color: rgb(51, 51, 51);
  background-color: hsl(0, 0%, 50%);
  border-color: lightgray;
  box-shadow: 0 2px 8px black;
}

/* 混用多种颜色格式 */
.text-primary {
  color: #1890ff;
}

.text-success {
  color: rgb(82, 196, 26);
}

.text-warning {
  color: orange;
}
```

### R8: 0 值不加单位
**级别**: 必须
**描述**: 数值为 0 时不加 px/em/rem 等单位。
**正例**:
```css
.element {
  margin: 0;
  padding: 0;
  border: 0;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 0;
}

/* 非 0 值必须加单位 */
.container {
  margin: 0 auto;
  padding: 16px;
}
```
**反例**:
```css
.element {
  margin: 0px;
  padding: 0px;
  border: 0px;
  top: 0px;
  left: 0em;
  opacity: 0%;
}
```