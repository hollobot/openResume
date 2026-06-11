/**
 * 模板注册表
 *
 * 新增模板：建一个模板组件，按统一约定接收 `resume` prop，
 * 然后在此处登记 { id, name, component } 即可被预览与样式面板选用。
 */

import ClassicTemplate from './ClassicTemplate.vue'

export const TEMPLATES = [
  { id: 'classic', name: '经典单栏', component: ClassicTemplate },
]

const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t.component]))

/**
 * 按 id 取模板组件，未知 id 回退到第一个
 */
export function getTemplate(id) {
  return TEMPLATE_MAP[id] || TEMPLATES[0].component
}
