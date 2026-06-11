/**
 * 简历状态 store（单例）
 *
 * - reactive 响应式数据，左栏表单读写、右栏模板渲染共享同一份。
 * - 自动从 localStorage 载入，变更后 800ms 防抖写回。
 * - 提供 JSON 导入 / 导出（纯字符串进出，便于备份与迁移）。
 */

import { reactive, watch } from 'vue'
import { createDefaultResume } from '../resume/schema.js'

const STORAGE_KEY = 'cv-resume-data'

/**
 * 从 localStorage 载入，解析失败则回退到默认数据
 */
function loadInitial() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return createDefaultResume()
  try {
    return JSON.parse(raw)
  } catch {
    return createDefaultResume()
  }
}

// 单例响应式状态
export const resume = reactive(loadInitial())

// ── 持久化：内容变更 800ms 后写回 localStorage ───────────────
let saveTimer = null
watch(
  resume,
  (val) => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, 800)
  },
  { deep: true },
)

/**
 * 用一份新数据整体替换当前 resume（保持同一个 reactive 引用）
 */
function replaceResume(data) {
  for (const key of Object.keys(resume)) delete resume[key]
  Object.assign(resume, data)
}

/**
 * 导出为格式化 JSON 字符串
 */
export function toJSON() {
  return JSON.stringify(resume, null, 2)
}

/**
 * 从 JSON 字符串导入并替换当前数据
 * @returns {boolean} 是否成功
 */
export function fromJSON(text) {
  try {
    const data = JSON.parse(text)
    if (!data || typeof data !== 'object') return false
    replaceResume(data)
    return true
  } catch {
    return false
  }
}

/**
 * 重置为默认示例数据
 */
export function resetResume() {
  replaceResume(createDefaultResume())
}
