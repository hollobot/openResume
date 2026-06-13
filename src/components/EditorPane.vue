<script setup>
/**
 * 左侧编辑区：CodeMirror 6 编辑器
 * 提供 Markdown 语法高亮、行号、括号匹配、自动换行，编辑体验优于纯 textarea。
 * 通过 v-model 绑定共享状态 content，输入即触发右侧实时预览与本地草稿保存。
 */
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { markdown as markdownLang } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { useResume } from '../composables/useResume.js'

const { markdown: content } = useResume()

// 编辑器扩展：基础套件 + Markdown 语言 + 长行自动换行
const extensions = [basicSetup, markdownLang(), EditorView.lineWrapping]
</script>

<template>
  <section class="editor-pane">
    <Codemirror
      v-model="content"
      :extensions="extensions"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      placeholder="在此输入 Markdown 内容…"
      class="editor-cm"
    />
  </section>
</template>

<style scoped>
.editor-pane {
  height: 100%;
  background: #fff;
}
/* 让 CodeMirror 填满编辑区并设定等宽字体 */
.editor-cm {
  height: 100%;
}
:deep(.cm-editor) {
  height: 100%;
}
:deep(.cm-scroller) {
  font-family: 'Consolas', 'Menlo', 'Courier New', monospace;
  font-size: 13.5px;
  line-height: 1.7;
}
:deep(.cm-editor.cm-focused) {
  outline: none;
}
:deep(.cm-gutters) {
  background: #fafbfc;
  border-right: 1px solid #eef0f3;
  color: #b6bcc6;
}
</style>
