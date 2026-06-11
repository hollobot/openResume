<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-logo">📄 CV Editor</span>
    </div>

    <div class="toolbar-right">
      <!-- 导入 MD -->
      <label class="btn btn-ghost" title="导入 .md 文件">
        <input type="file" accept=".md" class="hidden-input" @change="handleImport" />
        导入 MD
      </label>

      <!-- 导出下拉 -->
      <div class="export-group">
        <button class="btn btn-ghost" @click="emit('export-md')">导出 MD</button>
        <button class="btn btn-ghost" @click="emit('export-pdf')">导出 PDF</button>
        <button class="btn btn-ghost" @click="emit('export-jpg')">导出 JPG</button>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['import-md', 'export-md', 'export-pdf', 'export-jpg'])

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => emit('import-md', evt.target.result)
  reader.readAsText(file, 'utf-8')

  // 重置 input，允许重复导入同一文件
  e.target.value = ''
}
</script>

<style scoped>
.toolbar {
  height: 48px;
  background: #12122a;
  border-bottom: 1px solid #2a2a4a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  user-select: none;
}

.toolbar-logo {
  font-size: 15px;
  font-weight: 600;
  color: #a0aec0;
  letter-spacing: 1px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-group {
  display: flex;
  gap: 4px;
}

.btn {
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: background 0.15s, color 0.15s;
}

.btn-ghost {
  background: transparent;
  color: #a0aec0;
  border: 1px solid #2a2a4a;
}

.btn-ghost:hover {
  background: #1e1e3a;
  color: #e2e8f0;
}

/* 导入按钮：label 包裹 file input */
label.btn {
  display: inline-flex;
  align-items: center;
}

.hidden-input {
  display: none;
}
</style>
