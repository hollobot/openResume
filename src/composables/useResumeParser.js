/**
 * 简历 Markdown 解析器
 *
 * 语法规范见 docs/语法.md，支持：
 *
 * 标准 Markdown：
 *   # 姓名          → 简历主标题
 *   ## 区块标题     → 带下划线的 section 标题
 *   **粗体** *斜体* 列表、链接、&nbsp; 等
 *
 * 扩展块语法：
 *   ::: left  ...  :::   → 左栏（紧跟 ::: right 时合并为一行，左右对齐）
 *   ::: right ...  :::   → 右栏（通常放日期，右对齐）
 *   :::cols   ...  :::   → 多列等宽布局（空行分隔列）
 *   :::info   ...  :::   → 信息提示框
 *
 * 扩展行内语法：
 *   icon:phone           → 内置图标（映射表见 ICON_MAP，支持 60+ 种）
 *   `技能名`             → 圆角技能标签
 *   ### 标题 | 日期      → 条目标题，日期右对齐
 */

import { Marked } from 'marked'
import jsyaml from 'js-yaml'

// ── icon:xxx 图标映射表 ──────────────────────────────────────
// 用户也可以直接在 MD 里输入任意 emoji，此表仅提供语义化别名

const ICON_MAP = {
  // 联系方式
  phone: '📞', tel: '📞', mobile: '📱',
  email: '✉️', mail: '✉️',
  wechat: '💬', weixin: '💬', qq: '🐧',
  location: '📍', address: '📍', map: '📍',
  home: '🏠', web: '🌐', website: '🌐', blog: '📝',
  github: '🐱', git: '🐱', link: '🔗',
  // 个人信息
  info: '👤', user: '👤', male: '♂️', female: '♀️',
  birthday: '🎂', age: '🎂',
  // 教育 / 工作
  edu: '🎓', school: '🎓', degree: '🎓',
  work: '💼', company: '🏢', job: '💼',
  project: '📦', team: '👥',
  // 技能 / 成就
  skill: '🛠️', code: '💻', tool: '🔧',
  award: '🏆', trophy: '🏆', medal: '🏅', star: '⭐', cert: '📜',
  // 通用
  calendar: '📅', date: '📅', time: '⏰',
  book: '📖', pen: '✍️', idea: '💡', target: '🎯',
  rocket: '🚀', fire: '🔥', heart: '❤️', check: '✅',
  money: '💰', chart: '📈', music: '🎵', game: '🎮',
  camera: '📷', search: '🔍', flag: '🚩', pin: '📌',
}

// ── Marked 实例及扩展注册 ─────────────────────────────────────

const markedInstance = new Marked()

markedInstance.use({
  extensions: [
    // ── ::: left ... ::: (+ 可选紧跟 ::: right ... :::) → 左右两栏行 ──
    {
      name: 'row',
      level: 'block',
      start(src) { return src.search(/:{3}\s*left/) },
      tokenizer(src) {
        // 匹配 left 块，及其后紧跟的 right 块（right 内容允许为空）
        const match = src.match(
          /^:{3}[ \t]*left[ \t]*\n([\s\S]*?)\n?:{3}[ \t]*(?:\n+:{3}[ \t]*right[ \t]*\n([\s\S]*?)\n?:{3}[ \t]*)?(?:\n|$)/
        )
        if (!match) return undefined
        return {
          type: 'row',
          raw: match[0],
          left: match[1] || '',
          right: match[2] || '',
        }
      },
      renderer(token) {
        const left = markedInstance.parse(token.left.trim())
        const right = token.right.trim()
          ? markedInstance.parse(token.right.trim())
          : ''
        return `<div class="resume-row"><div class="row-left">${left}</div>${right ? `<div class="row-right">${right}</div>` : ''}</div>\n`
      },
    },

    // ── :::cols / :::info 等通用容器 ──
    {
      name: 'container',
      level: 'block',
      start(src) { return src.indexOf(':::') },
      tokenizer(src) {
        const match = src.match(/^:{3}([\w-]*)([^\n]*)\n([\s\S]*?)\n:{3}(?:\n|$)/)
        if (!match) return undefined
        const kind = match[1].trim()
        // left/right 已由 row 扩展处理，此处跳过避免冲突
        if (kind === 'left' || kind === 'right') return undefined
        return {
          type: 'container',
          raw: match[0],
          kind: kind || 'default',
          args: match[2].trim(),
          text: match[3],
        }
      },
      renderer(token) {
        // :::cols —— 多列等宽布局，列之间用空行分隔
        if (token.kind === 'cols') {
          const colCount = parseInt(token.args) || 0
          const parts = token.text.split(/\n{2,}/).filter(s => s.trim())
          const n = colCount > 0 ? colCount : parts.length
          const cols = parts
            .map(p => `<div class="resume-col">${markedInstance.parse(p.trim())}</div>`)
            .join('')
          return `<div class="resume-cols" style="grid-template-columns: repeat(${n}, 1fr)">${cols}</div>\n`
        }
        // :::info / :::tip —— 提示框
        if (token.kind === 'info' || token.kind === 'tip') {
          return `<div class="resume-callout">${markedInstance.parse(token.text)}</div>\n`
        }
        return `<div class="resume-block-${token.kind}">${markedInstance.parse(token.text)}</div>\n`
      },
    },

    // ── icon:xxx 行内图标 ──
    {
      name: 'icon',
      level: 'inline',
      start(src) { return src.indexOf('icon:') },
      tokenizer(src) {
        const match = src.match(/^icon:([a-zA-Z][\w-]*)/)
        if (!match) return undefined
        return { type: 'icon', raw: match[0], key: match[1] }
      },
      renderer(token) {
        const emoji = ICON_MAP[token.key]
        // 未知图标名降级显示原文，方便用户排查拼写
        return emoji
          ? `<span class="resume-icon">${emoji}</span>`
          : `<span class="resume-icon-unknown">icon:${token.key}</span>`
      },
    },
  ],

  // ── 标题与行内元素渲染覆盖 ──
  renderer: {
    /**
     * h1 → 简历姓名主标题
     * h2 → 区块标题（带下划线）
     * h3 → 条目标题，"### 标题 | 日期" 时日期右对齐
     */
    heading(token) {
      const innerHtml = markedInstance.parseInline(token.text)

      if (token.depth === 1) {
        return `<h1 class="resume-name">${innerHtml}</h1>\n`
      }
      if (token.depth === 2) {
        return `<h2 class="resume-section-title">${innerHtml}</h2>\n`
      }
      if (token.depth === 3) {
        const pipeIdx = token.text.indexOf(' | ')
        if (pipeIdx !== -1) {
          const left  = markedInstance.parseInline(token.text.slice(0, pipeIdx))
          const right = markedInstance.parseInline(token.text.slice(pipeIdx + 3))
          return `<h3 class="resume-entry-title"><span>${left}</span><span class="entry-date">${right}</span></h3>\n`
        }
        return `<h3 class="resume-entry-title"><span>${innerHtml}</span></h3>\n`
      }
      return false // h4+ 默认渲染
    },

    /** inline code → 技能标签 */
    codespan(token) {
      return `<span class="skill-tag">${token.text}</span>`
    },
  },
})

// ── Frontmatter 解析（可选，用于 photo / color 等页面级配置） ──

/**
 * 从原始 MD 文本提取 YAML Frontmatter
 * 简历正文语法不依赖 frontmatter，此处仅用于 photo/color 等配置
 * @returns {{ meta: object, body: string }}
 */
export function parseFrontmatter(raw) {
  const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
  const match = raw.match(FENCE)
  if (!match) return { meta: {}, body: raw }

  let meta = {}
  try {
    meta = jsyaml.load(match[1]) || {}
  } catch {
    // 格式错误时降级为空，不中断渲染
  }
  return { meta, body: match[2] }
}

// ── 对外统一入口 ─────────────────────────────────────────────

/**
 * 完整解析：rawMD → { html: string, meta: object }
 * meta.photo 存在时在页面右上角渲染头像
 */
export function parseResume(raw) {
  const { meta, body } = parseFrontmatter(raw)

  const photoHtml = meta.photo
    ? `<img class="resume-photo" src="${meta.photo}" alt="照片" />`
    : ''

  return {
    html: photoHtml + markedInstance.parse(body),
    meta,
  }
}
