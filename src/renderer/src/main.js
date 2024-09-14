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
