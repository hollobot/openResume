<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @mousedown.self="$emit('close')">
        <div class="modal-panel" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
          <header v-if="title" class="modal-head">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-x" title="关闭" @click="$emit('close')">✕</button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '520px' },
})

const emit = defineEmits(['close'])

// Esc 关闭
function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (val) => {
    if (val) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-panel {
  width: 100%;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #16162e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
}

.modal-x {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}

.modal-x:hover { color: #e2e8f0; }

.modal-body {
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active { transition: opacity 0.18s; }
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel { transition: transform 0.18s; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel { transform: scale(0.96); }
</style>
