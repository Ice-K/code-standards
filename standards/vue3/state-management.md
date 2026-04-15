---
id: vue3-state-management
title: Vue3 - Pinia 状态管理规范
tags: [vue3, pinia, store, state, persistence]
trigger:
  extensions: [.ts]
  frameworks: [vue3]
skip:
  keywords: [配置文件, yml, properties, SQL, Mapper, 后端, REST, 接口]
---

# Vue3 - Pinia 状态管理规范

## 适用范围
- 适用于所有 Vue3 项目中使用 Pinia 进行全局状态管理的场景
- 禁止在新项目中使用 Vuex
- 与组件编写规范、Composition API 规范配合使用

## 规则

### R1: 使用 Setup Store 风格定义 Store
**级别**: 推荐
**描述**: Store 定义优先使用 Setup Store（函数式）风格，与 Composition API 风格一致，更灵活且类型推导更好。
**正例**:
```ts
// stores/useUserStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<User | null>(null)
  const token = ref<string>('')

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name ?? '未登录')

  // actions
  const login = async (credentials: LoginParams): Promise<void> => {
    const res = await loginApi(credentials)
    token.value = res.data.token
    userInfo.value = res.data.user
  }

  const logout = (): void => {
    token.value = ''
    userInfo.value = null
  }

  return { userInfo, token, isLoggedIn, userName, login, logout }
})
```
**反例**:
```ts
// Options Store 风格，与 Composition API 不一致
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as User | null,
    token: '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    login(credentials: LoginParams) {
      // this 指向不够直观
    },
  },
})
```

### R2: Store 命名使用 useXxxStore 格式
**级别**: 必须
**描述**: Store 文件名和导出函数名统一为 `useXxxStore` 格式，与 composable 命名风格一致。
**正例**:
```
stores/
├── useUserStore.ts
├── useCartStore.ts
├── useAppStore.ts
└── index.ts
```
```ts
// stores/useUserStore.ts
export const useUserStore = defineStore('user', () => { /* ... */ })

// stores/useCartStore.ts
export const useCartStore = defineStore('cart', () => { /* ... */ })
```
**反例**:
```
stores/
├── user.ts           // 文件名无 use 前缀
├── cart-store.ts     // 使用 kebab-case
├── store.ts          // 笼统命名
```
```ts
// 导出名与文件名不匹配
export const userStore = defineStore('user', () => { /* ... */ })
export const useCart = defineStore('cart', () => { /* ... */ }) // 缺少 Store 后缀
```

### R3: State/Getters/Actions 职责分离
**级别**: 必须
**描述**: State 存储原始数据，Getters 派生计算值，Actions 处理业务逻辑和异步操作。不要在 getter 中修改状态，不要在 state 中存储可计算的值。
**正例**:
```ts
export const useCartStore = defineStore('cart', () => {
  // state：原始数据
  const items = ref<CartItem[]>([])
  const discount = ref(0)

  // getters：派生计算
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  const finalPrice = computed(() => totalPrice.value * (1 - discount.value))
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  // actions：业务逻辑
  const addItem = (item: CartItem): void => {
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push(item)
    }
  }

  return { items, discount, totalPrice, finalPrice, itemCount, addItem }
})
```
**反例**:
```ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // 不应在 state 中存储可计算值
  const totalPrice = ref(0)

  // 手动同步计算，容易遗漏
  const addItem = (item: CartItem): void => {
    items.value.push(item)
    totalPrice.value = items.value.reduce((sum, i) => sum + i.price, 0)
  }

  return { items, totalPrice, addItem }
})
```

### R4: 异步 Action 使用 async/await
**级别**: 必须
**描述**: Store 中的异步操作使用 `async/await` 语法，配合 try/catch 处理错误，避免嵌套回调和 `.then()` 链。
**正例**:
```ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUser = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const res = await getUserById(id)
      userInfo.value = res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { userInfo, loading, error, fetchUser }
})
```
**反例**:
```ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)

  // 使用 .then 链式调用
  const fetchUser = (id: number): void => {
    getUserById(id).then((res) => {
      userInfo.value = res.data
    }).catch((err) => {
      console.log(err) // 仅打印，未正确处理错误
    })
  }

  return { userInfo, fetchUser }
})
```

### R5: Store 之间可组合复用
**级别**: 推荐
**描述**: 一个 Store 可以在另一个 Store 中使用，实现跨 Store 逻辑复用，避免重复代码。
**正例**:
```ts
// stores/useCartStore.ts
import { useUserStore } from './useUserStore'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const userStore = useUserStore()

  const checkout = async (): Promise<OrderResult> => {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    const res = await createOrder({
      userId: userStore.userInfo!.id,
      items: items.value,
    })
    items.value = []
    return res.data
  }

  return { items, checkout }
})
```
**反例**:
```ts
// 在 Store 中绕回组件层获取数据
export const useCartStore = defineStore('cart', () => {
  const checkout = async (): Promise<void> => {
    // 直接调用 localStorage，绕过 UserStore
    const userId = localStorage.getItem('userId')
    if (!userId) throw new Error('请先登录')
    await createOrder({ userId: Number(userId), items: items.value })
  }
  return { checkout }
})
```

### R6: 使用 storeToRefs 解构 Store
**级别**: 必须
**描述**: 在组件中解构 Store 的 state 和 getters 时，使用 `storeToRefs` 保持响应性。Actions 可以直接解构。
**正例**:
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// state 和 getters 用 storeToRefs 保持响应性
const { userInfo, isLoggedIn, userName } = storeToRefs(userStore)

// actions 直接解构即可
const { login, logout } = userStore
</script>

<template>
  <div v-if="isLoggedIn">{{ userName }}</div>
</template>
```
**反例**:
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

// 直接解构 state，丢失响应性
const { userInfo, isLoggedIn } = userStore
// userInfo 和 isLoggedIn 不再是响应式的
</script>
```

### R7: 不在组件外部直接使用 Store
**级别**: 必须
**描述**: Store 实例依赖 Vue 的响应式系统，在组件 setup 或插件安装完成之前不应调用 `useXxxStore()`。在路由守卫、axios 拦截器等场景中应延迟获取。
**正例**:
```ts
// router/index.ts
import { useUserStore } from '@/stores/useUserStore'

router.beforeEach((to) => {
  // 在路由守卫回调内获取 store，此时 Pinia 已安装
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  }
})
```
**反例**:
```ts
// router/index.ts
import { useUserStore } from '@/stores/useUserStore'

// 在模块顶层直接调用，此时 Pinia 可能尚未安装
const userStore = useUserStore() // 报错：getActivePinia was called with no active Pinia

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  }
})
```

### R8: 按功能模块拆分 Store
**级别**: 推荐
**描述**: 按业务功能拆分 Store，每个 Store 职责单一。避免创建一个巨大的全局 Store。
**正例**:
```
stores/
├── useUserStore.ts       # 用户信息、登录状态
├── useCartStore.ts       # 购物车
├── useAppStore.ts        # 全局应用状态（主题、语言、侧边栏）
├── usePermissionStore.ts # 权限、菜单
└── index.ts              # 统一导出
```
**反例**:
```
stores/
├── useStore.ts           # 一个巨大 Store 包含所有状态
└── index.ts
```
```ts
// 所有状态堆在一个 Store 中
export const useStore = defineStore('app', () => {
  const user = ref(null)
  const cart = ref([])
  const theme = ref('dark')
  const menu = ref([])
  const permissions = ref([])
  const notifications = ref([])
  // ... 几百行代码
  return { user, cart, theme, menu, permissions, notifications }
})
```

### R9: 持久化使用 pinia-plugin-persistedstate
**级别**: 建议
**描述**: 需要持久化的 Store 使用 `pinia-plugin-persistedstate` 插件，按需配置持久化字段，避免全量持久化敏感数据。
**正例**:
```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<User | null>(null)
  const preferences = ref({ theme: 'light', lang: 'zh' })

  return { token, userInfo, preferences }
}, {
  persist: {
    key: 'app-user',
    pick: ['token', 'preferences'], // 只持久化必要字段
    // 不持久化 userInfo（可能含敏感信息）
    storage: localStorage,
  },
})
```
**反例**:
```ts
// 手动实现持久化
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')

  const setToken = (val: string): void => {
    token.value = val
    localStorage.setItem('token', val) // 手动同步，容易遗漏
  }

  const clearToken = (): void => {
    token.value = ''
    // 忘记清除 localStorage
  }

  return { token, setToken, clearToken }
})

// 全量持久化（包含敏感数据）
}, {
  persist: true, // 所有字段都持久化，包括敏感信息
})
```

### R10: 使用 $reset 重置 Store 状态
**级别**: 推荐
**描述**: 需要重置 Store 到初始状态时使用 `$reset()` 方法。Setup Store 需要自行实现重置逻辑。
**正例**:
```ts
// Setup Store 实现重置
export const useFilterStore = defineStore('filter', () => {
  const keyword = ref('')
  const category = ref('')
  const sortBy = ref('date')
  const page = ref(1)

  const initialState = {
    keyword: '',
    category: '',
    sortBy: 'date',
    page: 1,
  }

  const $reset = (): void => {
    keyword.value = initialState.keyword
    category.value = initialState.category
    sortBy.value = initialState.sortBy
    page.value = initialState.page
  }

  return { keyword, category, sortBy, page, $reset }
})

// 组件中使用
const filterStore = useFilterStore()
filterStore.$reset()
```
**反例**:
```ts
// 手动逐个重置，容易遗漏新增字段
const resetFilters = (): void => {
  filterStore.keyword = ''
  filterStore.category = ''
  // 忘记重置 sortBy
  filterStore.page = 1
}
```