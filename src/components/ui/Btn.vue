<template>
  <button
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`]"
    :disabled="disabled"
    :type="type"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'ghost' }, // primary | ghost | outline | danger
  size: { type: String, default: 'md' }, // sm | md
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-sm { padding: 4px 10px; font-size: 12px; }
.btn-md { padding: 7px 14px; font-size: 13px; }

.btn-primary {
  background: #6366f1;
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: #4f46e5; }

.btn-ghost {
  background: transparent;
  color: #94a3b8;
}
.btn-ghost:hover:not(:disabled) { background: rgba(255, 255, 255, 0.07); color: #e2e8f0; }

.btn-outline {
  background: transparent;
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.14);
}
.btn-outline:hover:not(:disabled) { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.28); }

.btn-danger {
  background: transparent;
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.3);
}
.btn-danger:hover:not(:disabled) { background: rgba(248, 113, 113, 0.12); }
</style>
