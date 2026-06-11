<template>
  <div class="editor-panel">
    <BasicsEditor />
    <SectionEditor v-for="def in SECTION_DEFS" :key="def.key" :section-key="def.key" />
  </div>
</template>

<script setup>
import { SECTION_DEFS } from '../../resume/schema.js'
import BasicsEditor from './BasicsEditor.vue'
import SectionEditor from './SectionEditor.vue'
</script>

<style scoped>
.editor-panel {
  height: 100%;
  overflow-y: auto;
  padding: 14px;
  background: #0f0f1e;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.editor-panel::-webkit-scrollbar {
  width: 6px;
}

.editor-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
</style>
