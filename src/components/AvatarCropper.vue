<script setup>
/**
 * 证件照裁剪弹窗：固定 92:122 比例的取景框，原图按「填充(cover)」铺满框，
 * 用户仅拖动原图来选择构图（不缩放）。确认时按高分辨率输出裁剪结果，
 * 避免此前降采样成小图导致导出模糊。
 *
 * 用法：父组件传入 open / src（原图 dataURL），监听 confirm(dataUrl) 与 cancel。
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useResume } from '../composables/useResume.js'
import { avatarGeom } from '../utils/avatar.js'

const { settings } = useResume()
// 形状几何（比例 / 是否圆形）由设置决定
const geom = computed(() => avatarGeom(settings.avatarShape))

// 取景框显示尺寸：宽固定，高随比例
const FRAME_W = 240
const frameH = computed(() => Math.round((FRAME_W * geom.value.h) / geom.value.w))
// 输出分辨率：宽固定 600，高随比例（圆形按方形输出，显示时再裁成圆）
const OUT_W = 600
const outH = computed(() => Math.round((OUT_W * geom.value.h) / geom.value.w))

const props = defineProps({
  open: { type: Boolean, default: false },
  src: { type: String, default: '' }
})
const emit = defineEmits(['confirm', 'cancel'])

// 原图自然尺寸与「填充」缩放比
const nat = ref({ w: 0, h: 0 })
const coverScale = ref(1) // 让原图恰好盖住取景框的缩放比
// 原图左上角相对取景框左上角的偏移（px，始终 ≤ 0，保证铺满）
const offset = ref({ x: 0, y: 0 })

// 缩放后图片显示尺寸
function dispW() {
  return nat.value.w * coverScale.value
}
function dispH() {
  return nat.value.h * coverScale.value
}

// 把偏移限制在「图片始终盖满取景框」的范围内
function clampOffset(x, y) {
  const minX = FRAME_W - dispW()
  const minY = frameH.value - dispH()
  return {
    x: Math.min(0, Math.max(minX, x)),
    y: Math.min(0, Math.max(minY, y))
  }
}

// 原图载入：计算 cover 缩放并居中
function loadImage(src) {
  if (!src) return
  const img = new Image()
  img.onload = () => {
    nat.value = { w: img.naturalWidth, h: img.naturalHeight }
    coverScale.value = Math.max(FRAME_W / img.naturalWidth, frameH.value / img.naturalHeight)
    // 居中显示
    offset.value = clampOffset((FRAME_W - dispW()) / 2, (frameH.value - dispH()) / 2)
  }
  img.src = src
}
// 打开 / 换图 / 改比例时重新载入并居中
watch(
  () => [props.open, props.src, frameH.value],
  () => {
    if (props.open) loadImage(props.src)
  },
  { immediate: true }
)

// —— 拖动定位 ——
let drag = null
function onDragStart(e) {
  drag = { startX: e.clientX, startY: e.clientY, origX: offset.value.x, origY: offset.value.y }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}
function onDragMove(e) {
  if (!drag) return
  offset.value = clampOffset(
    drag.origX + (e.clientX - drag.startX),
    drag.origY + (e.clientY - drag.startY)
  )
}
function onDragEnd() {
  drag = null
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}
onUnmounted(onDragEnd)

// —— 确认：把取景框对应的原图区域按高分辨率绘制输出 ——
function confirm() {
  const s = coverScale.value
  if (!s || !nat.value.w) return
  // 取景框在原图中的源矩形（offset 为负，除以缩放比换算回原图像素）
  const sx = -offset.value.x / s
  const sy = -offset.value.y / s
  const sw = FRAME_W / s
  const sh = frameH.value / s

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = outH.value
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_W, outH.value)
    emit('confirm', canvas.toDataURL('image/jpeg', 0.92))
  }
  img.src = props.src
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="cropper-overlay" @click="emit('cancel')">
      <div class="cropper-dialog" @click.stop>
        <header class="cropper-header">
          <span>调整证件照</span>
          <button class="close-btn" @click="emit('cancel')" aria-label="关闭">×</button>
        </header>

        <div class="cropper-body">
          <!-- 固定比例取景框：原图绝对定位，仅可拖动；圆形时圆形遮罩 -->
          <div
            class="cropper-frame"
            :class="{ round: geom.round }"
            :style="{ width: FRAME_W + 'px', height: frameH + 'px' }"
            @mousedown.prevent="onDragStart"
          >
            <img
              v-if="src"
              class="cropper-img"
              :src="src"
              :style="{
                width: dispW() + 'px',
                height: dispH() + 'px',
                left: offset.x + 'px',
                top: offset.y + 'px'
              }"
              draggable="false"
              alt="原图"
            />
          </div>
          <p class="cropper-hint">拖动照片选择合适的构图，窗口比例固定为证件照尺寸。</p>
        </div>

        <footer class="cropper-footer">
          <button class="btn btn-ghost" @click="emit('cancel')">取消</button>
          <button class="btn" @click="confirm">确定</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cropper-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cropper-dialog {
  width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.cropper-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid #eef0f3;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
}
.close-btn:hover {
  color: #111827;
}
.cropper-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* 取景框：固定比例、裁掉溢出部分 */
.cropper-frame {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: #f0f1f3;
  cursor: grab;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
.cropper-frame.round {
  border-radius: 50%; /* 圆形取景预览 */
}
.cropper-frame:active {
  cursor: grabbing;
}
.cropper-img {
  position: absolute;
  user-select: none;
  max-width: none; /* 覆盖全局 img 约束，按计算尺寸显示 */
}
.cropper-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #9aa0a6;
  text-align: center;
}
.cropper-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid #eef0f3;
}
.btn {
  height: 34px;
  padding: 0 18px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.btn:hover {
  background: #2563eb;
}
.btn-ghost {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-ghost:hover {
  background: #f3f4f6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
