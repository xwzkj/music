import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia'
let app = createApp(App);
let pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');
