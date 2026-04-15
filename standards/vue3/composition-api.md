---
id: vue3-composition-api
title: Vue3 - Composition API 规范
tags: [vue3, composition-api, ref, reactive, computed, watch]
trigger:
  extensions: [.vue, .ts]
  frameworks: [vue3]
skip:
  keywords: [SQL, Mapper, 数据库, 配置文件, yml, properties, 后端]
---

# Vue3 - Composition API 规范

## 适用范围
- 适用于所有 Vue3 项目中使用 Composition API 的场景
- 使用 `<script setup>` 语法糖
- 与组件编写规范、TypeScript 使用规范配合使用

## 规则

### R1: ref 用于基本类型，reactive 用于对象
**级别**: 必须
**描述**: 基本类型（string、number、boolean）使用 `ref`，对象类型使用 `reactive`。在 composable 返回值中统一使用 `ref` 保持一致性。
**正例**:
```ts
import { ref, reactive } from 'vue'

// 基本类型用 ref
const count = ref(0)
const message = ref('hello')
const isActive = ref(false)

// 对象用 reactive
const form = reactive({
  username: '',
  password: '',
  remember: false,
})
```
**反例**:
```ts
import { ref, reactive } from 'vue'

// 基本类型用 reactive（不合法，reactive 只接受对象）
const count = reactive(0) // 警告：不能用于基本类型

// 简单对象用 ref 包裹（不必要的 .value 访问）
const form = ref({
  username: '',
  password: '',
})
// 每次都要 form.value.username
```

### R2: 合理使用 computed 缓存计算属性
**级别**: 必须
**描述**: `computed` 具有缓存特性，只在依赖变化时重新计算。需要缓存的派生数据用 `computed`，每次都需要重新执行的逻辑用普通函数。
**正例**:
```ts
import { ref, computed } from 'vue'

const items = ref<Item[]>([])

// 依赖不变时不会重新计算，自动缓存
const activeItems = computed(() => items.value.filter(item => item.active))
const totalCount = computed(() => items.value.length)

// 需要接受参数且不缓存时使用普通函数
const getItemById = (id: number) => items.value.find(item => item.id === id)
```
**反例**:
```ts
import { ref } from 'vue'

const items = ref<Item[]>([])

// 用方法替代 computed，每次渲染都重新计算
const getActiveItems = () => items.value.filter(item => item.active)

// 在 computed 中执行副作用
const badComputed = computed(() => {
  console.log('side effect') // 不应在 computed 中产生副作用
  return items.value.filter(item => item.active)
})
```

### R3: watch 与 watchEffect 的选择
**级别**: 推荐
**描述**: 需要明确监听特定数据源时用 `watch`；需要自动追踪回调内所有响应式依赖时用 `watchEffect`。优先使用 `watch`，因其更明确可控。
**正例**:
```ts
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')
const page = ref(1)

// watch：明确指定监听源，可访问新值和旧值
watch([keyword, page], ([newKeyword, newPage], [oldKeyword, oldPage]) => {
  if (newKeyword !== oldKeyword) {
    page.value = 1 // 关键词变化时重置页码
  }
  fetchData(newKeyword, newPage)
})

// watchEffect：自动追踪依赖，适合初始化时立即执行
watchEffect(() => {
  console.log(`当前关键词: ${keyword.value}, 页码: ${page.value}`)
})
```
**反例**:
```ts
import { ref, watchEffect } from 'vue'

const keyword = ref('')
const page = ref(1)

// 用 watchEffect 替代 watch，无法获取旧值，无法做条件判断
watchEffect(() => {
  // 无法判断是 keyword 变了还是 page 变了
  fetchData(keyword.value, page.value)
})

// 用 watch 监听过多不相关数据
const theme = ref('dark')
const lang = ref('zh')
watch([keyword, page, theme, lang], () => {
  // theme 和 lang 变化不该触发数据请求
  fetchData(keyword.value, page.value)
})
```

### R4: 生命周期钩子使用规范
**级别**: 推荐
**描述**: 在 `setup` 中使用 `onMounted`、`onUnmounted` 等钩子函数，保持成对使用（如 `onMounted` 与 `onUnmounted` 配对清理资源）。
**正例**:
```ts
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    refreshData()
  }, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// keep-alive 组件使用 activated/deactivated
onActivated(() => {
  refreshData()
})
```
**反例**:
```ts
// 在 setup 外使用 Options API 钩子
export default {
  mounted() {
    this.timer = setInterval(() => this.refreshData(), 30000)
  },
}

// 只注册不清除
import { onMounted } from 'vue'

onMounted(() => {
  const timer = setInterval(() => refreshData(), 30000)
  // 缺少 onUnmounted 清理，组件卸载后定时器仍在运行
})
```

### R5: Composable 函数以 use 前缀命名
**级别**: 必须
**描述**: 自定义组合式函数统一以 `use` 前缀命名（如 `useUserList`、`usePagination`），文件名与函数名保持一致。
**正例**:
```ts
// composables/usePagination.ts
import { ref, computed, type ComputedRef } from 'vue'

interface PaginationOptions {
  pageSize?: number
  total?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const currentPage = ref(1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(options.total ?? 0)

  const totalPages: ComputedRef<number> = computed(() =>
    Math.ceil(total.value / pageSize.value)
  )

  const setPage = (page: number): void => {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  return { currentPage, pageSize, total, totalPages, setPage }
}
```
**反例**:
```ts
// composables/pagination.ts
export function getPagination() { // 缺少 use 前缀
  const currentPage = ref(1)
  return { currentPage }
}

// composables/usePag.ts  文件名与导出名不一致
export function usePagination() { /* ... */ }
```

### R6: 使用 toRefs 保持响应性
**级别**: 推荐
**描述**: 从 `reactive` 对象解构或从 composable 返回 reactive 属性时，使用 `toRefs` 保持响应性。从 `props` 解构时使用 `toRefs` 而非直接解构。
**正例**:
```ts
import { reactive, toRefs, toRef } from 'vue'

const state = reactive({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
})

// 使用 toRefs 解构保持响应性
const { name, age } = toRefs(state)
// name.value 仍然是响应式的

// 只取单个属性用 toRef
const email = toRef(state, 'email')
```
**反例**:
```ts
import { reactive } from 'vue'

const state = reactive({
  name: 'Alice',
  age: 25,
})

// 直接解构丢失响应性
const { name, age } = state
// name 和 age 变成普通值，不再是响应式
```

### R7: 不直接解构 reactive 对象
**级别**: 必须
**描述**: 对 `reactive` 对象直接解构会丢失响应性。需要解构时使用 `toRefs`，或将整个对象传递。
**正例**:
```vue
<script setup lang="ts">
import { reactive, toRefs } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

// 使用 toRefs 保持响应性
const { username, password } = toRefs(form)
</script>

<template>
  <input v-model="username" />
  <input v-model="password" />
</template>
```
**反例**:
```vue
<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

// 直接解构，失去响应性
const { username, password } = form
</script>

<template>
  <!-- v-model 绑定后无法更新 -->
  <input v-model="username" />
  <input v-model="password" />
</template>
```

### R8: 使用 shallowRef 优化大对象性能
**级别**: 建议
**描述**: 对于大型数据结构（如长列表、深嵌套对象），使用 `shallowRef` 避免深层响应式转换的开销。只在需要时手动触发更新。
**正例**:
```ts
import { shallowRef, triggerRef } from 'vue'

interface LargeData {
  items: Record<string, unknown>[]
  metadata: Record<string, unknown>
}

// 大型数据用 shallowRef，避免深层代理的性能开销
const largeList = shallowRef<LargeData>({ items: [], metadata: {} })

const updateItem = (index: number, newData: unknown): void => {
  const items = [...largeList.value.items]
  items[index] = newData as Record<string, unknown>
  largeList.value = { ...largeList.value, items }
  // 替换整个 value 自动触发更新，无需 triggerRef
}
```
**反例**:
```ts
import { ref } from 'vue'

// 大型列表用 ref，Vue 会递归代理每一项，性能浪费
const largeList = ref({
  items: new Array(10000).fill(null).map((_, i) => ({
    id: i,
    data: { /* 嵌套对象 */ },
  })),
  metadata: { /* 深层嵌套 */ },
})
```

### R9: nextTick 的正确使用场景
**级别**: 推荐
**描述**: 在需要操作 DOM 更新后的状态时使用 `nextTick`，如表单聚焦、获取元素尺寸、操作更新后的 DOM。
**正例**:
```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'

const showInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = async (): Promise<void> => {
  showInput.value = true
  // 等待 DOM 更新完成后再聚焦
  await nextTick()
  inputRef.value?.focus()
}

const list = ref<string[]>(['a', 'b', 'c'])

const addItem = async (item: string): Promise<void> => {
  list.value.push(item)
  await nextTick()
  // DOM 已更新，可以安全获取列表高度
  const container = document.querySelector('.list-container')
  container?.scrollTo({ top: container.scrollHeight })
}
</script>
```
**反例**:
```vue
<script setup lang="ts">
import { ref } from 'vue'

const showInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = (): void => {
  showInput.value = true
  // DOM 还未更新，inputRef 可能为 null
  inputRef.value?.focus()
}
</script>
```

### R10: 卸载时清理副作用
**级别**: 必须
**描述**: 在组件卸载时必须清理所有副作用，包括定时器、事件监听、WebSocket 连接、订阅等，避免内存泄漏。
**正例**:
```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(url: string) {
  const data = ref<string>('')
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    ws = new WebSocket(url)
    ws.onmessage = (event) => {
      data.value = event.data
    }
  })

  onUnmounted(() => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
  })

  return { data }
}
```
**反例**:
```ts
import { ref, onMounted } from 'vue'

export function useWebSocket(url: string) {
  const data = ref<string>('')

  onMounted(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      data.value = event.data
    }
    ws.onclose = () => {
      // 无限重连，组件卸载后仍在运行
      setTimeout(() => {
        const newWs = new WebSocket(url)
        // ...
      }, 3000)
    }
  })
  // 缺少 onUnmounted 清理
  return { data }
}
```