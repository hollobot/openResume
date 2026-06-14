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
import EditorToolbar from './EditorToolbar.vue'

const { markdown: content, setEditorView } = useResume()

// 编辑器扩展：基础套件 + Markdown 语言 + 长行自动换行
const extensions = [basicSetup, markdownLang(), EditorView.lineWrapping]

// 编辑器就绪后把 CodeMirror 实例交给共享状态，供图标选择器在光标处插入
function onReady(payload) {
  setEditorView(payload.view)
}
</script>

<template>
  <section class="editor-pane">
    <EditorToolbar />
    <Codemirror
      v-model="content"
      :extensions="extensions"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      placeholder="在此输入 Markdown 内容…"
      class="editor-cm"
      @ready="onReady"
    />
  </section>
</template>

<style scoped>
.editor-pane {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}
/* vue-codemirror 根节点是 display:contents（自身无盒子），flex 不会作用其上，
   真正参与 .editor-pane 弹性布局的是 .cm-editor —— 让它按 flex:1 填满工具栏以外的
   剩余空间并内部滚动（原先 height:100% 会等于整个编辑区高度，叠加工具栏后溢出，
   把整个窗口顶出滚动条）。 */
:deep(.cm-editor) {
  flex: 1;
  min-height: 0;
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
