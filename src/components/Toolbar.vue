<script setup>
/**
 * 顶部工具栏：导入 / 导出 / 重置入口
 * 自身只负责触发交互，具体导入导出逻辑由父组件（App）处理。
 */
import { ref } from 'vue'

const emit = defineEmits([
  'import-file',
  'export-pdf',
  'export-png',
  'export-md',
  'export-json',
  'reset',
  'save',
  'open-settings'
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
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-brand">OpenResume</div>

    <div class="toolbar-actions">
      <button class="btn" @click="emit('save')">保存</button>
      <button class="btn" @click="emit('open-settings')">设置</button>
      <span class="toolbar-divider"></span>
      <button class="btn" @click="triggerImport">导入</button>
      <button class="btn" @click="emit('export-pdf')">导出 PDF</button>
      <button class="btn" @click="emit('export-png')">导出 PNG</button>
      <button class="btn" @click="emit('export-md')">导出 Markdown</button>
      <button class="btn" @click="emit('export-json')">导出 JSON</button>
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
</style>
