import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 根据屏幕宽度动态设置rem基准值
import 'amfe-flexible'
// 使用vant  是一个插件，包含了很多组件，称为：组件库
import VueSocketIO from 'vue-socket.io'

// element ui也是插件， use中挂载了所有组件
import Vant, { Lazyload } from 'vant'// 按需导入和默认导入，是平级关系。这个只会导入默认组件,两者为平级关系
import 'vant/lib/index.less'
import '@/styles/index.less'
import plugin from '@/utils/plugin'
Vue.use(Lazyload)// 使用
Vue.use(plugin)
Vue.use(Vant)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

Vue.use(new VueSocketIO({
  debug: true,
  // 服务器端地址
  connection: 'http://localhost:3000',
  vuex: {
  }
}))
