# Vue3 - 项目目录结构约定

## 适用范围
- 适用于所有基于 Vite + Vue3 + TypeScript 的前端项目
- 与组件编写规范、状态管理规范配合使用
- 适用于中大型业务项目，小型项目可适当简化

## 规则

### R1: Vite + Vue3 标准目录结构
**级别**: 必须
**描述**: 项目根目录包含 Vite 配置、TypeScript 配置和标准 `src` 目录，使用 `index.html` 作为入口。
**正例**:
```
my-vue-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .env
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── public/
│   └── favicon.ico
└── src/
    ├── App.vue
    ├── main.ts
    └── ...
```
**反例**:
```
my-vue-app/
├── public/
│   └── index.html      # 不应放在 public 中
├── src/
│   ├── config/
│   │   └── vite.js      # Vite 配置不应在 src 中
│   ├── App.vue
│   └── main.js          # 缺少 TypeScript
├── vite.config.js       # 应使用 .ts
└── tsconfig.json
```

### R2: src 子目录职责划分
**级别**: 必须
**描述**: `src` 目录下按职责划分子目录，每个目录有明确的职责边界。
**正例**:
```
src/
├── api/            # 接口请求，按模块分文件
├── assets/         # 静态资源（图片、字体等，会被构建处理）
├── components/     # 通用组件
├── composables/    # 组合式函数（useXxx.ts）
├── constants/      # 常量定义
├── directives/     # 自定义指令
├── layouts/        # 布局组件
├── pages/          # 页面级组件（或 views/）
├── plugins/        # 插件配置
├── router/         # 路由配置
├── stores/         # Pinia Store
├── styles/         # 全局样式
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
├── App.vue
└── main.ts
```
**反例**:
```
src/
├── components/     # 组件、页面、布局混在一起
│   ├── Header.vue
│   ├── LoginPage.vue
│   └── AdminLayout.vue
├── helpers/        # helpers 和 utils 概念重复
├── services/       # services 和 api 概念重复
├── store/          # 命名不统一（store vs stores）
├── style/          # 命名不统一（style vs styles）
└── types.ts        # 所有类型堆在一个文件
```

### R3: 路由模块化拆分
**级别**: 推荐
**描述**: 路由按业务模块拆分为独立文件，主路由文件只负责汇总和全局配置。
**正例**:
```
router/
├── index.ts            # 主路由入口，创建 router 实例
├── guards.ts           # 全局路由守卫
├── routes/
│   ├── index.ts        # 汇总所有模块路由
│   ├── user.ts         # 用户模块路由
│   ├── product.ts      # 商品模块路由
│   └── admin.ts        # 管理后台路由
└── types.ts            # 路由元信息类型扩展
```
```ts
// router/routes/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/pages/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
]

export default userRoutes
```
**反例**:
```ts
// router/index.ts 所有路由堆在一个文件
const routes = [
  { path: '/', component: Home },
  { path: '/user/profile', component: UserProfile },
  { path: '/user/settings', component: UserSettings },
  { path: '/product/list', component: ProductList },
  { path: '/product/detail/:id', component: ProductDetail },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/users', component: AdminUsers },
  // ... 几百行路由定义
]
```

### R4: 环境变量使用 .env 文件
**级别**: 必须
**描述**: 环境变量通过 `.env` 文件管理，Vite 项目中以 `VITE_` 前缀暴露到客户端，配合 `ImportMetaEnv` 类型定义。
**正例**:
```
# .env.development
VITE_APP_TITLE=MyApp Dev
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_MOCK=true

# .env.production
VITE_APP_TITLE=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK=false
```
```ts
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```
**反例**:
```
# .env 不使用 VITE_ 前缀
API_BASE_URL=http://localhost:3000   # 在客户端中无法访问
SECRET_KEY=abc123                     # 敏感信息不应放在 .env 中暴露给客户端
```

### R5: 组件按用途分组
**级别**: 推荐
**描述**: 组件按用途分为通用组件（components）、业务组件、页面组件（pages/views）和布局组件（layouts），各目录职责明确。
**正例**:
```
src/
├── components/              # 通用基础组件，无业务逻辑
│   ├── Button/
│   │   └── index.vue
│   ├── Modal/
│   │   └── index.vue
│   └── Table/
│       └── index.vue
├── layouts/                 # 布局组件
│   ├── DefaultLayout.vue
│   └── AdminLayout.vue
├── pages/                   # 页面组件，与路由对应
│   ├── user/
│   │   ├── Profile.vue
│   │   └── Settings.vue
│   └── product/
│       ├── List.vue
│       └── Detail.vue
└── components/              # 业务组件可放在 pages 同级
    └── business/
        ├── UserCard.vue
        └── ProductFilter.vue
```
**反例**:
```
src/
├── components/          # 所有组件混在一起
│   ├── Button.vue       # 基础组件
│   ├── DefaultLayout.vue # 布局组件
│   ├── LoginPage.vue    # 页面组件
│   └── UserCard.vue     # 业务组件
├── views/               # components 和 views 语义重叠
│   ├── ButtonView.vue
│   └── LoginView.vue
```

### R6: API 模块化管理
**级别**: 必须
**描述**: API 请求按业务模块拆分文件，统一使用封装后的请求工具，不直接在组件中使用 axios。
**正例**:
```
api/
├── index.ts          # 统一导出
├── request.ts        # axios 实例封装、拦截器
├── user.ts           # 用户相关接口
├── product.ts        # 商品相关接口
└── types.ts          # 接口请求/响应类型
```
```ts
// api/request.ts
import axios from 'axios'
import type { ApiResponse } from './types'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

// api/user.ts
import request from './request'
import type { ApiResponse, LoginParams, User } from './types'

export function login(params: LoginParams): Promise<ApiResponse<{ token: string }>> {
  return request.post('/auth/login', params)
}

export function getUserInfo(): Promise<ApiResponse<User>> {
  return request.get('/user/info')
}
```
**反例**:
```vue
<!-- 组件内直接调用 axios -->
<script setup lang="ts">
import axios from 'axios'

const fetchUsers = async () => {
  const res = await axios.get('http://localhost:3000/api/users') // 硬编码 URL
  return res.data
}
</script>
```

### R7: utils 按职责拆分工具函数
**级别**: 推荐
**描述**: 工具函数按职责拆分为独立文件，每个文件只包含一类工具函数，避免创建大杂烩文件。
**正例**:
```
utils/
├── date.ts          # 日期格式化、计算
├── format.ts        # 数字、字符串格式化
├── storage.ts       # localStorage/sessionStorage 封装
├── validator.ts     # 表单验证规则
├── dom.ts           # DOM 操作工具
└── index.ts         # 统一导出
```
```ts
// utils/date.ts
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  // 格式化实现
  return formatted
}

export function getTimeAgo(date: Date | string): string {
  // 相对时间计算
  return relative
}
```
**反例**:
```ts
// utils/index.ts 所有工具函数堆在一个文件
export function formatDate() { /* ... */ }
export function formatMoney() { /* ... */ }
export function setStorage() { /* ... */ }
export function validateEmail() { /* ... */ }
export function getElement() { /* ... */ }
// ... 几百行代码
```

### R8: TypeScript 类型集中管理
**级别**: 推荐
**描述**: 全局通用的类型定义集中在 `types` 目录，按业务或功能分文件。组件专属类型就近定义。
**正例**:
```
types/
├── api.d.ts         # API 通用响应类型
├── user.d.ts        # 用户相关类型
├── product.d.ts     # 商品相关类型
├── env.d.ts         # 环境变量类型
└── global.d.ts      # 全局类型扩展
```
```ts
// types/api.d.ts
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 组件专属类型就近定义
// pages/user/Profile.vue
interface Props {
  userId: number
  editable?: boolean
}
```
**反例**:
```ts
// 所有类型定义在一个巨大的 global.d.ts 中
declare interface User { /* ... */ }
declare interface Product { /* ... */ }
declare interface Order { /* ... */ }
declare interface ApiResponse { /* ... */ }
// 几百行，无组织

// 组件内重复定义
// A.vue
interface User { id: number; name: string }
// B.vue
interface User { id: number; name: string } // 重复定义
```

### R9: 静态资源统一管理
**级别**: 推荐
**描述**: 静态资源按类型存放在 `assets` 目录下的子目录中，构建工具处理的资源用 `assets`，不变的资源放 `public`。
**正例**:
```
src/assets/
├── images/
│   ├── logo.svg
│   ├── empty-state.png
│   └── icons/
│       ├── arrow.svg
│       └── check.svg
├── fonts/
│   └── custom-font.woff2
└── styles/
    ├── variables.less
    ├── mixins.less
    └── reset.css

public/
├── favicon.ico       # 不变的资源
└── robots.txt        # SEO 文件
```
```vue
<!-- 引用 assets 资源会被构建处理（hash、优化） -->
<template>
  <img :src="logoUrl" alt="Logo" />
</template>

<script setup lang="ts">
import logoUrl from '@/assets/images/logo.svg'
</script>
```
**反例**:
```
src/
├── logo.svg           # 图片散落在 src 根目录
├── components/
│   ├── Header.vue
│   └── header-bg.png  # 图片和组件混放
└── pages/
    └── home-bg.png    # 图片散落在页面目录

<!-- 使用绝对路径引用，不受构建处理 -->
<img src="/src/assets/images/logo.svg" />
```

### R10: 使用 @ 别名简化路径引用
**级别**: 必须
**描述**: 在 `vite.config.ts` 和 `tsconfig.json` 中配置 `@` 指向 `src` 目录，避免使用 `../../../` 相对路径。
**正例**:
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
```ts
// 使用 @ 别名
import { useUserStore } from '@/stores/useUserStore'
import Button from '@/components/Button/index.vue'
import { formatDate } from '@/utils/date'
import type { User } from '@/types/user'
```
**反例**:
```ts
// 使用多层相对路径
import { useUserStore } from '../../../stores/useUserStore'
import Button from '../../components/Button/index.vue'
import { formatDate } from '../../utils/date'
// 文件移动后大量路径需要修改
```