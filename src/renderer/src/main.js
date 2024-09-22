console.log('%c奶酪音乐',"font-family:'微软雅黑' ; font-size: 3rem; color: #deb237; background-color: #deb23710; padding: 0.5rem; border-radius: 0.5rem")

import { createApp } from 'vue'
import router from './router/index'
import pinia from '@/stores/index'
import App from './App.vue'
import 'virtual:uno.css'
import './assets/font.less'
let app = createApp(App)
app.use(pinia)
console.log('pinia实例被创建')
app.use(router)
app.mount('#app')
