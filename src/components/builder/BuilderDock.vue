<template>
  <div class="dock">
    <button class="dock-btn" title="缩小" @click="$emit('zoom-out')"><i class="ph ph-magnifying-glass-minus" /></button>
    <span class="dock-scale">{{ Math.round(scale * 100) }}%</span>
    <button class="dock-btn" title="放大" @click="$emit('zoom-in')"><i class="ph ph-magnifying-glass-plus" /></button>
    <button class="dock-btn" title="居中" @click="$emit('center')"><i class="ph ph-crosshair-simple" /></button>
  </div>
</template>

<script setup>
/**
 * 画布底部悬浮工具栏（对应 RR builder dock；导出按钮在阶段 2 接入）
 */
defineProps({
  scale: { type: Number, default: 0.75 },
})

defineEmits(['zoom-in', 'zoom-out', 'center'])
</script>

<style scoped>
.dock {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(22, 22, 46, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 4px 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.dock-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 7px;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}

.dock-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }

.dock-scale {
  min-width: 44px;
  text-align: center;
  font-size: 12px;
  color: #cbd5e1;
  user-select: none;
}
</style>
