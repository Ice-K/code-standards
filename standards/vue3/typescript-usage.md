---
id: vue3-typescript-usage
title: Vue3 - TypeScript 使用规范
tags: [vue3, typescript, interface, generic, type-guard]
trigger:
  extensions: [.vue, .ts]
  frameworks: [vue3]
skip:
  keywords: [SQL, Mapper, 数据库, 配置文件, yml, properties, 后端]
---

# Vue3 - TypeScript 使用规范

## 适用范围
- 适用于所有 Vue3 + TypeScript 项目的类型定义与使用
- 与组件编写规范、Composition API 规范配合使用
- 与独立 TypeScript 编码规范互为补充

## 规则

### R1: interface 优先于 type
**级别**: 推荐
**描述**: 定义对象结构时优先使用 `interface`，便于声明合并和扩展；需要联合类型、交叉类型、映射类型时使用 `type`。
**正例**:
```ts
// 对象结构用 interface，支持 extends 扩展
interface User {
  id: number
  name: string
  email: string
}

interface AdminUser extends User {
  role: 'admin'
  permissions: string[]
}

// 联合类型、工具类型用 type
type Status = 'active' | 'inactive' | 'banned'
type Nullable<T> = T | null
```
**反例**:
```ts
// 简单对象结构也用 type，不利于扩展
type User = {
  id: number
  name: string
  email: string
}

// 用 interface 表示联合类型（不合法）
interface Status extends 'active' | 'inactive' {}
```

### R2: 使用 ApiResponse<T> 泛型封装接口响应
**级别**: 必须
**描述**: 统一定义接口响应类型，使用泛型参数 `T` 承载业务数据类型，保持接口类型一致性。
**正例**:
```ts
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 使用时明确 data 的类型
type UserListResponse = ApiResponse<PageResult<User>>
type LoginResponse = ApiResponse<{ token: string; expiresIn: number }>
```
**反例**:
```ts
// 每个接口单独定义响应结构
interface UserListResponse {
  code: number
  message: string
  data: {
    list: User[]
    total: number
  }
}

interface LoginResponse {
  code: number
  msg: string  // 字段名不一致 message vs msg
  result: { token: string }  // 字段名不一致 data vs result
}
```

### R3: defineProps 使用泛型语法
**级别**: 必须
**描述**: 组件 props 定义使用 `defineProps<T>()` 泛型语法，获得完整的 TypeScript 类型推导。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'active',
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
// 使用运行时声明，丢失类型推导
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array as PropType<string[]>, default: () => [] },
})
</script>
```

### R4: defineEmits 使用泛型签名
**级别**: 必须
**描述**: 事件声明使用 `defineEmits<T>()` 泛型签名，确保 emit 调用时参数类型安全。
**正例**:
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: { username: string; password: string }): void
  (e: 'cancel'): void
}>()

// 调用时参数类型被校验
emit('submit', { username: 'admin', password: '123456' })
</script>
```
**反例**:
```vue
<script setup lang="ts">
// 运行时声明，无类型约束
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// 调用时参数不受校验，可以传任意值
emit('submit', 'wrong argument type')
emit('submit')
</script>
```

### R5: 泛型参数命名遵循 T/K/V 约定
**级别**: 推荐
**描述**: 泛型参数使用大写字母约定：`T` 表示通用类型，`K` 表示键类型，`V` 表示值类型，`E` 表示元素类型，多参数用描述性名称。
**正例**:
```ts
// 标准约定
function identity<T>(value: T): T {
  return value
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 多个泛型参数时使用描述性名称
interface Repository<TEntity, TCreateDto, TUpdateDto> {
  findById(id: number): Promise<TEntity>
  create(dto: TCreateDto): Promise<TEntity>
  update(id: number, dto: TUpdateDto): Promise<TEntity>
}
```
**反例**:
```ts
// 泛型命名不清晰
function identity<MYTYPE>(value: MYTYPE): MYTYPE {
  return value
}

// 单字母不够语义时仍用单字母
interface Store<A, B, C> { // A、B、C 含义不明
  getData(): A
  saveData(data: B): C
}
```

### R6: 优先使用 as const 而非 enum
**级别**: 推荐
**描述**: 对于常量集合，优先使用 `as const` 断言获得类型安全的字面量联合类型，减少编译产物体积。
**正例**:
```ts
// as const 方式：零运行时开销
const ROLE = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const

type Role = typeof ROLE[keyof typeof ROLE]
// Role 类型为 'admin' | 'editor' | 'viewer'

const STATUS = ['active', 'inactive', 'pending'] as const
type Status = typeof STATUS[number]
// Status 类型为 'active' | 'inactive' | 'pending'
```
**反例**:
```ts
// 使用 enum 会生成额外的运行时代码
enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// 数字枚举更糟糕，会产生双向映射
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
// 编译产物中会生成 Direction[0] = "Up" 的反向映射
```

### R7: 使用类型守卫进行类型收窄
**级别**: 推荐
**描述**: 使用类型守卫（type guard）函数或 `typeof`/`instanceof`/`in` 运算符收窄类型，避免不安全的类型断言。
**正例**:
```ts
// 自定义类型守卫
interface Dog { bark(): void; type: 'dog' }
interface Cat { meow(): void; type: 'cat' }
type Pet = Dog | Cat

function isDog(pet: Pet): pet is Dog {
  return pet.type === 'dog'
}

function handlePet(pet: Pet): void {
  if (isDog(pet)) {
    pet.bark()  // TypeScript 知道 pet 是 Dog
  } else {
    pet.meow()  // TypeScript 知道 pet 是 Cat
  }
}

// 使用 in 运算符
function process(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()) // 收窄为 string
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2))    // 收窄为 number
  }
}
```
**反例**:
```ts
// 不安全的类型断言，绕过类型检查
function handlePet(pet: Pet): void {
  const dog = pet as Dog // 强制断言，运行时可能出错
  dog.bark()
}

function process(value: unknown): void {
  // 不做类型判断直接断言
  ;(value as string).toUpperCase()
}
```

### R8: 启用 TypeScript strict 模式
**级别**: 必须
**描述**: `tsconfig.json` 中必须启用 `strict: true`，确保最大程度的类型安全。
**正例**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```
**反例**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### R9: 使用 import type 导入类型
**级别**: 推荐
**描述**: 纯类型导入使用 `import type` 语法，明确标识类型依赖，确保编译时被完全擦除。
**正例**:
```ts
// 纯类型导入
import type { User, UserRole } from '@/types/user'
import type { ApiResponse, PageResult } from '@/types/api'

// 混合导入时分开写
import { ref, computed, type ComputedRef } from 'vue'
import { fetchUsers, type UserListParams } from '@/api/user'
```
**反例**:
```ts
// 类型导入和值导入混在一起
import { User, UserRole } from '@/types/user' // User 是纯类型但没标注

// 全部放在一个 import，难以区分哪些是类型
import { ref, computed, ComputedRef } from 'vue' // ComputedRef 是类型
```

### R10: 禁止使用 any，用 unknown 替代
**级别**: 必须
**描述**: 禁止使用 `any` 类型，它会完全关闭类型检查。类型不确定时使用 `unknown`，迫使使用者做类型收窄。
**正例**:
```ts
// 使用 unknown，强制类型检查
function parseJSON(str: string): unknown {
  return JSON.parse(str)
}

// 使用时必须先做类型判断
const data: unknown = parseJSON('{"name":"Alice"}')
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as { name: string }).name)
}

// 第三方库无法避免时使用 // eslint-disable 注释并加注释说明
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyResult: any = someLegacyLibrary.getData()
```
**反例**:
```ts
// 使用 any 完全绕过类型检查
function parseJSON(str: string): any {
  return JSON.parse(str)
}

const data: any = parseJSON('{"name":"Alice"}')
data.nonExistentMethod() // 编译不报错，运行时崩溃

// 随意标注 any
const userList: any[] = await fetchUsers()
function handleClick(event: any): void {
  // ...
}
```