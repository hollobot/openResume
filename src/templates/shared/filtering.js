/**
 * 区块可见性与标题/图标解析（对应 RR shared/filtering.ts + section-title.ts）
 */

import { SECTION_DEFS } from '../../schema/index.js'

/**
 * 解析区块数据：标准 key 或自定义区块 UUID
 * @returns {{ section: object, type: string }|null}
 */
export function resolveSection(sectionId, data) {
  if (sectionId === 'summary') {
    return { section: data.summary, type: 'summary' }
  }
  if (data.sections[sectionId]) {
    return { section: data.sections[sectionId], type: sectionId }
  }
  const custom = data.customSections.find((s) => s.id === sectionId)
  if (custom) return { section: custom, type: custom.type }
  return null
}

/**
 * 区块显示标题：自定义 title 优先，否则用类型的中文默认名
 */
export function sectionTitle(sectionId, data) {
  const resolved = resolveSection(sectionId, data)
  if (!resolved) return ''
  return resolved.section.title || SECTION_DEFS[resolved.type]?.label || ''
}

/**
 * 区块标题图标：自定义 icon 优先，否则类型默认图标；'none' = 不显示
 */
export function sectionIcon(sectionId, data) {
  const resolved = resolveSection(sectionId, data)
  if (!resolved) return ''
  const icon = resolved.section.icon ?? SECTION_DEFS[resolved.type]?.defaultIcon ?? ''
  return icon === 'none' ? '' : icon
}

/**
 * 未隐藏的条目列表
 */
export function visibleItems(section) {
  if (!section || section.hidden) return []
  return (section.items || []).filter((it) => !it.hidden)
}

/**
 * 区块是否可见（summary 看 content，其余看是否有可见条目）
 */
export function isSectionVisible(sectionId, data) {
  const resolved = resolveSection(sectionId, data)
  if (!resolved) return false
  const { section, type } = resolved
  if (section.hidden) return false
  if (type === 'summary' && sectionId === 'summary') {
    return Boolean(section.content)
  }
  return visibleItems(section).length > 0
}
