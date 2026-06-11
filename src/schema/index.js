/**
 * schema 层统一出口
 *
 * normalizeResumeData：导入/读档时把任意来源的数据与默认结构深合并并纠偏，
 * 等价于 RR zod schema 的 .catch() 容错语义，是 JSON 导入鲁棒性的关键。
 */

import { createDefaultResumeData } from './default.js'
import { uid } from './uid.js'

export { uid } from './uid.js'
export { createDefaultResumeData } from './default.js'
export {
  SECTION_DEFS,
  STANDARD_SECTION_KEYS,
  CUSTOM_SECTION_TYPES,
  blankItem,
  blankRole,
} from './section-defs.js'
export { STYLE_SLOTS, STYLE_INTENT_FIELDS, TARGET_SCOPES, blankStyleRule } from './style-rules.js'
export { TEMPLATE_LIST } from './templates.js'
export { FONT_LIST, FONT_WEIGHTS } from './fonts.js'
export { createSampleResumeData } from './sample.js'

/**
 * 深合并：以 defaults 为骨架，用 raw 中类型匹配的值覆盖。
 * - 数组直接取 raw 的（条目结构不强校验，渲染端容错）
 * - 对象递归；原始类型须 typeof 一致才采纳
 */
function deepMergeWithDefaults(defaults, raw) {
  if (raw === undefined || raw === null) return defaults
  if (Array.isArray(defaults)) {
    return Array.isArray(raw) ? raw : defaults
  }
  if (typeof defaults === 'object') {
    if (typeof raw !== 'object' || Array.isArray(raw)) return defaults
    const out = {}
    for (const key of Object.keys(defaults)) {
      out[key] = deepMergeWithDefaults(defaults[key], raw[key])
    }
    return out
  }
  return typeof raw === typeof defaults ? raw : defaults
}

/**
 * 规范化简历数据：缺失字段补默认值，类型错误回退默认值。
 * customSections 为开放数组，原样保留（渲染端按 type 容错）。
 * @param {object} raw - 任意来源的简历数据（RR 导出 JSON / 本地存档）
 * @returns {object} 完整合法的 ResumeData
 */
export function normalizeResumeData(raw) {
  const defaults = createDefaultResumeData()
  const data = deepMergeWithDefaults(defaults, raw || {})
  // layout.pages 至少保证一页
  if (!data.metadata.layout.pages.length) {
    data.metadata.layout.pages = defaults.metadata.layout.pages
  }
  return data
}

/**
 * 创建一条完整的简历记录（仪表盘列表的存储单元）
 * @param {string} name - 简历名称
 * @param {object|null} data - 初始 ResumeData，缺省为空白默认
 */
export function createResumeRecord(name, data = null) {
  const now = Date.now()
  return {
    id: uid(),
    name,
    slug: '',
    isLocked: false,
    createdAt: now,
    updatedAt: now,
    data: normalizeResumeData(data),
  }
}
