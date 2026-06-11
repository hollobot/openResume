/**
 * 旧版数据迁移：MVP 阶段的单简历（localStorage key: cv-resume-data）
 * → 新版多简历记录。仅在新索引不存在时执行一次；原 key 保留作备份。
 */

import { createResumeRecord, normalizeResumeData } from './index.js'

const OLD_KEY = 'cv-resume-data'

/**
 * 旧版描述是纯文本多行（"- " 开头为列表行），转为 tiptap 兼容 HTML
 */
function textToHtml(text) {
  if (!text) return ''
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = String(text).split('\n')
  const out = []
  let list = []
  const flush = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li><p>${esc(li)}</p></li>`).join('')}</ul>`)
      list = []
    }
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flush()
    } else if (line.startsWith('- ')) {
      list.push(line.slice(2))
    } else {
      flush()
      out.push(`<p>${esc(line)}</p>`)
    }
  }
  flush()
  return out.join('')
}

/**
 * 旧版条目 → 新版条目的字段映射（缺失字段由 normalizeResumeData 兜底）
 */
function mapOldSections(old) {
  const sections = {}
  const mapItems = (key, fn) => {
    const items = old.sections?.[key]?.items
    if (Array.isArray(items)) {
      sections[key] = { items: items.map(fn) }
    }
  }

  mapItems('profiles', (it) => ({ ...it }))
  mapItems('education', (it) => ({ ...it, description: textToHtml(it.description) }))
  mapItems('skills', (it) => ({
    id: it.id,
    hidden: it.hidden,
    name: it.name,
    // 旧版技能的 description 文本迁移为关键字提示放不下，保留到 proficiency 之外丢弃说明
    keywords: it.keywords || [],
  }))
  mapItems('experience', (it) => ({ ...it, description: textToHtml(it.description), roles: [] }))
  mapItems('projects', (it) => ({
    id: it.id,
    hidden: it.hidden,
    name: it.name,
    period: it.period,
    website: it.website,
    description: textToHtml(it.description),
  }))
  mapItems('awards', (it) => ({ ...it, description: textToHtml(it.description) }))
  return sections
}

/**
 * 执行迁移。
 * @returns {object|null} 迁移生成的简历记录；无旧数据或解析失败返回 null
 */
export function migrateLegacyResume() {
  const raw = localStorage.getItem(OLD_KEY)
  if (!raw) return null
  try {
    const old = JSON.parse(raw)
    if (!old || typeof old !== 'object' || !old.basics) return null

    const data = normalizeResumeData({
      basics: {
        name: old.basics.name || '',
        headline: old.basics.headline || '',
        email: old.basics.email || '',
        phone: old.basics.phone || '',
        location: old.basics.location || '',
        website: old.basics.website || { url: '', label: '' },
      },
      summary: {
        title: old.summary?.title || '',
        content: textToHtml(old.summary?.content),
      },
      sections: mapOldSections(old),
    })

    return createResumeRecord('我的简历', data)
  } catch {
    return null
  }
}
