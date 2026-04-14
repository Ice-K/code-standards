# Vue3 - 组件编写规范

## 适用范围
- 适用于所有基于 Vue3 的项目组件编写
- 使用 `<script setup>` + TypeScript 组合式语法
- 与 Composition API 规范、TypeScript 使用规范配合使用

## 规则

### R1: 组件文件使用 PascalCase 命名
**级别**: 必须
**描述**: 组件文件名使用 PascalCase 风格，每个单词首字母大写，与组件注册名保持一致。
**正例**:
```
components/
├── UserProfile.vue
├── SearchBar.vue
├── TodoList.vue
└── DatePicker.vue
```
**反例**:
```
components/
├── userProfile.vue
├── search-bar.vue
├── todolist.vue
└── date_picker.vue
```

### R2: 使用 script setup + TypeScript
**级别**: 必须
**描述**: 组件必须使用 `<script setup lang="ts">` 语法糖，充分利用编译时类型检查。
**正例**:
```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
const increment = (): void => {
  count.value++
}
</script>
```
**反例**:
```vue
<script>
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

### R3: defineProps 配合 TS interface 定义
**级别**: 必须
**描述**: 使用 `defineProps` 泛型方式声明 props，配合 TypeScript interface 明确类型约束。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0,
  },
})
</script>
```

### R4: defineEmits 配合 TS 泛型定义
**级别**: 必须
**描述**: 使用 `defineEmits` 的泛型签名声明事件，明确事件名与参数类型。
**正例**:
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', id: number): void
  (e: 'delete', id: number, reason: string): void
  (e: 'change', value: string): void
}>()

const handleDelete = (): void => {
  emit('delete', props.id, 'expired')
}
</script>
```
**反例**:
```vue
<script setup lang="ts">
const emit = defineEmits(['update', 'delete', 'change'])

const handleDelete = () => {
  emit('delete') // 参数丢失，类型不安全
}
</script>
```

### R5: 组件目录结构组织
**级别**: 推荐
**描述**: 复杂组件采用目录结构，`index.vue` 为入口，配套文件就近放置。
**正例**:
```
components/
├── SearchBar/
│   ├── index.vue
│   ├── SearchBar.types.ts
│   ├── useSearchBar.ts
│   └── SearchBar.module.less
├── UserProfile.vue        # 简单组件可直接单文件
└── index.ts               # 统一导出
```
**反例**:
```
components/
├── SearchBar.vue
├── SearchBarTypes.ts       # 类型和组件分离太远
├── search-helper.ts        # 命名混乱，不关联
├── UserProfile.vue
└── types.ts                # 所有类型堆在一个文件
```

### R6: props 默认值使用 withDefaults
**级别**: 必须
**描述**: 当 props 有可选属性时，使用 `withDefaults` 设置默认值，不使用运行时声明方式。
**正例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  pageSize?: number
  disabled?: boolean
  tags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  disabled: false,
  tags: () => ['default'],
})
</script>
```
**反例**:
```vue
<script setup lang="ts">
interface Props {
  title: string
  pageSize?: number
}

const props = defineProps<Props>()
// 不设置默认值，使用时需要反复判断 undefined
const size = props.pageSize ?? 10
const size2 = props.pageSize !== undefined ? props.pageSize : 10
</script>
```

### R7: 使用 defineOptions 设置组件名
**级别**: 推荐
**描述**: 在需要组件名的场景（如 keep-alive、devtools 调试）下，使用 `defineOptions` 设置 name。
**正例**:
```vue
<script setup lang="ts">
defineOptions({
  name: 'UserProfile',
  inheritAttrs: false,
})

interface Props {
  userId: number
}
defineProps<Props>()
</script>
```
**反例**:
```vue
<script lang="ts">
// 额外使用普通 script 只为设置 name
export default {
  name: 'UserProfile',
}
</script>

<script setup lang="ts">
defineProps<{
  userId: number
}>()
</script>
```

### R8: v-slot 使用具名插槽
**级别**: 推荐
**描述**: 使用 `v-slot:name` 或 `#name` 语法声明具名插槽，默认插槽使用 `#default`，避免使用废弃的 `slot` 属性。
**正例**:
```vue
<!-- 父组件 -->
<template>
  <Card>
    <template #header>
      <h2>标题</h2>
    </template>
    <template #default>
      <p>内容区域</p>
    </template>
    <template #footer="{ actions }">
      <Button @click="actions.save">保存</Button>
    </template>
  </Card>
</template>
```
**反例**:
```vue
<!-- 父组件 -->
<template>
  <Card>
    <template v-slot:header>
      <h2>标题</h2>
    </template>
    <!-- 不使用 #default 而是直接写内容与具名插槽混用 -->
    <p>内容区域</p>
    <!-- 使用废弃语法 -->
    <div slot="footer">底部</div>
  </Card>
</template>
```

### R9: 使用 scoped 限定样式作用域
**级别**: 必须
**描述**: 组件样式必须添加 `scoped` 属性，避免样式泄漏影响全局。如需覆盖子组件样式，使用 `:deep()` 选择器。
**正例**:
```vue
<template>
  <div class="user-card">
    <h3 class="user-card__name">{{ name }}</h3>
    <ChildComponent class="child" />
  </div>
</template>

<style scoped>
.user-card {
  padding: 16px;
}

.user-card__name {
  font-size: 18px;
}

/* 需要 override 子组件样式时使用 :deep() */
.user-card :deep(.child__inner) {
  color: red;
}
</style>
```
**反例**:
```vue
<template>
  <div class="user-card">
    <h3>{{ name }}</h3>
  </div>
</template>

<style>
/* 无 scoped，样式污染全局 */
.user-card h3 {
  font-size: 18px;
}

/* 使用废弃的 >>> 或 /deep/ */
.user-card >>> .child-inner {
  color: red;
}
</style>
```

### R10: 模板中不写复杂表达式
**级别**: 推荐
**描述**: template 中只写简单表达式（属性访问、函数调用、三元运算），复杂逻辑抽取到 computed 或方法中。
**正例**:
```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  price: number
  discount: number
  taxRate: number
}>()

const finalPrice = computed((): string => {
  const discounted = props.price * (1 - props.discount)
  const withTax = discounted * (1 + props.taxRate)
  return withTax.toFixed(2)
})
</script>

<template>
  <span>{{ finalPrice }}</span>
</template>
```
**反例**:
```vue
<template>
  <!-- 复杂计算直接写在模板中 -->
  <span>{{ (price * (1 - discount) * (1 + taxRate)).toFixed(2) }}</span>
</template>
```

### R11: v-for 必须绑定 key
**级别**: 必须
**描述**: 使用 `v-for` 渲染列表时必须绑定唯一的 `key`，优先使用数据 id，禁止使用 index。
**正例**:
```vue
<template>
  <div
    v-for="item in todoList"
    :key="item.id"
    class="todo-item"
  >
    {{ item.text }}
  </div>
</template>
```
**反例**:
```vue
<template>
  <!-- 无 key -->
  <div v-for="item in todoList" class="todo-item">
    {{ item.text }}
  </div>

  <!-- 使用 index 作为 key -->
  <div
    v-for="(item, index) in todoList"
    :key="index"
    class="todo-item"
  >
    {{ item.text }}
  </div>
</template>
```

### R12: 优先使用 props 和 emit 通信
**级别**: 必须
**描述**: 父子组件间优先通过 props 向下传数据、emit 向上发事件。避免使用 provide/inject、事件总线、全局状态等方式替代基础通信。
**正例**:
```vue
<!-- 子组件 TodoItem.vue -->
<script setup lang="ts">
interface Props {
  todo: { id: number; text: string; done: boolean }
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle', id: number): void
  (e: 'remove', id: number): void
}>()
</script>

<template>
  <div class="todo-item" @click="emit('toggle', todo.id)">
    <span>{{ todo.text }}</span>
    <button @click.stop="emit('remove', todo.id)">删除</button>
  </div>
</template>
```
**反例**:
```vue
<!-- 子组件直接修改 props 或使用全局事件 -->
<script setup lang="ts">
import { useTodoStore } from '@/stores/todo'

const props = defineProps<{ todo: any }>()
const todoStore = useTodoStore()

// 直接调用 store 方法，绕过 props/emit 通信
const handleRemove = () => {
  todoStore.removeTodo(props.todo.id)
}
</script>
```