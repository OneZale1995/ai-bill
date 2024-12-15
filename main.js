import App from './App'
import pageNav from '@/components/page-nav.vue'  

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.component('page-nav', pageNav)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.component('page-nav', pageNav)  // 注册全局组件
  return {
    app
  }
}
// #endif