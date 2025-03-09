import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 在生产环境中禁用console.log
if (import.meta.env.PROD) {
  const noop = () => {};
  const originalConsole = { ...console };
  
  // 保存原始的error和warn方法，但禁用info、log和debug
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  
  // 添加恢复日志功能（仅用于开发调试）
  window._restoreConsole = () => {
    Object.assign(console, originalConsole);
  };
}

app.mount('#app')
