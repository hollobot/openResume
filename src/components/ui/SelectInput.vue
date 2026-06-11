<template>
  <label class="sel">
    <span v-if="label" class="sel-label">{{ label }}</span>
    <select
      class="sel-input"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  // 支持 ['a','b'] 或 [{value,label}]
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const normalizedOptions = computed(() =>
  props.options.map((o) => (typeof o === 'object' ? o : { value: o, label: o })),
)
</script>

<style scoped>
.sel { display: flex; flex-direction: column; gap: 5px; min-width: 0; }

.sel-label { font-size: 12px; color: #94a3b8; }

.sel-input {
  width: 100%;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 7px 8px;
  font-size: 13px;
  color: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.sel-input:focus { border-color: #6366f1; }
.sel-input:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
