/**
 * 画布视口：缩放（以光标为锚点）+ 拖拽平移 + 居中
 * （对应 RR 的 react-zoom-pan-pinch 用法：min 0.5 / max 5 / 初始 0.75）
 *
 * 用法：
 *   const vp = useArtboardViewport(containerRef, contentRef)
 *   容器绑定 @wheel/@mousedown，内容应用 vp.transformStyle
 */

import { reactive, computed, onMounted, nextTick } from 'vue'

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const INITIAL_SCALE = 0.75

export function useArtboardViewport(containerRef, contentRef) {
  const state = reactive({
    scale: INITIAL_SCALE,
    x: 0,
    y: 0,
    dragging: false,
  })

  // transform-origin 固定 0 0，平移量为屏幕像素
  const transformStyle = computed(() => ({
    transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
    transformOrigin: '0 0',
  }))

  // ── 缩放（滚轮，以光标为锚点） ─────────────────────────────

  function onWheel(e) {
    e.preventDefault()
    const rect = containerRef.value.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor))
    if (next === state.scale) return
    // 保持光标下的内容点不动：调整平移量
    const ratio = next / state.scale
    state.x = px - (px - state.x) * ratio
    state.y = py - (py - state.y) * ratio
    state.scale = next
  }

  function zoomBy(factor) {
    const rect = containerRef.value.getBoundingClientRect()
    // 以视口中心为锚点
    const cx = rect.width / 2
    const cy = rect.height / 2
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor))
    const ratio = next / state.scale
    state.x = cx - (cx - state.x) * ratio
    state.y = cy - (cy - state.y) * ratio
    state.scale = next
  }

  // ── 平移（按住空白拖拽） ───────────────────────────────────

  let startX = 0
  let startY = 0

  function onMouseDown(e) {
    // 仅左键，且不拦截页面内的文本选择/链接点击——按住即拖
    if (e.button !== 0) return
    state.dragging = true
    startX = e.clientX - state.x
    startY = e.clientY - state.y
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(e) {
    if (!state.dragging) return
    state.x = e.clientX - startX
    state.y = e.clientY - startY
  }

  function onMouseUp() {
    state.dragging = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // ── 居中 ─────────────────────────────────────────────────

  /**
   * 将内容水平居中、顶部留白，缩放重置为初始值
   */
  function center() {
    const container = containerRef.value
    const content = contentRef.value
    if (!container || !content) return
    state.scale = INITIAL_SCALE
    const cw = container.clientWidth
    const contentW = content.scrollWidth * state.scale
    state.x = Math.max(20, (cw - contentW) / 2)
    state.y = 28
  }

  onMounted(() => nextTick(center))

  return { state, transformStyle, onWheel, onMouseDown, zoomBy, center }
}
