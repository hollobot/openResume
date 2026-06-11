<template>
  <label class="ti">
    <span v-if="label" class="ti-label">{{ label }}</span>
    <input
      class="ti-input"
      :value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ti {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.ti-label {
  font-size: 12px;
  color: #94a3b8;
}

.ti-input {
  width: 100%;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  color: #e2e8f0;
  outline: none;
  transition: border-color 0.15s;
}

.ti-input:focus { border-color: #6366f1; }
.ti-input:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
