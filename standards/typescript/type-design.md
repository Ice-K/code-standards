---
id: typescript-type-design
title: TypeScript - 类型设计规范
tags: [typescript, type-design, discriminated-union, utility-type, conditional-type]
trigger:
  extensions: [.ts, .tsx]
  frameworks: []
skip:
  keywords: [SQL, Mapper, 数据库, 后端, Spring, MyBatis, CRUD, 增删改查]
---

# TypeScript - 类型设计规范

## 适用范围
- 适用于所有 TypeScript 项目的类型系统设计
- 与编码风格规范、最佳实践规范配合使用
- 聚焦高级类型特性的正确使用

## 规则

### R1: 使用可辨识联合（Discriminated Union）
**级别**: 必须
**描述**: 多种形态的数据使用可辨识联合类型，通过公共的辨识字段进行类型收窄。
**正例**:
```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}
```
**反例**:
```typescript
interface Shape {
  type: string;
  radius?: number;
  width?: number;
  height?: number;
  base?: number;
}

function getArea(shape: Shape): number {
  if (shape.type === 'circle') {
    // shape.radius 可能为 undefined，需要额外判空
    return Math.PI * (shape.radius ?? 0) ** 2;
  }
  if (shape.type === 'rectangle') {
    return (shape.width ?? 0) * (shape.height ?? 0);
  }
  return 0;
}
```

### R2: 使用工具类型（Partial/Required/Pick/Omit）
**级别**: 推荐
**描述**: 善用 TypeScript 内置工具类型，避免重复定义相似结构。
**正例**:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// 创建时 id 和 createdAt 由系统生成
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;

// 更新时所有字段都是可选的
type UpdateUserDTO = Partial<Omit<User, 'id'>>;

// 列表展示只需要部分字段
type UserListItem = Pick<User, 'id' | 'name' | 'avatar' | 'role'>;

// 批量导入时 email 必填，其他可选
type ImportUserDTO = Partial<Omit<User, 'id' | 'createdAt'>> & Required<Pick<User, 'email'>>;
```
**反例**:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface CreateUserDTO {
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

interface UserListItem {
  id: number;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
}
```

### R3: 使用条件类型
**级别**: 推荐
**描述**: 根据类型条件动态选择类型，实现灵活的类型推导。
**正例**:
```typescript
// 根据是否为数组提取元素类型
type UnwrapArray<T> = T extends Array<infer U> ? U : T;

type A = UnwrapArray<string[]>;   // string
type B = UnwrapArray<number>;     // number

// 根据输入类型决定返回类型
type ApiResponse<T> = T extends void
  ? { success: boolean }
  : { success: boolean; data: T };

// 判断是否为 Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type C = Awaited<Promise<Promise<string>>>; // string
```
**反例**:
```typescript
// 不使用条件类型，手动定义每种情况
type UnwrapArrayString = string;
type UnwrapArrayNumber = number;
type UnwrapArrayBoolean = boolean;

// 无法处理未知类型
function unwrap(value: any): any {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
```

### R4: 编写类型守卫
**级别**: 必须
**描述**: 使用类型守卫（Type Guard）进行运行时类型检查和编译时类型收窄。
**正例**:
```typescript
// 自定义类型守卫函数
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 使用 in 操作符
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function isDog(pet: Dog | Cat): pet is Dog {
  return 'bark' in pet;
}

// 使用
function processValue(value: unknown): string {
  if (isString(value)) {
    // 此处 value 被收窄为 string
    return value.toUpperCase();
  }
  return String(value);
}
```
**反例**:
```typescript
function processValue(value: unknown): string {
  // 强制类型断言，无运行时保护
  return (value as string).toUpperCase();
}

function getPetSound(pet: Dog | Cat): string {
  // 不使用类型守卫，直接假设类型
  if ((pet as Dog).bark) {
    return (pet as Dog).bark();
  }
  return (pet as Cat).meow();
}
```

### R5: 使用泛型约束 extends
**级别**: 必须
**描述**: 泛型参数使用 extends 约束，确保传入类型满足要求。
**正例**:
```typescript
// 约束为对象类型
function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'name'); // 类型安全
// getProperty(user, 'email'); // 编译错误

// 约束为具有特定属性的类型
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// 约束为构造函数
function createInstance<T>(ctor: new () => T): T {
  return new ctor();
}
```
**反例**:
```typescript
// 无约束的泛型
function getProperty(obj: any, key: string): any {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'email'); // 无编译错误，运行时返回 undefined

// 使用 any 代替泛型约束
function findById(items: any[], id: number): any {
  return items.find(item => item.id === id);
}
```

### R6: 使用映射类型
**级别**: 推荐
**描述**: 使用映射类型基于已有类型创建新的类型变体。
**正例**:
```typescript
// 将所有属性变为可选的
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性变为只读的
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将所有属性变为可空的
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 实际应用：表单验证错误
type ValidationErrors<T> = {
  [P in keyof T]?: string[];
};

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
}

const errors: ValidationErrors<RegistrationForm> = {
  email: ['邮箱格式不正确', '该邮箱已注册'],
  password: ['密码长度至少8位'],
};
```
**反例**:
```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// 手动定义可空变体
interface NullableUser {
  name: string | null;
  age: number | null;
  email: string | null;
}

// 手动定义验证错误
interface UserValidationErrors {
  name?: string[];
  age?: string[];
  email?: string[];
}
```

### R7: 使用模板字面量类型
**级别**: 推荐
**描述**: 使用模板字面量类型构建字符串模式类型。
**正例**:
```typescript
// 事件名称类型
type EventName = 'click' | 'hover' | 'focus';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onHover' | 'onFocus'

// CSS 属性类型
type CSSProperty = 'width' | 'height' | 'margin' | 'padding';
type CSSDirection = 'top' | 'right' | 'bottom' | 'left';
type CSSPropertyWithDirection = `${CSSProperty}-${CSSDirection}`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left' | ...

// API 路由类型
type Version = 'v1' | 'v2';
type Resource = 'users' | 'orders' | 'products';
type ApiRoute = `/api/${Version}/${Resource}`;
// '/api/v1/users' | '/api/v1/orders' | '/api/v2/users' | ...
```
**反例**:
```typescript
// 手动列举所有组合
type EventHandler =
  | 'onClick' | 'onHover' | 'onFocus'
  | 'onChange' | 'onSubmit';

type CSSMargin =
  | 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left';

type ApiRoute =
  | '/api/v1/users' | '/api/v1/orders' | '/api/v1/products'
  | '/api/v2/users' | '/api/v2/orders' | '/api/v2/products';
```

### R8: 使用 infer 关键字
**级别**: 推荐
**描述**: 在条件类型中使用 infer 提取和推导嵌套类型。
**正例**:
```typescript
// 提取函数返回值类型
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 解析值类型
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type Result = PromiseValue<Promise<string[]>>; // string[]

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Item = ElementOf<string[]>; // string

// 提取构造函数实例类型
type InstanceOf<T> = T extends new (...args: any[]) => infer I ? I : never;

// 提取对象值的类型
type ValueOf<T> = T extends { [key: string]: infer V } ? V : never;

const config = {
  host: 'localhost',
  port: 3000,
  debug: true,
};

type ConfigValue = ValueOf<typeof config>; // string | number | boolean
```
**反例**:
```typescript
// 手动指定每种返回类型
function getStringPromise(): Promise<string> { /* ... */ }
type StringPromiseResult = string;

function getNumberPromise(): Promise<number> { /* ... */ }
type NumberPromiseResult = number;

// 无法泛化提取逻辑
function processPromise(promise: Promise<any>): any {
  return promise.then(value => value);
}
```