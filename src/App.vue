<template>
  <div class="app-layout">
    <Toolbar
      @import-md="handleImport"
      @export-md="handleExportMd"
      @export-pdf="handleExportPdf"
      @export-jpg="handleExportJpg"
    />

    <div class="editor-area">
      <!-- 左栏：代码编辑器 -->
      <div class="pane pane-editor" :style="{ width: splitPercent + '%' }">
        <div class="pane-header">源码</div>
        <CodeEditor v-model="markdownContent" class="pane-body" />
      </div>

      <!-- 拖动分隔条 -->
      <div class="divider" @mousedown="startDrag" />

      <!-- 右栏：渲染预览 -->
      <div class="pane pane-preview">
        <div class="pane-header">预览</div>
        <ResumePreview ref="previewRef" :markdown="markdownContent" class="pane-body" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Toolbar from './components/Toolbar.vue'
import CodeEditor from './components/CodeEditor.vue'
import ResumePreview from './components/ResumePreview.vue'
import { exportMarkdown, exportPDF, exportJPG } from './composables/useExport.js'

// ── 默认示例简历 ───────────────────────────────────────────

const DEFAULT_MD = `---
name: 张三
title: 高级前端工程师
email: zhangsan@email.com
phone: 138-0000-0000
location: 北京市
github: github.com/zhangsan
color: "#4a90d9"
---

## 工作经历

### 字节跳动 · 前端工程师
*2022.03 - 至今 | 北京*

- 负责抖音创作者平台核心业务前端架构设计与迭代
- 主导组件库建设，将研发效率提升 30%
- 推动团队 TypeScript 迁移，覆盖率从 0 提升至 85%

### 阿里巴巴 · 前端开发工程师
*2020.07 - 2022.02 | 杭州*

- 参与天猫双十一大促页面开发，支撑千万级并发
- 负责移动端性能优化，首屏时间降低 40%

## 项目经历

### 低代码可视化搭建平台
*2023.06 - 2023.12*

- 基于拖拽式交互设计，支持 50+ 业务组件自由组合
- 累计服务 200+ 业务方，沉淀页面模板 800+

## 技能

**前端框架** \`Vue3\` \`React\` \`TypeScript\`
**工程化** \`Vite\` \`Webpack\` \`Node.js\`
**其他** \`Git\` \`Docker\` \`CI/CD\`

## 教育背景

### 北京大学 · 计算机科学与技术
*2016.09 - 2020.06 | 本科*
`

// ── 编辑器内容（持久化到 localStorage）──────────────────────

const markdownContent = ref(localStorage.getItem('cv-content') || DEFAULT_MD)
const previewRef = ref(null)

// 内容变化 800ms 后自动保存
let saveTimer = null
watch(markdownContent, (val) => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => localStorage.setItem('cv-content', val), 800)
})

// ── 导入 / 导出 ────────────────────────────────────────────

function handleImport(text) {
  markdownContent.value = text
}

function handleExportMd() {
  exportMarkdown(markdownContent.value)
}

function handleExportPdf() {
  exportPDF()
}

async function handleExportJpg() {
  const el = previewRef.value?.pageRef
  if (!el) return
  await exportJPG(el)
}

// ── 拖动分隔条改变双栏比例 ─────────────────────────────────

const splitPercent = ref(45)
let dragging = false

function startDrag(e) {
  dragging = true
  e.preventDefault()
}

function onMouseMove(e) {
  if (!dragging) return
  const percent = (e.clientX / window.innerWidth) * 100
  splitPercent.value = Math.min(75, Math.max(20, percent))
}

function stopDrag() {
  dragging = false
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.editor-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pane-preview {
  flex: 1;
}

.pane-header {
  height: 32px;
  background: #12122a;
  border-bottom: 1px solid #2a2a4a;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  color: #718096;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.pane-body {
  flex: 1;
  overflow: hidden;
}

.divider {
  width: 4px;
  background: #2a2a4a;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.15s;
}

.divider:hover,
.divider:active {
  background: #4a90d9;
}
</style>
