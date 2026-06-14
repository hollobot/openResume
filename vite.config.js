import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Vite 基础配置：启用 Vue 单文件组件支持
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // @tabler/icons 的 package exports 把根目录的 nodes JSON 屏蔽了，
      // 这里用别名直接指向真实文件，供图标插件读取全部图标的节点数据。
      'tabler-nodes-outline': fileURLToPath(
        new URL('./node_modules/@tabler/icons/tabler-nodes-outline.json', import.meta.url)
      )
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
