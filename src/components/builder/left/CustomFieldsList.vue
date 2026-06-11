<template>
  <div>
    <!-- 字段列表（拖拽排序） -->
    <VueDraggable v-model="fields" handle=".cf-handle" :animation="150">
      <div v-for="(field, idx) in fields" :key="field.id" class="cf-row">
        <span class="cf-handle"><i class="ph ph-dots-six-vertical" /></span>
        <!-- 图标（点击循环常用图标不现实，用小型输入） -->
        <input
          v-model="field.icon"
          class="cf-icon-input"
          placeholder="图标"
          :title="`phosphor 图标名，当前：${field.icon || '无'}`"
        />
        <i v-if="field.icon" :class="`ph ph-${field.icon}`" class="cf-icon-preview" />
        <input v-model="field.text" class="cf-text" placeholder="文本内容" />
        <input v-model="field.link" class="cf-link" placeholder="链接(可选)" />
        <button class="cf-del" title="删除" @click="fields.splice(idx, 1)">
          <i class="ph ph-x" />
        </button>
      </div>
    </VueDraggable>

    <button class="cf-add" @click="addField"><i class="ph ph-plus" /> 添加字段</button>
  </div>
</template>

<script setup>
/**
 * basics 的自定义字段列表（对应 RR sections/custom-fields.tsx）
 * 每条 = { id, icon, text, link }，可拖拽排序
 */
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { draft } from '../../../stores/builder.js'
import { uid } from '../../../schema/index.js'

const fields = computed({
  get: () => draft.record.data.basics.customFields,
  set: (v) => {
    draft.record.data.basics.customFields = v
  },
})

function addField() {
  fields.value.push({ id: uid(), icon: '', text: '', link: '' })
}
</script>

<style scoped>
.cf-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
}

.cf-handle {
  color: #475569;
  cursor: grab;
  font-size: 13px;
  flex-shrink: 0;
}

.cf-icon-input {
  width: 56px;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 5px 6px;
  font-size: 11px;
  color: #e2e8f0;
  outline: none;
}

.cf-icon-preview { font-size: 14px; color: #818cf8; flex-shrink: 0; }

.cf-text,
.cf-link {
  flex: 1;
  min-width: 0;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 12px;
  color: #e2e8f0;
  outline: none;
}

.cf-text:focus,
.cf-link:focus,
.cf-icon-input:focus { border-color: #6366f1; }

.cf-del {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 3px;
  flex-shrink: 0;
}

.cf-del:hover { color: #f87171; }

.cf-add {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #818cf8;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
}

.cf-add:hover { color: #a5b4fc; }
</style>
