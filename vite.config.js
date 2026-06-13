import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 基础配置：启用 Vue 单文件组件支持
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  }
})
