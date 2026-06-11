<template>
  <div class="rte">
    <span v-if="label" class="rte-label">{{ label }}</span>

    <!-- 工具栏 -->
    <div v-if="editor" class="rte-toolbar">
      <button
        v-for="b in buttons"
        :key="b.title"
        class="rte-btn"
        :class="{ active: b.isActive() }"
        :title="b.title"
        type="button"
        @mousedown.prevent="b.run()"
      >
        <i :class="`ph ph-${b.icon}`" />
      </button>
    </div>

    <!-- 编辑区 -->
    <EditorContent :editor="editor" class="rte-content" />
  </div>
</template>

<script setup>
/**
 * tiptap 富文本编辑器（对齐 RR 的 RichInput）
 * 数据格式：HTML 字符串（与 RR 简历数据完全兼容）
 * 扩展：StarterKit（含加粗/斜体/下划线/链接/列表）+ Highlight + TextAlign
 */
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML()
    // 空内容归一为空字符串，避免存 "<p></p>"
    emit('update:modelValue', ed.isEmpty ? '' : html)
  },
})

// 外部值变化（如切换编辑条目）时同步进编辑器
watch(
  () => props.modelValue,
  (val) => {
    const ed = editor.value
    if (!ed) return
    const current = ed.isEmpty ? '' : ed.getHTML()
    if (val !== current) ed.commands.setContent(val || '', { emitUpdate: false })
  },
)

onBeforeUnmount(() => editor.value?.destroy())

// 工具栏按钮定义
const buttons = [
  { icon: 'text-b', title: '加粗', run: () => editor.value.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold') },
  { icon: 'text-italic', title: '斜体', run: () => editor.value.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic') },
  { icon: 'text-underline', title: '下划线', run: () => editor.value.chain().focus().toggleUnderline().run(), isActive: () => editor.value?.isActive('underline') },
  { icon: 'text-strikethrough', title: '删除线', run: () => editor.value.chain().focus().toggleStrike().run(), isActive: () => editor.value?.isActive('strike') },
  { icon: 'highlighter', title: '高亮', run: () => editor.value.chain().focus().toggleHighlight().run(), isActive: () => editor.value?.isActive('highlight') },
  { icon: 'list-bullets', title: '无序列表', run: () => editor.value.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList') },
  { icon: 'list-numbers', title: '有序列表', run: () => editor.value.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList') },
  { icon: 'link-simple', title: '链接', run: toggleLink, isActive: () => editor.value?.isActive('link') },
  { icon: 'text-align-left', title: '左对齐', run: () => editor.value.chain().focus().setTextAlign('left').run(), isActive: () => editor.value?.isActive({ textAlign: 'left' }) },
  { icon: 'text-align-center', title: '居中', run: () => editor.value.chain().focus().setTextAlign('center').run(), isActive: () => editor.value?.isActive({ textAlign: 'center' }) },
  { icon: 'text-align-right', title: '右对齐', run: () => editor.value.chain().focus().setTextAlign('right').run(), isActive: () => editor.value?.isActive({ textAlign: 'right' }) },
  { icon: 'arrow-counter-clockwise', title: '撤销', run: () => editor.value.chain().focus().undo().run(), isActive: () => false },
  { icon: 'arrow-clockwise', title: '重做', run: () => editor.value.chain().focus().redo().run(), isActive: () => false },
]

function toggleLink() {
  const ed = editor.value
  if (ed.isActive('link')) {
    ed.chain().focus().unsetLink().run()
    return
  }
  const url = window.prompt('链接地址：', 'https://')
  if (url) ed.chain().focus().setLink({ href: url }).run()
}
</script>

<style scoped>
.rte { display: flex; flex-direction: column; gap: 5px; }

.rte-label { font-size: 12px; color: #94a3b8; }

.rte-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  background: #12122a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  padding: 4px;
}

.rte-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
}

.rte-btn:hover { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }
.rte-btn.active { background: #6366f1; color: #fff; }

.rte-content {
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 6px 6px;
  min-height: 96px;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* tiptap ProseMirror 编辑区样式（:deep 穿透） */
.rte-content :deep(.ProseMirror) {
  padding: 9px 11px;
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  outline: none;
  min-height: 96px;
}

.rte-content :deep(.ProseMirror p) { margin: 0 0 4px; }

.rte-content :deep(.ProseMirror ul),
.rte-content :deep(.ProseMirror ol) {
  padding-left: 20px;
  margin: 4px 0;
}

.rte-content :deep(.ProseMirror ul) { list-style: disc; }
.rte-content :deep(.ProseMirror ol) { list-style: decimal; }

.rte-content :deep(.ProseMirror a) { color: #818cf8; text-decoration: underline; }

.rte-content :deep(.ProseMirror mark) { background: #fde047; color: #1a1a1a; padding: 0 2px; }
</style>
