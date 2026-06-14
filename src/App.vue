<script setup>
/**
 * 应用根组件：组织「工具栏 + 左编辑 / 右预览」布局，
 * 串接导入导出、保存（Ctrl+S + Toast）、样式设置面板与自定义 CSS 注入。
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import Toolbar from './components/Toolbar.vue'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import IconPicker from './components/IconPicker.vue'
import ThemeColorPicker from './components/ThemeColorPicker.vue'
import Toast from './components/Toast.vue'
import { useResume } from './composables/useResume.js'
import { useToast } from './composables/useToast.js'
import {
  exportMarkdown,
  exportJSON,
  exportPNG,
  exportPDF
} from './utils/exporters.js'
import { importFile } from './utils/importers.js'

const { markdown, settings, setMarkdown, resetToSample, saveNow } = useResume()
const { show } = useToast()

// 预览组件引用，用于获取待导出的 DOM 元素
const previewRef = ref(null)
// 设置面板开关
const settingsOpen = ref(false)
// 图标选择器开关
const iconsOpen = ref(false)
// 主题色取色面板开关
const themeOpen = ref(false)

function getPages() {
  return previewRef.value ? previewRef.value.getPages() : []
}

// —— 保存 ——
function onSave() {
  const ok = saveNow()
  show(
    ok ? '已保存到浏览器缓存' : '保存失败（存储不可用或空间不足）',
    ok ? 'success' : 'error'
  )
}

// 全局快捷键：Ctrl/Cmd + S 立即保存
function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault() // 拦截浏览器默认的保存网页
    onSave()
  }
}

// —— 自定义 CSS 注入 ——
// 维护一个 <style> 元素，用 CSS 嵌套把用户样式限定在简历预览内，
// 避免影响工具栏 / 设置面板等其它区域。
let styleEl = null
function applyCustomCss(css) {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'resume-custom-css'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `.resume-theme-default {\n${css || ''}\n}`
}
watch(() => settings.customCss, applyCustomCss, { immediate: true })

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// —— 导出 ——
function onExportPdf() {
  const pages = getPages()
  if (pages.length) exportPDF(pages)
}
function onExportPng() {
  const pages = getPages()
  if (pages.length) exportPNG(pages)
}
function onExportMd() {
  exportMarkdown(markdown.value)
}
function onExportJson() {
  exportJSON(markdown.value)
}

// —— 导入 ——
async function onImportFile(file) {
  try {
    const text = await importFile(file)
    setMarkdown(text)
    show('导入成功', 'success')
  } catch (e) {
    show(e.message || '导入失败', 'error')
  }
}

// —— 重置 ——
function onReset() {
  if (confirm('确定要重置为示例简历吗？当前内容将被覆盖。')) {
    resetToSample()
  }
}
</script>

<template>
  <div class="app">
    <Toolbar
      @save="onSave"
      @open-settings="settingsOpen = true"
      @open-icons="iconsOpen = true"
      @open-theme="themeOpen = true"
      @import-file="onImportFile"
      @export-pdf="onExportPdf"
      @export-png="onExportPng"
      @export-md="onExportMd"
      @export-json="onExportJson"
      @reset="onReset"
    />
    <main class="workspace">
      <div class="pane pane-editor">
        <EditorPane />
      </div>
      <div class="pane pane-preview">
        <PreviewPane ref="previewRef" />
      </div>
    </main>

    <SettingsPanel :open="settingsOpen" @close="settingsOpen = false" />
    <IconPicker :open="iconsOpen" @close="iconsOpen = false" />
    <ThemeColorPicker :open="themeOpen" @close="themeOpen = false" />
    <Toast />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.workspace {
  flex: 1;
  display: flex;
  min-height: 0; /* 让子项可以正确滚动 */
}
.pane {
  height: 100%;
  min-width: 0;
}
.pane-editor {
  flex: 0 0 42%;
  border-right: 1px solid #e2e5e9;
}
.pane-preview {
  flex: 1;
}
</style>
