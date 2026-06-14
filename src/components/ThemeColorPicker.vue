<script setup>
/**
 * 主题色取色面板（独立弹出，不放在设置面板里）。
 * 由工具栏「主题色」按钮点击弹出，包含 Sketch 取色器
 * （明度/饱和度方块 + 色相条 + Hex/RGBA 输入 + 预设色块）。
 * 选色实时写入 settings.themeColor（仅作用于区块标题）。
 */
import { Sketch } from '@ckpack/vue-color'
import { useResume } from '../composables/useResume.js'

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const { settings } = useResume()

// 预设主题色块（精选职业风配色）
const PRESET_COLORS = [
  '#1a1a1a', '#374151', '#2f6df6', '#1565c0', '#0e7490', '#0f766e',
  '#15803d', '#b45309', '#b91c1c', '#be123c', '#7c3aed', '#9d174d'
]

// Sketch 取色器回调：兼容字符串 / 对象两种返回，统一取 hex
function onColorUpdate(val) {
  const hex = typeof val === 'string' ? val : val && (val.hex || val.hex8)
  if (hex) settings.themeColor = hex
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="theme-overlay" @click="emit('close')">
      <!-- 下拉式面板：贴在工具栏下方右侧 -->
      <div class="theme-panel" @click.stop>
        <header class="theme-header">
          <span>主题色（区块标题）</span>
          <button class="close-btn" @click="emit('close')" aria-label="关闭">×</button>
        </header>

        <Sketch
          class="theme-sketch"
          :model-value="settings.themeColor || '#1a1a1a'"
          :preset-colors="PRESET_COLORS"
          disable-alpha
          @update:model-value="onColorUpdate"
        />

        <footer class="theme-footer">
          <span class="theme-value">{{ settings.themeColor || '默认黑' }}</span>
          <button v-if="settings.themeColor" class="mini-btn" @click="settings.themeColor = ''">
            恢复黑白
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.theme-overlay {
  position: fixed;
  inset: 0;
  z-index: 1700;
}
/* 贴在工具栏（高 56px）下方右侧，像下拉色板 */
.theme-panel {
  position: fixed;
  top: 60px;
  right: 16px;
  width: 236px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #eef0f3;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
}
.close-btn:hover {
  color: #111827;
}
/* 让 Sketch 取色器铺满面板宽度、去掉自带阴影 */
.theme-sketch {
  width: 100% !important;
  box-sizing: border-box;
  box-shadow: none !important;
}
.theme-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid #eef0f3;
}
.theme-value {
  font-size: 13px;
  color: #374151;
}
.mini-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.mini-btn:hover {
  background: #f3f4f6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
