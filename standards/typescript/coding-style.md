# TypeScript - 编码风格规范

## 适用范围
- 适用于所有 TypeScript 项目的编码风格约束
- 参考 TypeScript 官方风格指南与社区最佳实践
- 与类型设计规范、最佳实践规范配合使用

## 规则

### R1: 函数参数和返回值使用显式类型注解
**级别**: 必须
**描述**: 函数的参数和返回值必须添加显式类型注解，不依赖类型推断。
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

### R2: interface 优先于 type
**级别**: 推荐
**描述**: 定义对象结构时优先使用 interface，仅在需要联合类型、交叉类型或工具类型时使用 type。
**正例**:
```typescript
// 对象结构使用 interface
interface User {
  id: number;
  name: string;
  email: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 联合类型或复杂类型使用 type
type Status = 'active' | 'inactive' | 'suspended';
type Nullable<T> = T | null;
```
**反例**:
```typescript
// 简单对象结构不应使用 type
type User = {
  id: number;
  name: string;
  email: string;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

### R3: 使用 enum 替代魔法数字
**级别**: 必须
**描述**: 状态码、类型标识等魔法数字或字符串必须定义为 enum。
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

### R4: 泛型参数使用有意义的命名
**级别**: 推荐
**描述**: 泛型参数使用有意义的名称或约定命名（T 表示通用类型，K 表示键，V 表示值，E 表示元素）。
**正例**:
```typescript
// 通用类型
function identity<T>(value: T): T {
  return value;
}

// 键值对
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

### R5: 使用 readonly 修饰不可变属性
**级别**: 推荐
**描述**: 不应被修改的属性使用 readonly 修饰符。
**正例**:
```typescript
interface User {
  readonly id: number;
  readonly createdAt: Date;
  name: string;
  email: string;
}

interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
  retryCount: number;
}

const readonlyList: readonly string[] = ['a', 'b', 'c'];
```
**反例**:
```typescript
interface User {
  id: number;
  createdAt: Date;
  name: string;
  email: string;
}

const readonlyList: string[] = ['a', 'b', 'c'];
readonlyList.push('d'); // 不应该允许修改
```

### R6: 使用 as const 断言定义常量
**级别**: 推荐
**描述**: 需要保持字面量类型的场景使用 as const 断言。
**正例**:
```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'editor' | 'viewer'

const API_CONFIG = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const;

type Direction = 'up' | 'down' | 'left' | 'right';
const DEFAULT_DIRECTION = 'up' as const;
```
**反例**:
```typescript
const ROLES = ['admin', 'editor', 'viewer'];
type Role = typeof ROLES[number]; // string，丢失了具体类型

const API_CONFIG = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};
// 类型为 { baseUrl: string; timeout: number; retries: number; }
```

### R7: 使用可辨识联合
**级别**: 推荐
**描述**: 使用可辨识字段（discriminant）区分联合类型的成员。
**正例**:
```typescript
interface SuccessResponse<T> {
  status: 'success';
  data: T;
  timestamp: Date;
}

interface ErrorResponse {
  status: 'error';
  error: string;
  code: number;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status === 'success') {
    return response.data;
  }
  throw new BusinessError(response.code, response.error);
}
```
**反例**:
```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: number;
  timestamp?: Date;
}

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.data !== undefined) {
    return response.data;
  }
  // response.error 可能为 undefined
  throw new BusinessError(response.code ?? 0, response.error ?? '未知错误');
}
```

### R8: 避免使用命名空间
**级别**: 必须
**描述**: 禁止使用 namespace，使用 ES Module（import/export）组织代码。
**正例**:
```typescript
// user.types.ts
export interface User {
  id: number;
  name: string;
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

// user.service.ts
import type { User, UserRole } from './user.types';

export function createUser(name: string, role: UserRole): User {
  return { id: generateId(), name, role };
}
```
**反例**:
```typescript
namespace UserModule {
  export interface User {
    id: number;
    name: string;
  }

  export function createUser(name: string): User {
    return { id: 1, name };
  }
}

const user = UserModule.createUser('Alice');
```

### R9: 文件命名使用 camelCase
**级别**: 必须
**描述**: TypeScript 文件名使用 camelCase 命名，测试文件使用 .spec.ts 后缀。
**正例**:
```
userTypes.ts
userService.ts
orderController.ts
userService.spec.ts
dateHelpers.ts
apiClient.ts
```
**反例**:
```
UserTypes.ts
user_service.ts
Order-Controller.ts
user_service.test.ts
Date-helpers.ts
```

### R10: 使用命名导出
**级别**: 推荐
**描述**: 优先使用命名导出（named export），不使用默认导出（default export）。
**正例**:
```typescript
// userHelpers.ts
export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const MAX_LOGIN_ATTEMPTS = 5;

// 消费方
import { formatUserName, validateEmail } from './userHelpers';
```
**反例**:
```typescript
// userHelpers.ts
export default class UserHelpers {
  static formatUserName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

// 消费方可以随意命名，降低可读性
import MyHelper from './userHelpers';
import UserUtil from './userHelpers';
import anything from './userHelpers';
```