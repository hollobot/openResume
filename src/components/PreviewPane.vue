<script setup>
/**
 * 右侧预览区：PDF 预览模式
 * - 把 Markdown 渲染结果按 A4 自动分页，多页上下堆叠（带页边距与间隔），所见即导出。
 * - 证件照固定在第 1 页，可自由拖动（绝对定位，不受流式布局影响）。
 * - 对外暴露 getPages()，导出 PDF/PNG 时逐页截图。
 */
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { useResume } from '../composables/useResume.js'
import { renderMarkdown } from '../markdown/index.js'
import { paginate } from '../utils/paginate.js'

const { markdown, settings } = useResume()

// A4 页面尺寸（96dpi）与页边距
const PAGE_W = 794
const PAGE_H = 1123
const PAD_X = 56
const PAD_Y = 48
const CONTENT_W = PAGE_W - PAD_X * 2
const CONTENT_H = PAGE_H - PAD_Y * 2

// 证件照尺寸（与样式一致），用于拖动边界计算
const AVATAR_W = 92
const AVATAR_H = 122

// 页面堆叠容器引用（导出时从中取各页元素）
const pagesEl = ref(null)

// 预览渲染防抖：连续输入时不必每次按键都重新解析，停顿 120ms 后再渲染
const debouncedMd = ref(markdown.value)
let renderTimer = null
watch(markdown, (val) => {
  clearTimeout(renderTimer)
  renderTimer = setTimeout(() => {
    debouncedMd.value = val
  }, 120)
})

const html = computed(() => renderMarkdown(debouncedMd.value))

// 字体 / 行距实时作用于每页内容
const contentStyle = computed(() => ({
  fontFamily: settings.fontFamily || undefined,
  lineHeight: settings.lineHeight || undefined
}))

// —— 分页 ——
const pages = ref([''])
function repaginate() {
  pages.value = paginate(html.value, {
    contentWidth: CONTENT_W,
    contentHeight: CONTENT_H,
    themeClass: 'resume-theme-default',
    fontFamily: settings.fontFamily,
    lineHeight: settings.lineHeight
  })
}
// 内容 / 字体 / 行距 / 自定义 CSS 变化都会影响排版高度，需重新分页
watch(
  [html, () => settings.fontFamily, () => settings.lineHeight, () => settings.customCss],
  () => nextTick(repaginate),
  { immediate: true }
)

// 证件照位置
const avatarStyle = computed(() => ({
  left: settings.avatarPos.x + 'px',
  top: settings.avatarPos.y + 'px'
}))

// —— 证件照拖动（限定在第 1 页内）——
let drag = null
function onDragStart(e) {
  drag = {
    startX: e.clientX,
    startY: e.clientY,
    origX: settings.avatarPos.x,
    origY: settings.avatarPos.y
  }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}
function onDragMove(e) {
  if (!drag) return
  const maxX = Math.max(0, PAGE_W - AVATAR_W)
  const maxY = Math.max(0, PAGE_H - AVATAR_H)
  settings.avatarPos.x = Math.min(Math.max(0, drag.origX + (e.clientX - drag.startX)), maxX)
  settings.avatarPos.y = Math.min(Math.max(0, drag.origY + (e.clientY - drag.startY)), maxY)
}
function onDragEnd() {
  drag = null
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

onUnmounted(() => {
  clearTimeout(renderTimer)
  onDragEnd()
})

// 暴露给父组件：返回所有页面元素（导出目标）
defineExpose({
  getPages: () => (pagesEl.value ? Array.from(pagesEl.value.querySelectorAll('.page')) : [])
})
</script>

<template>
  <section class="preview-pane">
    <div ref="pagesEl" class="pages">
      <!-- 每一页都是一张 A4 纸（带页边距） -->
      <div v-for="(pageHtml, i) in pages" :key="i" class="page">
        <div
          class="resume-theme-default page-content"
          :style="contentStyle"
          v-html="pageHtml"
        ></div>
        <!-- 证件照固定在第 1 页，可拖动 -->
        <img
          v-if="settings.avatar && i === 0"
          class="resume-avatar"
          :src="settings.avatar"
          :style="avatarStyle"
          alt="证件照"
          draggable="false"
          @mousedown.prevent="onDragStart"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.preview-pane {
  height: 100%;
  overflow: auto;
  background: #e9ebee;
  padding: 24px;
  box-sizing: border-box;
}
.pages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* 页与页之间的间隔，像 PDF 阅读器 */
}
/* 单页 A4 纸张 */
.page {
  position: relative; /* 证件照绝对定位的参照 */
  width: 794px;
  height: 1123px;
  padding: 48px 56px; /* 页边距，与分页计算保持一致 */
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  overflow: hidden; /* 超长单块兜底，避免溢出到页外 */
}
.page-content {
  height: 100%;
}
/* 可拖动证件照：绝对定位，不参与流式排版 */
.resume-avatar {
  position: absolute;
  width: 92px;
  height: 122px;
  object-fit: cover;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  z-index: 2;
}
.resume-avatar:hover {
  box-shadow: 0 0 0 2px rgba(47, 109, 246, 0.5);
}
.resume-avatar:active {
  cursor: grabbing;
}
</style>
