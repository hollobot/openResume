import { createApp } from 'vue'
import './style.css'
import './styles/print.css'
// Phosphor icon font：简历内按名渲染图标 + 图标选择器使用
import '@phosphor-icons/web/regular'
import '@phosphor-icons/web/bold'
import App from './App.vue'
import { router } from './router/index.js'
import { initResumesStore } from './stores/resumes.js'

// 载入简历索引（含首次旧数据迁移）
initResumesStore()

createApp(App).use(router).mount('#app')
