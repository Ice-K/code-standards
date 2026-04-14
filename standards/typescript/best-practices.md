# TypeScript - 最佳实践

## 适用范围
- 适用于所有 TypeScript 项目的编码实践
- 与编码风格规范、类型设计规范配合使用
- 聚焦类型系统的高效使用

## 规则

### R1: 启用 strict 模式
**级别**: 必须
**描述**: tsconfig.json 中必须启用 strict 模式，确保最大程度的类型安全。
**正例**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```
**反例**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

### R2: 不使用 any，使用 unknown
**级别**: 必须
**描述**: 禁止使用 any 类型，当类型不确定时使用 unknown 并配合类型守卫。
**正例**:
```typescript
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'number') {
    return data.toFixed(2);
  }
  if (isNonNullObject(data) && 'name' in data) {
    return String((data as { name: string }).name);
  }
  return JSON.stringify(data);
}

// 第三方库回调参数类型不明确时
function handleCallback(callback: (...args: unknown[]) => void): void {
  // ...
}
```
**反例**:
```typescript
function parseJSON(jsonString: string): any {
  return JSON.parse(jsonString);
}

const data = parseJSON('{"name":"Alice"}');
// data 任何操作都不会报错，丢失了类型保护
data.nonExistent.method().foo;

function processData(data: any): string {
  return data.toUpperCase(); // 编译通过，但运行时可能崩溃
}
```

### R3: 使用 import type 导入类型
**级别**: 必须
**描述**: 纯类型导入使用 import type 语法，避免运行时副作用。
**正例**:
```typescript
import type { User, UserRole } from './user.types';
import type { ApiResponse, PaginatedResponse } from './api.types';
import { createUser, validateUser } from './user.service';

export async function handleCreateUser(data: unknown): Promise<ApiResponse<User>> {
  const user = createUser(data as Partial<User>);
  return { success: true, data: user };
}
```
**反例**:
```typescript
import { User, UserRole, createUser, validateUser } from './user.service';
// User 和 UserRole 是类型，但与值导入混在一起
// 打包工具可能无法正确 tree-shake
```

### R4: 使用 const enum
**级别**: 推荐
**描述**: 纯数值枚举使用 const enum 减少运行时代码。
**正例**:
```typescript
const enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}

function move(direction: Direction): void {
  switch (direction) {
    case Direction.Up:
      position.y -= speed;
      break;
    case Direction.Down:
      position.y += speed;
      break;
  }
}

// 编译后 move(Direction.Up) 变为 move(0)，无额外对象
```
**反例**:
```typescript
enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
}
// 编译后会生成一个 Direction 对象，增加运行时代码
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
//   ...
// })(Direction || (Direction = {}));
```

### R5: 使用类型收窄
**级别**: 必须
**描述**: 利用 typeof、instanceof、in、字面量类型等手段进行类型收窄。
**正例**:
```typescript
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value ? '是' : '否';
}

// 使用 instanceof
function handleError(error: unknown): string {
  if (error instanceof TypeError) {
    return `类型错误: ${error.message}`;
  }
  if (error instanceof RangeError) {
    return `范围错误: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// 使用 in 操作符
function processResponse(res: SuccessResponse | ErrorResponse): void {
  if ('data' in res) {
    console.log(res.data);
  } else {
    console.error(res.error);
  }
}
```
**反例**:
```typescript
function formatValue(value: string | number | boolean): string {
  // 强制断言，没有类型保护
  if ((value as string).trim) {
    return (value as string).trim();
  }
  return String(value);
}

function handleError(error: unknown): string {
  // 直接断言为 any
  return (error as any).message || '未知错误';
}
```

### R6: 使用 satisfies 运算符
**级别**: 推荐
**描述**: 使用 satisfies 运算符验证类型同时保留字面量类型推断。
**正例**:
```typescript
interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const colors = {
  primary: '#1890ff',
  secondary: '#52c41a',
  background: '#f0f2f5',
  text: '#333333',
} satisfies ThemeColors;

// colors.primary 的类型是 '#1890ff'（字面量类型），而非 string
type PrimaryColor = typeof colors.primary; // '#1890ff'

const routes = {
  home: '/',
  users: '/users',
  settings: '/settings',
} satisfies Record<string, string>;

// routes.home 的类型是 '/' 而非 string
```
**反例**:
```typescript
const colors: ThemeColors = {
  primary: '#1890ff',
  secondary: '#52c41a',
  background: '#f0f2f5',
  text: '#333333',
};
// colors.primary 的类型是 string，丢失了字面量类型 '#1890ff'
type PrimaryColor = typeof colors.primary; // string

const routes: Record<string, string> = {
  home: '/',
  users: '/users',
  settings: '/settings',
};
// routes.home 的类型是 string，丢失了 '/'
```

### R7: 避免类型断言，使用类型守卫
**级别**: 必须
**描述**: 禁止使用 as 断言绕过类型检查，应使用类型守卫进行安全的类型转换。
**正例**:
```typescript
// 使用类型守卫函数
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as User).id === 'number'
  );
}

function processInput(input: unknown): User {
  if (isUser(input)) {
    return input; // 安全收窄为 User
  }
  throw new TypeError('Invalid user data');
}

// 使用 Zod 等运行时校验库
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

function parseUser(data: unknown): User {
  return UserSchema.parse(data); // 运行时验证 + 类型安全
}
```
**反例**:
```typescript
function processInput(input: unknown): User {
  return input as User; // 无运行时验证，不安全
}

const data = JSON.parse(responseText);
const user = data as User; // 如果 data 不是 User，运行时错误

// 双重断言更是严禁
const value = 'hello' as unknown as number; // 完全绕过类型检查
```

### R8: 正确选择 Record 和 Map
**级别**: 推荐
**描述**: 键为固定字符串集合时使用 Record，键动态变化或需要 Map 特性时使用 Map。
**正例**:
```typescript
// 键为固定的已知集合，使用 Record
interface User {
  id: number;
  name: string;
}

type UserCache = Record<number, User>;

const userCache: UserCache = {
  1: { id: 1, name: 'Alice' },
  2: { id: 2, name: 'Bob' },
};

// 键动态变化、需要遍历或频繁增删，使用 Map
const permissionMap = new Map<string, Set<string>>();

function grantPermission(role: string, permission: string): void {
  const permissions = permissionMap.get(role) ?? new Set<string>();
  permissions.add(permission);
  permissionMap.set(role, permissions);
}

// 需要保持插入顺序或键非字符串时，使用 Map
const eventListeners = new Map<HTMLElement, (() => void)[]>();
```
**反例**:
```typescript
// 键动态变化却使用 Record，可能导致属性冲突
const cache: Record<string, User> = {};
cache[userId] = user;
// Object.prototype 上的属性可能被意外访问
if (cache['toString']) { /* 意外匹配 */ }

// 键固定已知却使用 Map，增加不必要的复杂度
const statusMap = new Map<string, string>();
statusMap.set('active', '正常');
statusMap.set('inactive', '禁用');
// 应直接使用 const enum 或 Record
```