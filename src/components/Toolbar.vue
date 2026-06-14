<script setup>
/**
 * 顶部工具栏：导入 / 导出 / 重置入口
 * 自身只负责触发交互，具体导入导出逻辑由父组件（App）处理。
 */
import { ref, onMounted, onUnmounted } from 'vue'
import ResumeSwitcher from './ResumeSwitcher.vue'

const emit = defineEmits([
  'import-file',
  'export-pdf',
  'export-png',
  'export-html',
  'export-md',
  'export-json',
  'reset',
  'save',
  'open-settings',
  'open-icons',
  'open-theme'
])

// 隐藏的文件选择框，点击「导入」时触发
const fileInput = ref(null)

function triggerImport() {
  fileInput.value && fileInput.value.click()
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) emit('import-file', file)
  // 重置 value，保证连续选择同一文件也能再次触发 change
  e.target.value = ''
}

// —— 导出下拉菜单（把多个导出按钮收纳成一个）——
const exportOpen = ref(false)
// 菜单项：展示名 + 对应的导出事件
const EXPORT_ITEMS = [
  { label: '导出 PDF', event: 'export-pdf' },
  { label: '导出 PNG', event: 'export-png' },
  { label: '导出 HTML', event: 'export-html' },
  { label: '导出 Markdown', event: 'export-md' },
  { label: '导出 JSON', event: 'export-json' }
]
function onExport(event) {
  emit(event)
  exportOpen.value = false
}
// 点击下拉之外的区域关闭（下拉容器内的点击已 stop，不会触发）
function closeExport() {
  exportOpen.value = false
}
onMounted(() => document.addEventListener('click', closeExport))
onUnmounted(() => document.removeEventListener('click', closeExport))
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <div class="toolbar-brand">OpenResume</div>
      <ResumeSwitcher />
    </div>

    <div class="toolbar-actions">
      <button class="btn" @click="emit('save')">保存</button>
      <button class="btn" @click="emit('open-icons')">图标</button>
      <button class="btn" @click="emit('open-theme')">主题色</button>
      <button class="btn" @click="emit('open-settings')">设置</button>
      <span class="toolbar-divider"></span>
      <button class="btn" @click="triggerImport">导入</button>
      <!-- 导出下拉：容器内点击 stop，避免被全局关闭监听误关 -->
      <div class="export-dropdown" @click.stop>
        <button class="btn" @click="exportOpen = !exportOpen">
          导出 <span class="caret">▾</span>
        </button>
        <div v-if="exportOpen" class="export-menu">
          <button
            v-for="item in EXPORT_ITEMS"
            :key="item.event"
            class="export-item"
            @click="onExport(item.event)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
      <span class="toolbar-divider"></span>
      <button class="btn btn-ghost" @click="emit('reset')">重置示例</button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".md,.markdown,.txt,.json"
      style="display: none"
      @change="onFileChange"
    />
  </header>
</template>

<style scoped>
.toolbar {
  height: 56px;
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #1f2937;
  color: #fff;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.toolbar-brand {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-divider {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}
.btn {
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:hover {
  background: #2563eb;
}
.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 导出下拉 */
.export-dropdown {
  position: relative;
  display: inline-block;
}
.caret {
  font-size: 10px;
}
.export-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  min-width: 150px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
}
.export-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: #fff;
  color: #374151;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.export-item:hover {
  background: #f3f4f6;
}
</style>
