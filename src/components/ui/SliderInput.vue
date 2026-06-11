<template>
  <div class="si">
    <div class="si-head">
      <span v-if="label" class="si-label">{{ label }}</span>
      <input
        class="si-num"
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @input="emitValue($event.target.value)"
      />
    </div>
    <input
      class="si-range"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="emitValue($event.target.value)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  label: { type: String, default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function emitValue(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, n)))
}
</script>

<style scoped>
.si { display: flex; flex-direction: column; gap: 4px; }

.si-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.si-label { font-size: 12px; color: #94a3b8; }

.si-num {
  width: 64px;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 3px 6px;
  font-size: 12px;
  color: #e2e8f0;
  outline: none;
  text-align: right;
}

.si-num:focus { border-color: #6366f1; }

.si-range {
  width: 100%;
  accent-color: #6366f1;
  cursor: pointer;
}
</style>
