import { createApp } from 'vue'
import App from './App.vue'
// 苹方风格中文字体（思源黑体 / Noto Sans SC，自托管 woff2，可商用 OFL）
// 打包进项目，保证 Windows 等无苹方的环境也能真实显示、且导出与预览一致
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/700.css'
import './styles/main.css'
import './styles/theme-default.css'

createApp(App).mount('#app')
