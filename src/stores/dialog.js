/**
 * 全局 dialog store（对齐 RR dialogs/store.ts）
 *
 * type 约定：
 *   'section-item'       条目创建/编辑 payload: { sectionType, sectionKey, customSectionId?, item? }
 *   'resume-create' | 'resume-rename' | 'resume-duplicate' | 'resume-delete' | 'resume-import'
 *   'template-gallery'
 * item 存在 = 编辑模式，否则创建模式。
 */

import { reactive } from 'vue'

export const dialog = reactive({
  open: false,
  type: '',
  payload: null,
})

export function openDialog(type, payload = null) {
  dialog.type = type
  dialog.payload = payload
  dialog.open = true
}

export function closeDialog() {
  dialog.open = false
  // 留住 type/payload 直到下次打开，避免关闭动画期间内容闪空
}
