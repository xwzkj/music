import { createApp } from 'vue'
import router from './router/index.js'
import pinia from '@/stores/index.js'
import App from './App.vue'
let app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
