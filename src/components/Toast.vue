<script setup>
/**
 * Toast 容器：固定在右上角，渲染当前所有提示，带淡入淡出动画。
 */
import { useToast } from '../composables/useToast.js'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 68px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  min-width: 120px;
  padding: 10px 16px;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}
.toast--success {
  background: #16a34a;
}
.toast--error {
  background: #dc2626;
}
.toast--info {
  background: #2563eb;
}

/* 淡入淡出 + 轻微位移 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
