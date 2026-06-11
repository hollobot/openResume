<template>
  <label class="sw" :class="{ 'sw-disabled': disabled }">
    <span v-if="label" class="sw-label">{{ label }}</span>
    <button
      class="sw-track"
      :class="{ 'sw-on': modelValue }"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      type="button"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="sw-thumb" />
    </button>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.sw {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.sw-disabled { opacity: 0.5; pointer-events: none; }

.sw-label { font-size: 12.5px; color: #cbd5e1; }

.sw-track {
  width: 34px;
  height: 19px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: none;
  position: relative;
  cursor: pointer;
  transition: background 0.18s;
  flex-shrink: 0;
}

.sw-track.sw-on { background: #6366f1; }

.sw-thumb {
  position: absolute;
  top: 2.5px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s;
}

.sw-on .sw-thumb { transform: translateX(14px); }
</style>
