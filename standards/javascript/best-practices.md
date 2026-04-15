---
id: javascript-best-practices
title: JavaScript - 最佳实践
tags: [javascript, best-practices, debounce, throttle]
trigger:
  extensions: [.js, .jsx]
  frameworks: []
skip:
  keywords: [SQL, Mapper, 数据库, 后端, Spring, MyBatis]
---

# JavaScript - 最佳实践

## 适用范围
- 适用于所有 JavaScript/TypeScript 项目的编码实践
- 与编码风格规范配合使用
- 聚焦日常开发中 AI 容易遗漏的实践
- async/await、?. / ??、Promise.all、try/catch、避免回调地狱等现代 JS 基础实践不再列出，AI 默认遵守

## 规则

### R1: 对高频事件使用防抖或节流
**级别**: 必须
**描述**: 搜索输入、滚动、窗口调整等高频事件必须使用防抖（debounce）或节流（throttle），避免性能问题。
**正例**:
```javascript
// 防抖：搜索输入
import { debounce } from 'lodash-es';

const handleSearch = debounce((keyword) => {
  fetchSuggestions(keyword);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// 节流：滚动事件
import { throttle } from 'lodash-es';

const handleScroll = throttle(() => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore();
  }
}, 200);

window.addEventListener('scroll', handleScroll);
```
**反例**:
```javascript
// 每次输入都触发请求，导致大量无意义请求
searchInput.addEventListener('input', (e) => {
  fetchSuggestions(e.target.value);
});

// 每次滚动都触发计算，导致页面卡顿
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore();
  }
});
```

### R2: 使用解构赋值设置默认值
**级别**: 推荐
**描述**: 函数参数使用解构赋值配合默认值，提高可读性和灵活性，避免使用 || 短路判断。
**正例**:
```javascript
function createUser({ name, age = 18, role = 'user', active = true } = {}) {
  return { name, age, role, active };
}

function configure({ host = 'localhost', port = 3000, debug = false }) {
  return { host, port, debug };
}
```
**反例**:
```javascript
function createUser(name, age, role, active) {
  age = age || 18;           // 0 会被误判为 falsy
  role = role || 'user';
  active = active !== undefined ? active : true;
  return { name: name, age: age, role: role, active: active };
}
```