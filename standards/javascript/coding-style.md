# JavaScript - 编码风格规范

## 适用范围
- 适用于所有 JavaScript/TypeScript 项目的编码风格约束
- 参考 Airbnb JavaScript Style Guide
- 与最佳实践规范配合使用

## 规则

### R1: 使用 const/let，不使用 var
**级别**: 必须
**描述**: 变量声明使用 const 或 let，禁止使用 var。const 用于不会被重新赋值的变量，let 用于需要重新赋值的变量。
**正例**:
```javascript
const MAX_COUNT = 10;
const users = ['Alice', 'Bob'];
let currentIndex = 0;

for (let i = 0; i < users.length; i++) {
  console.log(users[i]);
}
```
**反例**:
```javascript
var MAX_COUNT = 10;
var users = ['Alice', 'Bob'];
var currentIndex = 0;

for (var i = 0; i < users.length; i++) {
  console.log(users[i]);
}
```

### R2: 使用单引号字符串
**级别**: 必须
**描述**: 字符串统一使用单引号，不使用双引号。JSON 中除外。
**正例**:
```javascript
const name = 'Alice';
const errorMsg = '用户不存在';
const path = `/api/users/${userId}`;
```
**反例**:
```javascript
const name = "Alice";
const errorMsg = "用户不存在";
```

### R3: 使用模板字符串拼接
**级别**: 必须
**描述**: 包含变量插值的字符串使用模板字符串（反引号），不使用字符串拼接。
**正例**:
```javascript
const greeting = `Hello, ${user.name}!`;
const url = `/api/users/${userId}/orders/${orderId}`;
const message = `订单 ${orderId} 已于 ${new Date().toLocaleString()} 创建`;
```
**反例**:
```javascript
const greeting = 'Hello, ' + user.name + '!';
const url = '/api/users/' + userId + '/orders/' + orderId;
const message = '订单 ' + orderId + ' 已于 ' + new Date().toLocaleString() + ' 创建';
```

### R4: 使用箭头函数
**级别**: 推荐
**描述**: 函数表达式优先使用箭头函数，除非需要 this 绑定或作为构造函数。
**正例**:
```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

const getUserName = (user) => user.name;

const fetchUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};
```
**反例**:
```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(function(n) { return n * 2; });

const getUserName = function(user) { return user.name; };
```

### R5: 使用对象属性简写
**级别**: 推荐
**描述**: 当对象属性名与变量名相同时，使用属性简写。
**正例**:
```javascript
const name = 'Alice';
const age = 30;

const user = { name, age };

function createUser(name, age) {
  return { name, age };
}
```
**反例**:
```javascript
const name = 'Alice';
const age = 30;

const user = { name: name, age: age };

function createUser(name, age) {
  return { name: name, age: age };
}
```

### R6: 使用解构赋值
**级别**: 必须
**描述**: 访问对象属性或数组元素时，优先使用解构赋值。
**正例**:
```javascript
// 对象解构
const { name, age, email } = user;

// 数组解构
const [first, second] = results;

// 函数参数解构
function renderUser({ name, avatar, role }) {
  return `${name} (${role})`;
}

// 嵌套解构
const { address: { city, street } } = user;
```
**反例**:
```javascript
const name = user.name;
const age = user.age;
const email = user.email;

const first = results[0];
const second = results[1];

function renderUser(user) {
  return `${user.name} (${user.role})`;
}
```

### R7: 使用展开运算符
**级别**: 推荐
**描述**: 数组和对象的复制与合并使用展开运算符（...），不使用 Object.assign 或手动遍历。
**正例**:
```javascript
// 数组合并
const allUsers = [...existingUsers, ...newUsers];

// 对象合并
const updatedUser = { ...user, name: 'Bob', age: 31 };

// 函数参数收集
function log(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}
```
**反例**:
```javascript
const allUsers = existingUsers.concat(newUsers);

const updatedUser = Object.assign({}, user, { name: 'Bob', age: 31 });

function log(level) {
  const messages = Array.prototype.slice.call(arguments, 1);
  console.log('[' + level + ']', messages);
}
```

### R8: 使用严格相等 ===
**级别**: 必须
**描述**: 比较操作必须使用 === 和 !==，禁止使用 == 和 !=，避免隐式类型转换。
**正例**:
```javascript
if (status === 'active') {
  enableFeature();
}

if (count !== 0) {
  processItems();
}

if (typeof id === 'string') {
  searchById(id);
}
```
**反例**:
```javascript
if (status == 'active') {
  enableFeature();
}

if (count != 0) {
  processItems();
}

// '' == 0 为 true，但 '' === 0 为 false
if (value == 0) {
  handleZero();
}
```

### R9: 数组方法优先于 for 循环
**级别**: 推荐
**描述**: 优先使用 map/filter/reduce/find/some/every 等数组方法，而非 for 循环。
**正例**:
```javascript
// 映射
const names = users.map(user => user.name);

// 过滤
const activeUsers = users.filter(user => user.isActive);

// 聚合
const total = orders.reduce((sum, order) => sum + order.amount, 0);

// 查找
const admin = users.find(user => user.role === 'admin');
```
**反例**:
```javascript
const names = [];
for (let i = 0; i < users.length; i++) {
  names.push(users[i].name);
}

const activeUsers = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i]);
  }
}

let total = 0;
for (let i = 0; i < orders.length; i++) {
  total += orders[i].amount;
}
```

### R10: 函数声明先于使用
**级别**: 必须
**描述**: 函数和变量必须在使用前声明。使用 function 声明的函数会被提升，但仍建议在逻辑上先声明后使用。let/const 不会提升，必须先声明。
**正例**:
```javascript
// 工具函数先声明
function formatPrice(price) {
  return `¥${price.toFixed(2)}`;
}

// 业务函数后声明
function renderOrder(order) {
  console.log(formatPrice(order.total));
}

// 导出放最后
export { formatPrice, renderOrder };
```
**反例**:
```javascript
renderOrder(order); // ReferenceError: formatPrice is not defined

function renderOrder(order) {
  console.log(formatPrice(order.total));
}

function formatPrice(price) {
  return '¥' + price.toFixed(2);
}
```