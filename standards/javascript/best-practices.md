# JavaScript - 最佳实践

## 适用范围
- 适用于所有 JavaScript/TypeScript 项目的编码实践
- 与编码风格规范配合使用
- 聚焦日常开发中高频出现的问题

## 规则

### R1: 使用可选链 ?. 和空值合并 ??
**级别**: 必须
**描述**: 访问深层对象属性时使用可选链操作符（?.），处理 null/undefined 时使用空值合并操作符（??）。
**正例**:
```javascript
const city = user?.address?.city ?? '未知城市';
const name = user?.profile?.nickname ?? user?.name ?? '匿名用户';
const count = data?.items?.length ?? 0;

if (config?.database?.host) {
  connectDB(config.database);
}
```
**反例**:
```javascript
const city = user && user.address && user.address.city
  ? user.address.city
  : '未知城市';

const name = user && user.profile && user.profile.nickname
  ? user.profile.nickname
  : '匿名用户';

const count = data && data.items && data.items.length ? data.items.length : 0;
```

### R2: 使用 async/await 处理异步
**级别**: 必须
**描述**: 异步操作使用 async/await 语法，不使用原始 Promise.then 链式调用。
**正例**:
```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error;
  }
}
```
**反例**:
```javascript
function fetchUserData(userId) {
  return fetch('/api/users/' + userId)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      console.error('获取用户数据失败:', error);
      throw error;
    });
}
```

### R3: 使用解构赋值设置默认值
**级别**: 推荐
**描述**: 函数参数使用解构赋值配合默认值，提高可读性和灵活性。
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
  age = age || 18;
  role = role || 'user';
  active = active !== undefined ? active : true;
  return { name: name, age: age, role: role, active: active };
}
```

### R4: 对高频事件使用防抖或节流
**级别**: 必须
**描述**: 搜索输入、滚动、窗口调整等高频事件必须使用防抖（debounce）或节流（throttle）。
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

### R5: 避免回调地狱
**级别**: 必须
**描述**: 禁止嵌套多层回调，使用 async/await 或 Promise 链平铺异步流程。
**正例**:
```javascript
async function processOrder(orderId) {
  const order = await fetchOrder(orderId);
  const payment = await processPayment(order);
  const shipment = await createShipment(order, payment);
  await notifyCustomer(order, shipment);
  return { orderId, status: 'completed' };
}
```
**反例**:
```javascript
function processOrder(orderId, callback) {
  fetchOrder(orderId, function(order) {
    processPayment(order, function(payment) {
      createShipment(order, payment, function(shipment) {
        notifyCustomer(order, shipment, function() {
          callback({ orderId: orderId, status: 'completed' });
        });
      });
    });
  });
}
```

### R6: 使用 Promise.all 并行执行独立异步任务
**级别**: 推荐
**描述**: 多个互不依赖的异步操作使用 Promise.all 并行执行，提高性能。
**正例**:
```javascript
async function loadDashboard(userId) {
  const [user, orders, notifications, stats] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchNotifications(userId),
    fetchStats(userId),
  ]);

  return { user, orders, notifications, stats };
}
```
**反例**:
```javascript
async function loadDashboard(userId) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(userId);
  const notifications = await fetchNotifications(userId);
  const stats = await fetchStats(userId);

  return { user, orders, notifications, stats };
}
```

### R7: 使用 try/catch 处理错误
**级别**: 必须
**描述**: 异步操作必须使用 try/catch 捕获错误，并提供有意义的错误处理。
**正例**:
```javascript
async function submitForm(formData) {
  try {
    const result = await api.submitOrder(formData);
    showToast('提交成功');
    return result;
  } catch (error) {
    if (error instanceof NetworkError) {
      showToast('网络异常，请稍后重试');
    } else if (error instanceof ValidationError) {
      showFieldErrors(error.fields);
    } else {
      showToast('系统错误，请联系管理员');
      logError(error);
    }
    throw error;
  }
}
```
**反例**:
```javascript
async function submitForm(formData) {
  const result = await api.submitOrder(formData);
  // 未捕获错误，导致 Unhandled Promise Rejection
  showToast('提交成功');
  return result;
}
```

### R8: 不修改函数参数
**级别**: 必须
**描述**: 禁止直接修改函数参数对象，应创建副本后操作。
**正例**:
```javascript
function updateUser(user, updates) {
  const updated = { ...user, ...updates };
  updated.modifiedAt = new Date();
  return updated;
}

function addItem(cart, item) {
  return [...cart, { ...item, addedAt: Date.now() }];
}
```
**反例**:
```javascript
function updateUser(user, updates) {
  user.name = updates.name;
  user.age = updates.age;
  user.modifiedAt = new Date();
  return user;
}

function addItem(cart, item) {
  cart.push(item);
  return cart;
}
```

### R9: 使用默认参数代替短路判断
**级别**: 推荐
**描述**: 函数参数默认值使用 ES6 默认参数语法，不使用 || 或 ?? 短路判断。
**正例**:
```javascript
function createList(title, items = [], pageSize = 10) {
  return { title, items, pageSize };
}

function formatDate(date, pattern = 'YYYY-MM-DD') {
  return dayjs(date).format(pattern);
}
```
**反例**:
```javascript
function createList(title, items, pageSize) {
  items = items || [];
  pageSize = pageSize || 10;
  return { title: title, items: items, pageSize: pageSize };
}
```

### R10: 避免全局变量
**级别**: 必须
**描述**: 禁止在全局作用域声明变量，使用模块化（import/export）管理代码。
**正例**:
```javascript
// config.js
export const API_BASE_URL = 'https://api.example.com';
export const TIMEOUT = 5000;

// api.js
import { API_BASE_URL, TIMEOUT } from './config.js';

export async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
```
**反例**:
```javascript
// 全局变量，任何地方都可以修改，难以追踪
var API_BASE_URL = 'https://api.example.com';
var TIMEOUT = 5000;

function request(endpoint, options) {
  // 直接访问全局变量
  return fetch(API_BASE_URL + endpoint, options);
}
```