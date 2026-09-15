import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// App.vue 里的 onErrorCaptured 兜不到 App 自身渲染时抛的错，
// 这里再兜一层，至少保证错误有地方被记录下来，而不是静默消失
app.config.errorHandler = (error, _instance, info) => {
  console.error('[app] 未捕获的错误：', error, info)
}

app.mount('#app')
