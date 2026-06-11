<template>
  <div ref="editorRef" class="code-editor" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let view = null

onMounted(() => {
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      oneDark,
      markdown(),
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      // 每次文档变化时同步到父组件
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '13px' },
        '.cm-scroller': { overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace" },
        '.cm-content': { padding: '12px 0' },
      }),
    ],
  })

  view = new EditorView({ state, parent: editorRef.value })
})

// 外部修改 modelValue 时（如导入文件）同步到编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    if (view && newVal !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: newVal },
      })
    }
  },
)

onBeforeUnmount(() => {
  view?.destroy()
})
</script>

<style scoped>
.code-editor {
  height: 100%;
  overflow: hidden;
}
</style>
