# Vue2 - 项目目录结构约定

## 适用范围
- 适用于所有基于 Vue CLI + Vue2 的前端项目
- 与组件编写规范、Vuex 状态管理规范配合使用
- 适用于中大型业务项目，小型项目可适当简化

## 规则

### R1: Vue CLI 标准目录结构
**级别**: 必须
**描述**: 项目根目录包含 Vue CLI 配置、Webpack 配置和标准 `src` 目录，使用 `public/index.html` 作为模板。
**正例**:
```
my-vue-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.vue
│   └── main.js
├── package.json
├── vue.config.js
├── babel.config.js
├── .env
├── .env.development
├── .env.production
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```
**反例**:
```
my-vue-app/
├── index.html           # 不应在根目录
├── src/
│   ├── vue.config.js    # 配置不应在 src 中
│   ├── App.vue
│   └── main.js
├── webpack.config.js    # Vue CLI 项目不应直接写 webpack 配置
└── package.json
```

### R2: src 子目录职责划分
**级别**: 必须
**描述**: `src` 目录按职责划分子目录，与 Vue3 项目保持一致的目录理念。
**正例**:
```
src/
├── api/            # 接口请求
├── assets/         # 静态资源
├── components/     # 通用组件
├── directives/     # 自定义指令
├── filters/        # 全局过滤器
├── icons/          # SVG 图标
├── layouts/        # 布局组件
├── mixins/         # 混入
├── router/         # 路由配置
├── store/          # Vuex Store
├── styles/         # 全局样式
├── utils/          # 工具函数
├── views/          # 页面组件
├── App.vue
└── main.js
```
**反例**:
```
src/
├── components/     # 组件、页面、API 混在一起
│   ├── Header.vue
│   ├── LoginPage.vue
│   └── getUserInfo.js
├── helper/         # helper 和 utils 概念重复
├── service/        # service 和 api 概念重复
├── Vuex/           # 命名不统一（大小写混用）
├── style/          # 单数 vs 复数不一致
└── utils.js        # 工具函数直接放在 src 根目录
```

### R3: 路由配置规范
**级别**: 推荐
**描述**: 路由按模块拆分，主文件负责创建实例和全局守卫，子模块按业务分文件。
**正例**:
```
router/
├── index.js          # 创建 router 实例、全局守卫
└── modules/
    ├── user.js       # 用户相关路由
    ├── product.js    # 商品相关路由
    └── admin.js      # 管理后台路由
```
```js
// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import userRoutes from './modules/user'
import productRoutes from './modules/product'
import adminRoutes from './modules/admin'

Vue.use(VueRouter)

const routes = [
  ...userRoutes,
  ...productRoutes,
  ...adminRoutes,
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters['user/isLoggedIn']
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```
**反例**:
```js
// router/index.js 所有路由堆在一起
const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/profile', component: UserProfile },
    { path: '/user/settings', component: UserSettings },
    { path: '/product/list', component: ProductList },
    { path: '/product/detail/:id', component: ProductDetail },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/admin/users', component: AdminUsers },
    // ... 几百行
  ],
})

// 没有路由守卫，权限控制散落在各组件中
```

### R4: axios 拦截器封装
**级别**: 必须
**描述**: 统一封装 axios 实例，配置请求/响应拦截器处理 token 注入、错误处理、loading 状态等。
**正例**:
```
src/api/
├── request.js       # axios 实例封装
├── modules/
│   ├── user.js      # 用户接口
│   └── product.js   # 商品接口
└── index.js         # 统一导出
```
```js
// src/api/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：注入 token
service.interceptors.request.use(
  (config) => {
    const token = store.state.user.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理
service.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0) {
      return data
    }
    Message.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch('user/logout')
      router.push({ name: 'Login' })
    } else {
      Message.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service
```
```js
// src/api/modules/user.js
import request from '../request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function getUserInfo() {
  return request.get('/user/info')
}
```
**反例**:
```vue
<!-- 组件中直接使用 axios -->
<script>
import axios from 'axios'

export default {
  methods: {
    async fetchUser() {
      try {
        const res = await axios.get('http://localhost:3000/api/user')
        this.userInfo = res.data
      } catch (err) {
        alert('出错了') // 错误处理不规范
      }
    },
  },
}
</script>
```

### R5: 全局组件注册规范
**级别**: 推荐
**描述**: 频繁使用的通用组件在 `main.js` 中全局注册，业务组件按需局部注册。全局注册应集中管理。
**正例**:
```js
// src/components/index.js
import Vue from 'vue'
import Button from './Button.vue'
import Modal from './Modal.vue'
import Table from './Table.vue'
import Pagination from './Pagination.vue'

const components = {
  Button,
  Modal,
  Table,
  Pagination,
}

Object.keys(components).forEach((name) => {
  Vue.component(name, components[name])
})
```
```js
// src/main.js
import Vue from 'vue'
import '@/components' // 全局注册通用组件
import App from './App.vue'

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
```
**反例**:
```js
// main.js 中散乱注册
import Vue from 'vue'
import Button from './components/Button.vue'
import Modal from './components/Modal.vue'
import Table from './components/Table.vue'
import UserProfile from './views/UserProfile.vue' // 业务组件不应全局注册

Vue.component('Button', Button)
Vue.component('Modal', Modal)
Vue.component('Table', Table)
Vue.component('UserProfile', UserProfile) // 页面组件全局注册浪费性能
```

### R6: 全局过滤器和指令规范
**级别**: 推荐
**描述**: 全局过滤器和自定义指令集中注册，文件按功能分模块，在 `main.js` 中统一引入。
**正例**:
```
src/filters/
├── index.js       # 统一注册
├── date.js        # 日期格式化
├── number.js      # 数字格式化
└── text.js        # 文本处理

src/directives/
├── index.js       # 统一注册
├── permission.js  # 权限指令 v-permission
├── loading.js     # 加载指令 v-loading
└── lazy.js        # 懒加载指令 v-lazy
```
```js
// src/filters/index.js
import Vue from 'vue'
import { formatDate, formatTime } from './date'
import { formatMoney, formatPercent } from './number'
import { truncate, escapeHtml } from './text'

Vue.filter('date', formatDate)
Vue.filter('time', formatTime)
Vue.filter('money', formatMoney)
Vue.filter('percent', formatPercent)
Vue.filter('truncate', truncate)
```
```js
// src/directives/index.js
import Vue from 'vue'
import permission from './permission'
import loading from './loading'

Vue.directive('permission', permission)
Vue.directive('loading', loading)
```
**反例**:
```js
// main.js 中随意注册
import Vue from 'vue'

Vue.filter('date', (val) => /* ... */)
Vue.filter('money', (val) => /* ... */)
Vue.filter('truncate', (val) => /* ... */)
Vue.directive('permission', { /* ... */ })
Vue.directive('loading', { /* ... */ })
// 过滤器和指令散落在 main.js 中，难以维护
```

### R7: 环境变量使用 VUE_APP_ 前缀
**级别**: 必须
**描述**: Vue CLI 项目中环境变量以 `VUE_APP_` 前缀暴露到客户端，通过 `.env` 文件管理不同环境配置。
**正例**:
```
# .env.development
VUE_APP_TITLE=MyApp Dev
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_ENABLE_MOCK=true

# .env.staging
VUE_APP_TITLE=MyApp Staging
VUE_APP_API_BASE_URL=https://staging-api.example.com
VUE_APP_ENABLE_MOCK=false

# .env.production
VUE_APP_TITLE=MyApp
VUE_APP_API_BASE_URL=https://api.example.com
VUE_APP_ENABLE_MOCK=false
```
```js
// 使用
const baseURL = process.env.VUE_APP_API_BASE_URL
```
**反例**:
```
# .env 不使用 VUE_APP_ 前缀
API_BASE_URL=http://localhost:3000   # 无法在客户端访问

# .env 中存放敏感信息
VUE_APP_SECRET_KEY=abc123            # 暴露给客户端
VUE_APP_DB_PASSWORD=password         # 不应在前端环境变量中
```

### R8: 别名配置
**级别**: 必须
**描述**: 在 `vue.config.js` 中配置 `@` 指向 `src` 目录，简化模块引用路径。
**正例**:
```js
// vue.config.js
const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@store': path.resolve(__dirname, 'src/store'),
      },
    },
  },
}
```
```js
// 使用别名
import Button from '@components/Button.vue'
import { fetchUser } from '@api/modules/user'
import { formatDate } from '@utils/date'
import store from '@store'
```
**反例**:
```js
// 不配置别名，使用多层相对路径
import Button from '../../components/Button.vue'
import { fetchUser } from '../../../api/modules/user'
import { formatDate } from '../../utils/date'
// 文件移动后大量引用路径需要修改
```