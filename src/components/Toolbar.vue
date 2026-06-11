<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-logo">
        <span class="logo-icon">✦</span>
        简历编辑器
      </span>
    </div>

    <div class="toolbar-right">
      <!-- 导入 JSON -->
      <label class="btn btn-ghost" title="导入 JSON 简历数据">
        <input type="file" accept=".json" class="hidden-input" @change="handleImport" />
        <span>⬆ 导入 JSON</span>
      </label>

      <button class="btn btn-ghost" title="重置为示例数据" @click="emit('reset')">↺ 重置</button>

      <div class="divider-v" />

      <!-- 导出按钮组 -->
      <div class="export-group">
        <button class="btn btn-ghost" title="导出简历数据为 JSON" @click="emit('export-json')">⬇ JSON</button>
        <button class="btn btn-ghost" title="通过浏览器打印导出高质量 PDF" @click="emit('export-pdf')">⬇ PDF</button>
        <button class="btn btn-accent" title="导出为 JPG 图片" @click="emit('export-jpg')">⬇ JPG</button>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['import-json', 'reset', 'export-json', 'export-pdf', 'export-jpg'])

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => emit('import-json', evt.target.result)
  reader.readAsText(file, 'utf-8')

  // 重置 input，允许重复导入同一文件
  e.target.value = ''
}
</script>

<style scoped>
.toolbar {
  height: 46px;
  background: #0f0f1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  user-select: none;
}

.toolbar-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.5px;
}

.logo-icon {
  color: #6366f1;
  font-size: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.divider-v {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
}

.export-group {
  display: flex;
  gap: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

.btn-ghost {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-accent {
  background: #2563eb;
  color: #fff;
  border: 1px solid transparent;
}

.btn-accent:hover {
  background: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
}

label.btn {
  display: inline-flex;
  align-items: center;
}

.hidden-input {
  display: none;
}
</style>
