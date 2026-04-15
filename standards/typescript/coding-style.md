---
id: typescript-coding-style
title: TypeScript - 编码风格规范
tags: [typescript, coding-style, type-annotation, enum, generic]
trigger:
  extensions: [.ts, .tsx]
  frameworks: []
skip:
  keywords: [SQL, Mapper, 数据库, 后端, Spring, MyBatis]
---

# TypeScript - 编码风格规范

## 适用范围
- 适用于所有 TypeScript 项目的编码风格约束
- 参考 TypeScript 官方风格指南与社区最佳实践
- 与类型设计规范、最佳实践规范配合使用
- interface 优先 type、readonly、as const、可辨识联合、不用 namespace、命名导出等实践不再列出，AI 默认遵守

## 规则

### R1: 函数参数和返回值使用显式类型注解
**级别**: 必须
**描述**: 函数的参数和返回值必须添加显式类型注解，不依赖类型推断。显式注解是 API 契约的一部分，方便调用方理解。
**正例**:
```typescript
function formatPrice(price: number, currency: string = 'CNY'): string {
  return `${currency} ${price.toFixed(2)}`;
}

function findUserById(id: number): Promise<User | null> {
  return userRepository.findById(id);
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```
**反例**:
```typescript
function formatPrice(price, currency = 'CNY') {
  return `${currency} ${price.toFixed(2)}`;
}

function findUserById(id) {
  return userRepository.findById(id);
}

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
```

### R2: 使用 enum 替代魔法数字
**级别**: 必须
**描述**: 状态码、类型标识等魔法数字或字符串必须定义为 enum，提高可读性并防止拼写错误。
**正例**:
```typescript
enum UserStatus {
  Active = 1,
  Inactive = 0,
  Suspended = -1,
}

enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalError = 500,
}

if (user.status === UserStatus.Active) {
  grantAccess(user);
}
```
**反例**:
```typescript
if (user.status === 1) {
  grantAccess(user);
}

if (response.code === 200) {
  handleSuccess(response.data);
}
```

### R3: 泛型参数使用有意义的命名
**级别**: 推荐
**描述**: 泛型参数使用有意义的名称或约定命名（T 通用类型，K 键，V 值，E 元素），避免单字母以外的无意义命名。
**正例**:
```typescript
// 约定命名
function identity<T>(value: T): T {
  return value;
}

function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

// 有意义的命名
interface Repository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
}

interface EventMap<TEventName extends string, TPayload> {
  on(event: TEventName, handler: (payload: TPayload) => void): void;
}
```
**反例**:
```typescript
function identity<A>(value: A): A {
  return value;
}

function getProperty<O, K extends keyof O>(obj: O, key: K): O[K] {
  return obj[key];
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
}
```