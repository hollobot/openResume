<template>
  <section class="editor-card">
    <header class="card-head">
      <h3 class="card-title">{{ section.title }}</h3>
      <button class="btn-add" @click="addItem">＋ 添加</button>
    </header>

    <div class="card-body">
      <p v-if="section.items.length === 0" class="empty">暂无内容，点击「添加」新建一条。</p>

      <div v-for="(item, idx) in section.items" :key="item.id" class="item">
        <div class="item-head">
          <span class="item-index">{{ idx + 1 }}</span>
          <span class="item-summary">{{ itemSummary(item) }}</span>
          <button class="btn-del" title="删除此条" @click="removeItem(idx)">✕</button>
        </div>

        <div class="item-fields">
          <FieldInput
            v-for="f in def.itemFields"
            :key="f.key"
            v-model="item[f.key]"
            :label="f.label"
            :type="f.type"
            :placeholder="f.placeholder"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { resume } from '../../composables/useResumeStore.js'
import { SECTION_DEF_MAP, blankItem } from '../../resume/schema.js'
import FieldInput from './fields/FieldInput.vue'

const props = defineProps({
  sectionKey: { type: String, required: true },
})

const def = SECTION_DEF_MAP[props.sectionKey]
const section = computed(() => resume.sections[props.sectionKey])

// 条目标题摘要：取第一个文本字段的值，方便折叠时辨认
function itemSummary(item) {
  const firstText = def.itemFields.find((f) => f.type === 'text')
  return (firstText && item[firstText.key]) || '（未命名）'
}

function addItem() {
  section.value.items.push(blankItem(props.sectionKey))
}

function removeItem(idx) {
  section.value.items.splice(idx, 1)
}
</script>

<style scoped>
.editor-card {
  background: #14142a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #181836;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0;
}

.btn-add {
  font-size: 12px;
  color: #93c5fd;
  background: transparent;
  border: 1px solid rgba(147, 197, 253, 0.3);
  border-radius: 5px;
  padding: 3px 9px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add:hover {
  background: rgba(147, 197, 253, 0.12);
}

.card-body {
  padding: 12px 14px;
}

.empty {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0;
}

.item {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
}

.item-index {
  flex: 0 0 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.item-summary {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-del {
  flex: 0 0 auto;
  font-size: 12px;
  color: #f87171;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
}

.btn-del:hover {
  color: #ef4444;
}

.item-fields {
  padding: 10px;
}
</style>
