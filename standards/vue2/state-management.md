---
id: vue2-state-management
title: Vue2 - Vuex 状态管理规范
tags: [vue2, vuex, store, mutation, action]
trigger:
  extensions: [.js]
  frameworks: [vue2]
skip:
  keywords: [配置文件, yml, properties, SQL, Mapper, 后端, REST, 接口]
---

# Vue2 - Vuex 状态管理规范

## 适用范围
- 适用于所有 Vue2 项目中使用 Vuex 进行全局状态管理的场景
- 与组件编写规范配合使用
- Vue3 项目应使用 Pinia，不再使用 Vuex

## 规则

### R1: Store 模块化拆分
**级别**: 必须
**描述**: Vuex Store 按业务功能拆分为独立模块，每个模块拥有独立的 state/mutations/actions/getters。
**正例**:
```
store/
├── index.js               # 主入口，组装模块
├── modules/
│   ├── user.js            # 用户模块
│   ├── cart.js            # 购物车模块
│   ├── product.js         # 商品模块
│   └── app.js             # 全局应用状态
└── mutation-types.js      # Mutation 类型常量
```
```js
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import product from './modules/product'
import app from './modules/app'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    cart,
    product,
    app,
  },
  strict: process.env.NODE_ENV !== 'production',
})
```
**反例**:
```js
// store/index.js 所有状态堆在一起
export default new Vuex.Store({
  state: {
    userInfo: null,
    token: '',
    cartItems: [],
    products: [],
    theme: 'light',
    sidebar: { isOpen: true },
    menuList: [],
    permissions: [],
    // ... 几十个字段
  },
  mutations: { /* 几十个 mutation */ },
  actions: { /* 几十个 action */ },
})
```

### R2: State/Mutations/Actions/Getters 职责分明
**级别**: 必须
**描述**: State 存数据，Mutations 同步修改状态，Actions 处理异步逻辑后提交 Mutations，Getters 派生计算。
**正例**:
```js
// store/modules/user.js
export default {
  namespaced: true,

  state: () => ({
    userInfo: null,
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name ?? '未登录',
  },

  // mutations：同步修改 state
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    CLEAR_USER(state) {
      state.userInfo = null
      state.token = ''
    },
  },

  // actions：异步操作后提交 mutation
  actions: {
    async login({ commit }, credentials) {
      const res = await loginApi(credentials)
      commit('SET_TOKEN', res.data.token)
      commit('SET_USER_INFO', res.data.user)
    },

    async logout({ commit }) {
      await logoutApi()
      commit('CLEAR_USER')
    },
  },
}
```
**反例**:
```js
export default {
  state: () => ({ userInfo: null, token: '' }),

  // 在 mutation 中执行异步操作
  mutations: {
    async LOGIN(state, credentials) {
      const res = await loginApi(credentials) // mutation 不应异步
      state.token = res.data.token
    },
  },

  // 在 action 中直接修改 state
  actions: {
    login({ state }, credentials) {
      state.token = 'xxx' // 应通过 commit mutation 修改
    },
  },
}
```

### R3: 异步操作必须放在 Actions 中
**级别**: 必须
**描述**: 所有异步操作（API 请求、定时器等）必须在 Actions 中执行，完成后通过 commit 调用 Mutation 修改状态。Mutation 中禁止异步操作。
**正例**:
```js
// store/modules/product.js
export default {
  namespaced: true,

  state: () => ({
    productList: [],
    loading: false,
    error: null,
  }),

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_PRODUCT_LIST(state, list) {
      state.productList = list
    },
    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    async fetchProducts({ commit }, params) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const res = await getProductList(params)
        commit('SET_PRODUCT_LIST', res.data.list)
      } catch (err) {
        commit('SET_ERROR', err.message)
        throw err
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
}
```
**反例**:
```js
export default {
  state: () => ({ productList: [] }),

  mutations: {
    // mutation 中直接发请求（严重违规）
    LOAD_PRODUCTS(state) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          state.productList = data
        })
    },
  },

  // 组件中绕过 action 直接操作
  // this.$store.state.product.productList = newData
}
```

### R4: 模块必须启用 namespaced
**级别**: 必须
**描述**: 所有 Vuex 模块必须设置 `namespaced: true`，避免命名冲突。
**正例**:
```js
// store/modules/user.js
export default {
  namespaced: true,  // 必须启用

  state: () => ({ token: '' }),

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
  },

  actions: {
    login({ commit }, credentials) {
      commit('SET_TOKEN', 'token-value')
    },
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
  },
}

// 组件中使用时带模块前缀
// this.$store.dispatch('user/login', credentials)
// this.$store.getters['user/isLoggedIn']
```
**反例**:
```js
// 缺少 namespaced
export default {
  state: () => ({ token: '' }),
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
  },
}
// 此时 SET_TOKEN 注册在全局，多个模块可能冲突
```

### R5: 使用 MutationTypes 常量
**级别**: 推荐
**描述**: Mutation 类型使用常量定义，集中管理，避免字符串拼写错误。
**正例**:
```js
// store/mutation-types.js
export const SET_TOKEN = 'SET_TOKEN'
export const SET_USER_INFO = 'SET_USER_INFO'
export const CLEAR_USER = 'CLEAR_USER'
export const SET_PRODUCT_LIST = 'SET_PRODUCT_LIST'
export const ADD_CART_ITEM = 'ADD_CART_ITEM'
export const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM'
```
```js
// store/modules/user.js
import { SET_TOKEN, SET_USER_INFO, CLEAR_USER } from '../mutation-types'

export default {
  namespaced: true,

  state: () => ({ userInfo: null, token: '' }),

  mutations: {
    [SET_TOKEN](state, token) {
      state.token = token
    },
    [SET_USER_INFO](state, userInfo) {
      state.userInfo = userInfo
    },
    [CLEAR_USER](state) {
      state.userInfo = null
      state.token = ''
    },
  },
}
```
**反例**:
```js
// mutation 类型字符串散落各处，容易拼写错误
export default {
  mutations: {
    SET_TOKEN(state, token) { state.token = token },
  },
}

// 组件中直接写字符串
this.$store.commit('SET_TOKNE', token) // 拼写错误，难以排查
```

### R6: 禁止直接修改 State
**级别**: 必须
**描述**: 禁止在组件中直接修改 `this.$store.state.xxx`，必须通过 commit mutation 修改。开启 `strict: true` 模式辅助检测。
**正例**:
```vue
<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  methods: {
    ...mapMutations('user', ['SET_TOKEN']),

    handleLogin() {
      // 通过 commit mutation 修改状态
      this.SET_TOKEN('new-token')

      // 或通过 action
      this.$store.dispatch('user/login', {
        username: 'admin',
        password: '123456',
      })
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
    handleLogin() {
      // 直接修改 state（严重违规）
      this.$store.state.user.token = 'new-token'
      this.$store.state.user.userInfo = { name: 'admin' }
    },
  },
}
</script>
```

### R7: 使用 mapState/mapGetters/mapActions 辅助函数
**级别**: 推荐
**描述**: 组件中使用 `mapState`、`mapGetters`、`mapMutations`、`mapActions` 辅助函数简化 Store 访问，减少样板代码。
**正例**:
```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // 映射 state
    ...mapState('user', ['userInfo', 'token']),
    ...mapState('cart', ['items']),

    // 映射 getters
    ...mapGetters('user', ['isLoggedIn', 'userName']),
    ...mapGetters('cart', ['totalCount', 'totalPrice']),
  },

  methods: {
    // 映射 actions
    ...mapActions('user', ['login', 'logout']),
    ...mapActions('cart', ['addItem', 'removeItem']),

    handleLogin() {
      this.login(this.form)
    },
  },
}
</script>

<template>
  <div v-if="isLoggedIn">
    <span>{{ userName }}</span>
    <span>购物车: {{ totalCount }} 件</span>
  </div>
</template>
```
**反例**:
```vue
<script>
export default {
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    },
    isLoggedIn() {
      return this.$store.getters['user/isLoggedIn']
    },
    cartItems() {
      return this.$store.state.cart.items
    },
    // 每个状态都写一个 computed，样板代码过多
  },

  methods: {
    handleLogin() {
      this.$store.dispatch('user/login', this.form)
    },
    handleLogout() {
      this.$store.dispatch('user/logout')
    },
  },
}
</script>
```

### R8: 按业务功能拆分模块
**级别**: 推荐
**描述**: Vuex 模块按业务功能拆分，每个模块职责单一，不过度拆分也不过度合并。
**正例**:
```
store/
├── index.js
├── mutation-types.js
└── modules/
    ├── user.js           # 用户登录、信息
    ├── permission.js     # 权限、菜单、角色
    ├── cart.js           # 购物车
    ├── order.js          # 订单
    └── app.js            # 全局 UI 状态（主题、语言、侧边栏）
```
```js
// 每个模块结构清晰
// store/modules/cart.js
export default {
  namespaced: true,
  state: () => ({
    items: [],
  }),
  getters: {
    totalCount: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  mutations: {
    ADD_ITEM(state, item) { /* ... */ },
    REMOVE_ITEM(state, id) { /* ... */ },
    CLEAR_CART(state) { state.items = [] },
  },
  actions: {
    addItem({ commit }, item) { commit('ADD_ITEM', item) },
    checkout({ state, commit }) { /* 异步提交订单 */ },
  },
}
```
**反例**:
```
store/
├── index.js
└── modules/
    ├── all.js            # 所有逻辑在一个文件
    ├── data.js           # 按技术层划分而非业务
    └── ui.js             # 按技术层划分而非业务
```