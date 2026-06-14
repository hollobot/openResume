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
import { avatarGeom, AVATAR_BASE_W } from '../utils/avatar.js'

const { markdown, settings } = useResume()

// A4 页面尺寸（96dpi）
const PAGE_W = 794
const PAGE_H = 1123
// 页边距改为可在设置中调整：上下(pagePadV) / 左右(pagePadH)
const padV = computed(() => settings.pagePadV)
const padH = computed(() => settings.pagePadH)
// 内容区尺寸随页边距联动（供分页计算）
const CONTENT_W = computed(() => PAGE_W - padH.value * 2)
const CONTENT_H = computed(() => PAGE_H - padV.value * 2)

// 证件照形状几何（比例 / 是否圆形）；基准宽度固定，基准高度随比例变化
const geom = computed(() => avatarGeom(settings.avatarShape))
const avatarBaseH = computed(() => Math.round((AVATAR_BASE_W * geom.value.h) / geom.value.w))

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

// 当前模板修饰类（default 用基础模板、不加修饰类）
const templateClass = computed(() =>
  settings.template && settings.template !== 'default' ? `tpl-${settings.template}` : ''
)

// 统计：页数 + 字数（按渲染后可见文本去标签去空白计）
const stats = computed(() => ({
  pages: pages.value.length,
  chars: html.value.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length
}))

// 字体 / 行距 / 主题色实时作用于每页内容
const contentStyle = computed(() => ({
  fontFamily: settings.fontFamily || undefined,
  lineHeight: settings.lineHeight || undefined,
  // 主题色注入到 CSS 变量；为空时不设置，回退到模板默认黑色
  '--rt-accent': settings.themeColor || undefined
}))

// 页边距实时作用于每页（与分页计算的内容尺寸保持一致）
const pageStyle = computed(() => ({
  padding: `${padV.value}px ${padH.value}px`
}))

// —— 分页 ——
const pages = ref([''])
function repaginate() {
  pages.value = paginate(html.value, {
    contentWidth: CONTENT_W.value,
    contentHeight: CONTENT_H.value,
    // 把模板修饰类一并交给离屏测量容器，保证分页高度与所选模板一致
    themeClass: ('resume-theme-default ' + templateClass.value).trim(),
    fontFamily: settings.fontFamily,
    lineHeight: settings.lineHeight
  })
}
// 内容 / 字体 / 行距 / 模板 / 页边距 / 自定义 CSS 变化都会影响排版高度，需重新分页
watch(
  [
    html,
    () => settings.template,
    () => settings.fontFamily,
    () => settings.lineHeight,
    () => settings.customCss,
    padV,
    padH
  ],
  () => nextTick(repaginate),
  { immediate: true }
)

// —— 证件照：选中态 + 拖动 + 等比缩放 ——
// 缩放系数允许范围（相对基准 90×120）
const SCALE_MIN = 0.4
const SCALE_MAX = 3

// 是否选中（仅 UI 状态，不持久化）：未选中时不可拖动 / 缩放
const avatarSelected = ref(false)

// 当前显示尺寸（基准 × 缩放系数）
const avatarW = computed(() => AVATAR_BASE_W * settings.avatarScale)
const avatarH = computed(() => avatarBaseH.value * settings.avatarScale)

// 证件照图片样式：圆形 / 圆角 + 可选描边
const avatarImgStyle = computed(() => ({
  borderRadius: geom.value.round ? '50%' : '4px',
  border: settings.avatarBorderWidth
    ? `${settings.avatarBorderWidth}px solid ${settings.avatarBorderColor}`
    : 'none'
}))

// 证件照外框样式：位置 + 尺寸
const avatarStyle = computed(() => ({
  left: settings.avatarPos.x + 'px',
  top: settings.avatarPos.y + 'px',
  width: avatarW.value + 'px',
  height: avatarH.value + 'px'
}))

// 把位置限制在页面内（随当前尺寸变化）
function clampPos(x, y) {
  const maxX = Math.max(0, PAGE_W - avatarW.value)
  const maxY = Math.max(0, PAGE_H - avatarH.value)
  return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) }
}

// 点击证件照：
//  - 未选中时，这次点击只负责「解锁」（选中），不触发拖动；
//  - 已选中时，再按下才开始拖动。
function onAvatarMouseDown(e) {
  if (!avatarSelected.value) {
    avatarSelected.value = true
    return
  }
  startDrag(e)
}
// 点击空白处：取消选中
function onBackgroundMouseDown() {
  avatarSelected.value = false
}

// —— 拖动移动 ——
let drag = null
function startDrag(e) {
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
  const p = clampPos(
    drag.origX + (e.clientX - drag.startX),
    drag.origY + (e.clientY - drag.startY)
  )
  settings.avatarPos.x = p.x
  settings.avatarPos.y = p.y
}
function onDragEnd() {
  drag = null
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

// —— 八手柄等比缩放（四角 + 四边中点）：锁定 3:4，锚定对侧不动 ——
// 每个手柄用归一化位置 [hfx, hfy] 表示，取值 0 / 0.5 / 1
const HANDLES = {
  tl: [0, 0], tm: [0.5, 0], tr: [1, 0],
  ml: [0, 0.5], mr: [1, 0.5],
  bl: [0, 1], bm: [0.5, 1], br: [1, 1]
}

let resize = null
function onResizeStart(e, id) {
  const [hfx, hfy] = HANDLES[id]
  const afx = 1 - hfx // 锚点（对侧）归一化位置
  const afy = 1 - hfy
  const w = avatarW.value
  const h = avatarH.value
  const x = settings.avatarPos.x
  const y = settings.avatarPos.y
  // 锚点页面坐标（缩放过程中保持不动）
  const anchorX = x + afx * w
  const anchorY = y + afy * h
  // 被拖手柄页面坐标
  const handleX = x + hfx * w
  const handleY = y + hfy * h
  // 驱动轴：上/下中点用纵向位移，其余用横向位移
  const axis = hfx === 0.5 ? 'y' : 'x'
  resize = {
    axis,
    afx,
    afy,
    anchorX,
    anchorY,
    startScale: settings.avatarScale,
    startPos: axis === 'x' ? e.clientX : e.clientY,
    baseDist: axis === 'x' ? Math.abs(handleX - anchorX) : Math.abs(handleY - anchorY),
    sign: axis === 'x' ? Math.sign(handleX - anchorX) : Math.sign(handleY - anchorY)
  }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}
function onResizeMove(e) {
  if (!resize) return
  const cur = resize.axis === 'x' ? e.clientX : e.clientY
  // 被拖手柄到锚点的新距离（沿驱动轴），换算为缩放系数
  const newDist = resize.baseDist + resize.sign * (cur - resize.startPos)
  let scale = (resize.startScale * newDist) / resize.baseDist
  scale = Math.min(Math.max(scale, SCALE_MIN), SCALE_MAX)
  settings.avatarScale = scale

  // 由锚点反推左上角，保证锚点不动
  const newW = AVATAR_BASE_W * scale
  const newH = avatarBaseH.value * scale
  const p = clampPos(resize.anchorX - resize.afx * newW, resize.anchorY - resize.afy * newH)
  settings.avatarPos.x = p.x
  settings.avatarPos.y = p.y
}
function onResizeEnd() {
  resize = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

onUnmounted(() => {
  clearTimeout(renderTimer)
  onDragEnd()
  onResizeEnd()
})

// 暴露给父组件：返回所有页面元素（导出目标）
defineExpose({
  getPages: () => (pagesEl.value ? Array.from(pagesEl.value.querySelectorAll('.page')) : [])
})
</script>

<template>
  <!-- 点击空白处取消证件照选中 -->
  <section class="preview-pane" @mousedown="onBackgroundMouseDown">
    <div class="pages-scroll">
      <div ref="pagesEl" class="pages">
        <!-- 每一页都是一张 A4 纸（页边距来自设置，与分页计算一致） -->
        <div v-for="(pageHtml, i) in pages" :key="i" class="page" :style="pageStyle">
        <div
          class="resume-theme-default page-content"
          :class="[
            templateClass,
            {
              'accent-extended': settings.themeColorExtended,
              'link-underline': settings.linkUnderline
            }
          ]"
          :style="contentStyle"
          v-html="pageHtml"
        ></div>
        <!-- 证件照固定在第 1 页：点击选中后才能拖动 / 等比缩放 -->
        <div
          v-if="settings.avatar && i === 0"
          class="resume-avatar"
          :class="{ selected: avatarSelected }"
          :style="avatarStyle"
          @mousedown.prevent.stop="onAvatarMouseDown"
        >
          <img
            class="resume-avatar-img"
            :src="settings.avatar"
            :style="avatarImgStyle"
            alt="证件照"
            draggable="false"
          />
          <!-- 选中态：边框 + 八个圆形缩放手柄 + 中心点；导出截图忽略此层 -->
          <div v-if="avatarSelected" class="avatar-selection" data-html2canvas-ignore="true">
            <span
              v-for="(pos, id) in HANDLES"
              :key="id"
              class="avatar-handle"
              :class="id"
              @mousedown.prevent.stop="onResizeStart($event, id)"
            ></span>
            <span class="avatar-center"></span>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏：页数 + 字数 -->
    <div class="preview-status">共 {{ stats.pages }} 页 · {{ stats.chars }} 字</div>
  </section>
</template>

<style scoped>
.preview-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #e9ebee;
  box-sizing: border-box;
  overflow: hidden; /* 兜底：自身不滚动，滚动交给内部 .pages-scroll */
}
/* 可滚动的纸张区域 */
.pages-scroll {
  flex: 1;
  min-height: 0; /* 关键：flex 列里允许收缩，才能在固定高度内部滚动，
                    否则会被内容撑高、把最外层撑出整页滚动条 */
  overflow: auto;
  padding: 24px;
  box-sizing: border-box;
}
/* 底部状态栏：页数 / 字数 */
.preview-status {
  flex: 0 0 auto;
  padding: 6px 16px;
  background: #f3f4f6;
  border-top: 1px solid #e2e5e9;
  font-size: 12px;
  color: #6b7280;
  text-align: right;
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
  /* 页边距由内联 style 注入（来自设置，与分页计算保持一致） */
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  overflow: hidden; /* 超长单块兜底，避免溢出到页外 */
}
.page-content {
  height: 100%;
}
/* 可操作证件照：绝对定位，不参与流式排版；尺寸由内联 style 控制 */
.resume-avatar {
  position: absolute;
  user-select: none;
  z-index: 2;
  cursor: grab;
}
.resume-avatar.selected {
  cursor: grabbing;
}
.resume-avatar-img {
  width: 100%;
  height: 100%;
  box-sizing: border-box; /* 描边计入尺寸，不撑大容器 */
  object-fit: cover;
  display: block;
  pointer-events: none; /* 交互交给外层 div，避免图片拦截 */
  /* border-radius / border 由内联 avatarImgStyle 控制（随形状/描边设置） */
}
.resume-avatar:hover .resume-avatar-img {
  box-shadow: 0 0 0 2px rgba(47, 109, 246, 0.35);
}
/* 选中态覆盖层：蓝色边框 + 八个圆形手柄 + 中心点
   用 outline 而非 border：outline 不占布局，手柄（相对本框定位）
   才能精确落在框的四边/四角上，不被边框宽度顶偏。 */
.avatar-selection {
  position: absolute;
  inset: 0;
  outline: 0.5px solid #3b9af0;
  pointer-events: none; /* 仅手柄可交互 */
}
.avatar-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #3b9af0;
  border: 1.5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
.avatar-handle.tl {
  left: -6px;
  top: -6px;
  cursor: nwse-resize;
}
.avatar-handle.tm {
  left: 50%;
  top: -6px;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.avatar-handle.tr {
  right: -6px;
  top: -6px;
  cursor: nesw-resize;
}
.avatar-handle.ml {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
.avatar-handle.mr {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
.avatar-handle.bl {
  left: -6px;
  bottom: -6px;
  cursor: nesw-resize;
}
.avatar-handle.bm {
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%);
  cursor: ns-resize;
}
.avatar-handle.br {
  right: -6px;
  bottom: -6px;
  cursor: nwse-resize;
}
/* 中心点：红色边框、白底、较小的圆；仅视觉，不拦截事件（点击中心仍可拖动本体） */
.avatar-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #e23b3b;
  pointer-events: none;
}
</style>
