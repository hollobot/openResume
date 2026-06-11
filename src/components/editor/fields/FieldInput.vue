<template>
  <label class="field" :class="{ 'field-block': type === 'textarea' }">
    <span class="field-label">{{ label }}</span>

    <!-- 多行文本 -->
    <textarea
      v-if="type === 'textarea'"
      class="field-control field-textarea"
      :value="modelValue"
      :placeholder="placeholder"
      rows="3"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <!-- 标签数组：以逗号 / 顿号分隔 -->
    <input
      v-else-if="type === 'tags'"
      class="field-control"
      :value="tagsText"
      placeholder="用逗号分隔，如：Vue, Spring Boot"
      @input="onTagsInput"
    />

    <!-- 链接对象：url + 显示文本 -->
    <span v-else-if="type === 'website'" class="field-website">
      <input
        class="field-control"
        :value="modelValue?.url"
        placeholder="https://..."
        @input="emitWebsite('url', $event.target.value)"
      />
      <input
        class="field-control"
        :value="modelValue?.label"
        placeholder="显示文本（可选）"
        @input="emitWebsite('label', $event.target.value)"
      />
    </span>

    <!-- 单行文本 -->
    <input
      v-else
      class="field-control"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' }, // text | textarea | tags | website
  modelValue: { type: [String, Array, Object], default: '' },
  placeholder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// 标签数组 ↔ 文本互转
const tagsText = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.join(', ') : ''))

function onTagsInput(e) {
  const arr = e.target.value
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean)
  emit('update:modelValue', arr)
}

// 链接对象：保留另一字段，仅更新被改的键
function emitWebsite(key, value) {
  emit('update:modelValue', { ...(props.modelValue || {}), [key]: value })
}
</script>

<style scoped>
.field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.field-block {
  align-items: flex-start;
}

.field-label {
  flex: 0 0 56px;
  font-size: 12px;
  color: #94a3b8;
  padding-top: 6px;
}

.field-control {
  flex: 1;
  min-width: 0;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 6px 9px;
  font-size: 13px;
  color: #e2e8f0;
  outline: none;
  transition: border-color 0.15s;
}

.field-control:focus {
  border-color: #4a90d9;
}

.field-textarea {
  resize: vertical;
  line-height: 1.5;
  font-family: inherit;
}

.field-website {
  flex: 1;
  display: flex;
  gap: 6px;
}
</style>
