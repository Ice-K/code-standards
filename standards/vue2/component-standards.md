# Vue2 - Options API 组件编写规范

## 适用范围
- 适用于所有基于 Vue2 的项目组件编写
- 使用 Options API 风格
- 与 Vuex 状态管理规范、项目结构规范配合使用

## 规则

### R1: 组件属性声明顺序
**级别**: 必须
**描述**: 组件选项按固定顺序声明：name > components > props > data > computed > watch > methods > lifecycle hooks，保持团队一致性。
**正例**:
```vue
<script>
export default {
  name: 'UserProfile',

  components: {
    UserAvatar,
    UserCard,
  },

  props: {
    userId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      userInfo: null,
    }
  },

  computed: {
    displayName() {
      return this.userInfo?.name || '未知用户'
    },
  },

  watch: {
    userId(newVal) {
      this.fetchUser(newVal)
    },
  },

  methods: {
    async fetchUser(id) {
      this.loading = true
      this.userInfo = await getUserById(id)
      this.loading = false
    },
  },

  // 生命周期钩子按执行顺序排列
  created() {
    this.fetchUser(this.userId)
  },

  mounted() {
    this.initChart()
  },

  beforeDestroy() {
    this.destroyChart()
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  mounted() {        // 生命周期钩子位置混乱
    this.initChart()
  },
  data() {
    return { loading: false }
  },
  methods: {
    fetchUser() {}
  },
  name: 'UserProfile', // name 放在最后
  props: ['userId'],    // 缺少类型定义
  components: { UserAvatar },
  created() {
    this.fetchUser()
  },
  computed: {
    displayName() { return '' }
  },
}
</script>
```

### R2: props 必须包含 type 和 default
**级别**: 必须
**描述**: props 声明必须使用对象语法，包含 `type` 属性和合理的 `default` 值（非必填项）。引用类型默认值必须使用工厂函数。
**正例**:
```vue
<script>
export default {
  props: {
    // 基本类型
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'active',
      validator(value) {
        return ['active', 'inactive', 'pending'].includes(value)
      },
    },
    // 引用类型必须用工厂函数
    items: {
      type: Array,
      default() {
        return []
      },
    },
    config: {
      type: Object,
      default() {
        return { theme: 'light' }
      },
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  // 数组语法，无类型约束
  props: ['title', 'size', 'items'],

  // 缺少 default
  props: {
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      // 非必填但无 default
    },
  },

  // 引用类型直接给对象默认值
  props: {
    items: {
      type: Array,
      default: [],       // 应该用工厂函数
    },
    config: {
      type: Object,
      default: {},       // 所有实例共享同一个对象
    },
  },
}
</script>
```

### R3: 使用 $emit 声明自定义事件
**级别**: 必须
**描述**: 组件必须通过 `emits` 选项声明所有自定义事件，使组件接口清晰可追溯。
**正例**:
```vue
<script>
export default {
  name: 'TodoItem',

  emits: ['toggle', 'remove', 'update:title'],

  props: {
    todo: {
      type: Object,
      required: true,
    },
  },

  methods: {
    handleToggle() {
      this.$emit('toggle', this.todo.id)
    },
    handleRemove() {
      this.$emit('remove', this.todo.id)
    },
    handleTitleChange(newTitle) {
      this.$emit('update:title', newTitle)
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  // 缺少 emits 声明
  props: {
    todo: {
      type: Object,
      required: true,
    },
  },

  methods: {
    handleToggle() {
      // 直接修改 props（反模式）
      this.todo.done = !this.todo.done
      // emit 事件但不声明
      this.$emit('someEvent', this.todo.id, this.todo.done, this.todo.text)
    },
  },
}
</script>
```

### R4: v-model 自定义实现规范
**级别**: 推荐
**描述**: 自定义组件实现 v-model 时，默认使用 `value` prop 和 `input` 事件。Vue 2.2+ 可使用 `model` 选项自定义 prop 和 event 名称。
**正例**:
```vue
<!-- CustomInput.vue -->
<script>
export default {
  name: 'CustomInput',

  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)
    },
  },
}
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    @input="onInput"
  />
</template>
```
**反例**:
```vue
<!-- 不通过 props/emit 实现 v-model -->
<script>
export default {
  props: ['value'],

  methods: {
    onInput(event) {
      // 直接操作父组件数据
      this.$parent.formData.name = event.target.value
    },
  },
}
</script>
```

### R5: data 必须是函数
**级别**: 必须
**描述**: 组件的 `data` 选项必须是函数，返回独立的数据对象，避免多个组件实例共享同一数据。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      loading: false,
      errorMessage: '',
    }
  },
}
</script>
```
**反例**:
```vue
<script>
// data 是对象，所有实例共享
export default {
  data: {
    form: {
      username: '',
      password: '',
    },
    loading: false,
  },
}
</script>
```

### R6: computed 不应有副作用
**级别**: 必须
**描述**: 计算属性应是纯函数，不修改数据、不发起请求、不操作 DOM。副作用逻辑应放在 methods 或 watch 中。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      items: [],
      keyword: '',
    }
  },

  computed: {
    // 纯计算，无副作用
    filteredItems() {
      return this.items.filter(item =>
        item.name.includes(this.keyword)
      )
    },
    totalCount() {
      return this.items.length
    },
  },

  methods: {
    // 副作用放在 methods 中
    async fetchItems() {
      this.loading = true
      this.items = await getItems()
      this.loading = false
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  data() {
    return { items: [] }
  },

  computed: {
    filteredItems() {
      // 在 computed 中发起请求（副作用）
      fetch('/api/items').then(res => {
        this.items = res.data
      })
      return this.items
    },

    badComputed() {
      // 在 computed 中修改其他数据
      this.lastAccessTime = Date.now()
      return this.items.filter(i => i.active)
    },
  },
}
</script>
```

### R7: watch 合理使用 immediate 和 deep
**级别**: 推荐
**描述**: `watch` 按需使用 `immediate` 和 `deep` 选项。`deep` 监听开销较大，只对需要深层监听的对象使用。对象属性监听优先使用字符串路径。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      keyword: '',
      page: 1,
      form: {
        name: '',
        email: '',
        address: {
          city: '',
          street: '',
        },
      },
    }
  },

  watch: {
    // 简单监听，不需要 deep
    keyword(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.page = 1
        this.search()
      }
    },

    // 监听对象特定属性，用点号路径
    'form.address.city'(newVal) {
      this.fetchDistricts(newVal)
    },

    // 需要初始化执行时用 immediate
    userId: {
      handler(newVal) {
        this.fetchUser(newVal)
      },
      immediate: true,
    },

    // 只在确实需要完整对象对比时用 deep
    form: {
      handler(newVal) {
        this.validateForm(newVal)
        this.saveDraft(newVal)
      },
      deep: true,
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  watch: {
    // 所有 watch 都加 deep，性能浪费
    keyword: {
      handler() { this.search() },
      deep: true,   // keyword 是 string，无需 deep
      immediate: true,
    },

    // 监听整个 form 但只需要 city 变化
    form: {
      handler() {
        this.fetchDistricts(this.form.address.city)
      },
      deep: true, // 监听整个 form 过于宽泛
    },
  },
}
</script>
```

### R8: beforeDestroy 中清理资源
**级别**: 必须
**描述**: 在 `beforeDestroy` 钩子中清理定时器、事件监听、WebSocket 连接等资源，防止内存泄漏。
**正例**:
```vue
<script>
export default {
  data() {
    return {
      timer: null,
      resizeObserver: null,
    }
  },

  mounted() {
    this.timer = setInterval(() => {
      this.refreshData()
    }, 30000)

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize()
    })
    this.resizeObserver.observe(this.$el)

    window.addEventListener('resize', this.handleWindowResize)
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    window.removeEventListener('resize', this.handleWindowResize)
  },

  methods: {
    refreshData() { /* ... */ },
    handleResize() { /* ... */ },
    handleWindowResize() { /* ... */ },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  mounted() {
    setInterval(() => {
      this.refreshData()
    }, 30000) // 未保存引用，无法清除

    window.addEventListener('resize', this.handleResize)
    // 缺少 beforeDestroy 清理
  },
}
</script>
```

### R9: 使用 $refs 代替直接 DOM 操作
**级别**: 推荐
**描述**: 需要访问 DOM 元素时使用 `$refs` 引用，避免使用 `document.querySelector` 等直接 DOM 操作。
**正例**:
```vue
<template>
  <div>
    <input ref="searchInput" v-model="keyword" />
    <canvas ref="chartCanvas" />
  </div>
</template>

<script>
export default {
  methods: {
    focusInput() {
      this.$refs.searchInput?.focus()
    },

    initChart() {
      const canvas = this.$refs.chartCanvas
      if (canvas) {
        this.chart = new Chart(canvas, { /* config */ })
      }
    },

    scrollToTop() {
      this.$refs.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
    },
  },
}
</script>
```
**反例**:
```vue
<script>
export default {
  methods: {
    focusInput() {
      // 直接操作 DOM，可能选到其他组件的元素
      document.querySelector('.search-input').focus()
    },

    initChart() {
      const canvas = document.getElementById('chart')
      // 不安全，可能为 null 或选到错误元素
      new Chart(canvas, { /* config */ })
    },
  },
}
</script>
```

### R10: 避免使用 HTML 保留标签名作为组件名
**级别**: 必须
**描述**: 组件名不应与 HTML 保留标签名（如 `header`、`footer`、`section`、`main`、`nav`、`button`、`form`、`table`）冲突，避免 DOM 解析歧义。
**正例**:
```vue
<!-- 注册组件使用不冲突的名称 -->
<script>
export default {
  name: 'AppHeader',
  components: {
    AppHeader: HeaderBar,
    AppFooter: FooterBar,
    NavMenu,
    FormWrapper,
    DataTable,
  },
}
</script>
```
**反例**:
```vue
<!-- 组件名与 HTML 标签冲突 -->
<script>
export default {
  name: 'header',       // 与 <header> 冲突
  components: {
    button: ButtonComponent,   // 与 <button> 冲突
    form: FormComponent,       // 与 <form> 冲突
    table: TableComponent,     // 与 <table> 冲突
  },
}
</script>
```