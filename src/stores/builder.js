/**
 * builder 草稿 store（当前正在编辑的简历）
 *
 * 用法：BuilderPage 进入时 loadDraft(id)，离开时 unloadDraft()。
 * 组件直接读写 draft.record.data（Vue reactive 深层可变），
 * 深度 watch + 500ms 防抖持久化（对齐 RR 的 SAVE_DEBOUNCE_MS）。
 */

import { reactive, watch } from 'vue'
import { getResumeRecord, persistResumeRecord } from './resumes.js'

const SAVE_DEBOUNCE_MS = 500

export const draft = reactive({
  record: null, // 当前简历完整记录；null = 未加载
})

let saveTimer = null
let stopWatcher = null

function flushSave() {
  clearTimeout(saveTimer)
  saveTimer = null
  if (draft.record) persistResumeRecord(draft.record)
}

/**
 * 加载指定简历进入编辑态
 * @returns {boolean} id 是否存在
 */
export function loadDraft(id) {
  unloadDraft()
  const record = getResumeRecord(id)
  if (!record) return false
  draft.record = record

  // 深度监听数据变化 → 防抖持久化
  stopWatcher = watch(
    () => draft.record,
    () => {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
    },
    { deep: true },
  )

  // 页面卸载前兜底保存
  window.addEventListener('beforeunload', flushSave)
  return true
}

/**
 * 退出编辑态：立即保存挂起的修改并解除监听
 */
export function unloadDraft() {
  if (saveTimer) flushSave()
  stopWatcher?.()
  stopWatcher = null
  window.removeEventListener('beforeunload', flushSave)
  draft.record = null
}
