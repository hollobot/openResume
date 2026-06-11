/**
 * 自定义样式规则常量（对齐 RR data.ts 的 styleSlotSchema / styleIntentSchema / styleRuleTargetSchema）
 *
 * 规则结构：
 *   { id, label, enabled, target: { scope, sectionType?, sectionId? }, slots: { [slot]: intent } }
 * 解析优先级：global < sectionType < sectionId（templates/shared/style-rules.js 实现合并）
 */

import { uid } from './uid.js'

// 15 个语义样式插槽
export const STYLE_SLOTS = [
  { key: 'section', label: '区块容器' },
  { key: 'heading', label: '区块标题' },
  { key: 'item', label: '条目' },
  { key: 'text', label: '正文文本' },
  { key: 'secondaryText', label: '次要文本' },
  { key: 'link', label: '链接' },
  { key: 'icon', label: '图标' },
  { key: 'level', label: '等级显示' },
  { key: 'richParagraph', label: '富文本段落' },
  { key: 'richList', label: '富文本列表' },
  { key: 'richListItemRow', label: '列表项行' },
  { key: 'richListItemContent', label: '列表项内容' },
  { key: 'richLink', label: '富文本链接' },
  { key: 'richBold', label: '富文本加粗' },
  { key: 'richMark', label: '富文本高亮' },
]

// 30 个样式意图属性（kind 驱动 CustomStyles 编辑器的控件类型）
export const STYLE_INTENT_FIELDS = [
  { key: 'color', label: '文字颜色', kind: 'color' },
  { key: 'backgroundColor', label: '背景色', kind: 'color' },
  { key: 'borderColor', label: '边框色', kind: 'color' },
  { key: 'textDecorationColor', label: '装饰线颜色', kind: 'color' },
  { key: 'opacity', label: '不透明度', kind: 'number', min: 0, max: 1, step: 0.05 },
  { key: 'fontSize', label: '字号(pt)', kind: 'number', min: 6, max: 48 },
  { key: 'fontWeight', label: '字重', kind: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { key: 'fontStyle', label: '字形', kind: 'select', options: ['normal', 'italic'] },
  { key: 'lineHeight', label: '行高', kind: 'number', min: 0.5, max: 4, step: 0.1 },
  { key: 'letterSpacing', label: '字间距(pt)', kind: 'number', min: -16, max: 16, step: 0.5 },
  { key: 'textDecoration', label: '装饰线', kind: 'select', options: ['none', 'underline', 'line-through'] },
  { key: 'textDecorationStyle', label: '装饰线样式', kind: 'select', options: ['solid', 'dashed', 'dotted'] },
  { key: 'textAlign', label: '对齐', kind: 'select', options: ['left', 'center', 'right', 'justify'] },
  { key: 'textTransform', label: '大小写', kind: 'select', options: ['none', 'uppercase', 'lowercase', 'capitalize'] },
  { key: 'padding', label: '内边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'paddingTop', label: '上内边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'paddingRight', label: '右内边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'paddingBottom', label: '下内边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'paddingLeft', label: '左内边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'marginTop', label: '上外边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'marginRight', label: '右外边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'marginBottom', label: '下外边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'marginLeft', label: '左外边距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'rowGap', label: '行间距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'columnGap', label: '列间距(pt)', kind: 'number', min: -72, max: 72 },
  { key: 'borderStyle', label: '边框样式', kind: 'select', options: ['solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: '边框宽(pt)', kind: 'number', min: 0, max: 72 },
  { key: 'borderRadius', label: '圆角(pt)', kind: 'number', min: 0, max: 72 },
]

// 规则作用域
export const TARGET_SCOPES = [
  { key: 'global', label: '全局' },
  { key: 'sectionType', label: '按区块类型' },
  { key: 'sectionId', label: '按指定区块' },
]

/**
 * 创建一条空白样式规则
 */
export function blankStyleRule() {
  return {
    id: uid(),
    label: '',
    enabled: true,
    target: { scope: 'global' },
    slots: {},
  }
}
