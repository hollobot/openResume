<template>
  <SectionBase
    :anchor-id="sectionKey"
    :title="title"
    :icon="def.defaultIcon"
    :hidden="section.hidden"
    :columns="section.columns"
    :on-add="openCreate"
    @toggle-hidden="section.hidden = !section.hidden"
    @rename="onRename"
    @set-columns="section.columns = $event"
  >
    <p v-if="!section.items.length" class="is-empty">暂无内容</p>

    <!-- 条目列表（把手拖拽排序） -->
    <VueDraggable v-model="items" handle=".sir-handle" :animation="150">
      <SectionItemRow
        v-for="(item, idx) in section.items"
        :key="item.id"
        :item="item"
        :title="def.display.title(item)"
        :subtitle="def.display.subtitle(item)"
        @edit="openEdit(item)"
        @toggle-hidden="item.hidden = !item.hidden"
        @duplicate="duplicateItem(idx)"
        @remove="section.items.splice(idx, 1)"
      />
    </VueDraggable>

    <button class="is-add" @click="openCreate"><i class="ph ph-plus" /> 添加条目</button>
  </SectionBase>
</template>

<script setup>
/**
 * 标准区块编辑器（12 种类型通用）：
 * SectionBase 外壳 + 拖拽条目列表 + 条目 dialog（创建/编辑经全局 dialog store）
 */
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { draft } from '../../../stores/builder.js'
import { openDialog } from '../../../stores/dialog.js'
import { SECTION_DEFS, uid } from '../../../schema/index.js'
import SectionBase from './SectionBase.vue'
import SectionItemRow from './SectionItemRow.vue'

const props = defineProps({
  sectionKey: { type: String, required: true },
})

const def = SECTION_DEFS[props.sectionKey]
const section = computed(() => draft.record.data.sections[props.sectionKey])
const title = computed(() => section.value.title || def.label)

// VueDraggable 需要可写 v-model
const items = computed({
  get: () => section.value.items,
  set: (v) => {
    section.value.items = v
  },
})

function onRename(name) {
  section.value.title = name
}

function openCreate() {
  openDialog('section-item', { type: props.sectionKey, sectionKey: props.sectionKey })
}

function openEdit(item) {
  openDialog('section-item', { type: props.sectionKey, sectionKey: props.sectionKey, item })
}

function duplicateItem(idx) {
  const copy = structuredClone({ ...section.value.items[idx], id: uid() })
  section.value.items.splice(idx + 1, 0, copy)
}
</script>

<style scoped>
.is-empty {
  margin: 2px 0 8px;
  font-size: 12px;
  color: #475569;
}

.is-add {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px;
  margin-top: 2px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: transparent;
  border-radius: 7px;
  color: #818cf8;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.is-add:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.08); }
</style>
