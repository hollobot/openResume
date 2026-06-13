/**
 * 轻提示（Toast）系统
 * 模块级单例：任意组件调用 show() 即可在右上角弹出短暂提示，到时自动消失。
 */
import { reactive } from 'vue'

const state = reactive({ toasts: [] })
let seed = 0

export function useToast() {
  /**
   * 弹出一条提示
   * @param {string} message 文本
   * @param {'success'|'error'|'info'} type 类型（影响配色）
   * @param {number} duration 显示毫秒数
   */
  function show(message, type = 'success', duration = 1800) {
    const id = ++seed
    state.toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = state.toasts.findIndex((t) => t.id === id)
      if (idx !== -1) state.toasts.splice(idx, 1)
    }, duration)
  }

  return { toasts: state.toasts, show }
}
