/**
 * 简历 Markdown 解析器
 *
 * 支持的语法：
 * - YAML Frontmatter：个人信息、主题色、照片
 * - 标准 Markdown：标题、列表、粗体、斜体、链接
 * - 技能标签：`技能名` 渲染为彩色标签
 * - 分隔线：--- 渲染为区块分隔
 */

import { marked } from 'marked'
import jsyaml from 'js-yaml'

/**
 * 从 Markdown 文本中提取 YAML Frontmatter
 * 返回 { meta, body } —— meta 是解析后的对象，body 是剩余 MD 内容
 */
export function parseFrontmatter(raw) {
  const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
  const match = raw.match(FENCE)
  if (!match) return { meta: {}, body: raw }

  let meta = {}
  try {
    meta = jsyaml.load(match[1]) || {}
  } catch {
    // frontmatter 格式错误时降级为空对象
  }
  return { meta, body: match[2] }
}

/**
 * 将简历 body Markdown 渲染为 HTML
 * 自定义规则：
 * - `text` inline code → <span class="skill-tag">text</span>
 * - ## 二级标题 → 带左侧色条的 section 标题
 */
export function renderBody(markdown) {
  const renderer = new marked.Renderer()

  // 二级标题渲染为带分组样式的 section 标题
  renderer.heading = ({ text, depth }) => {
    if (depth === 2) {
      return `<h2 class="resume-section-title"><span>${text}</span></h2>`
    }
    if (depth === 3) {
      // 解析 "公司 · 职位" 或 "学校 · 专业" 格式
      return `<h3 class="resume-entry-title">${text}</h3>`
    }
    return `<h${depth}>${text}</h${depth}>`
  }

  // inline code 渲染为技能标签
  renderer.codespan = ({ text }) => {
    return `<span class="skill-tag">${text}</span>`
  }

  // 段落渲染
  renderer.paragraph = ({ text }) => {
    return `<p class="resume-paragraph">${text}</p>`
  }

  // 列表渲染
  renderer.list = ({ body, ordered }) => {
    const tag = ordered ? 'ol' : 'ul'
    return `<${tag} class="resume-list">${body}</${tag}>`
  }

  renderer.listitem = ({ text }) => {
    return `<li>${text}</li>`
  }

  marked.setOptions({ renderer })

  return marked.parse(markdown)
}

/**
 * 将头部 meta 渲染为简历头部 HTML
 * 支持字段：name, title, email, phone, location, github, website, photo, color
 */
export function renderHeader(meta) {
  const { name, title, email, phone, location, github, website, photo, color } = meta
  const accentColor = color || '#4A90D9'

  // 联系信息条目
  const contactItems = [
    phone ? `<span class="contact-item">📞 ${phone}</span>` : '',
    email ? `<a class="contact-item" href="mailto:${email}">✉ ${email}</a>` : '',
    location ? `<span class="contact-item">📍 ${location}</span>` : '',
    github ? `<a class="contact-item" href="https://${github}" target="_blank">⌁ ${github}</a>` : '',
    website ? `<a class="contact-item" href="https://${website}" target="_blank">🔗 ${website}</a>` : '',
  ].filter(Boolean).join('')

  const photoHtml = photo
    ? `<img class="resume-photo" src="${photo}" alt="照片" />`
    : ''

  return `
    <div class="resume-header" style="--accent-color: ${accentColor}">
      <div class="resume-header-main">
        <div class="resume-header-info">
          <h1 class="resume-name">${name || '姓名'}</h1>
          ${title ? `<p class="resume-title">${title}</p>` : ''}
          ${contactItems ? `<div class="resume-contacts">${contactItems}</div>` : ''}
        </div>
        ${photoHtml}
      </div>
    </div>
  `
}

/**
 * 完整解析入口：raw MD → { header: HTML, body: HTML, meta }
 */
export function parseResume(raw) {
  const { meta, body } = parseFrontmatter(raw)
  const header = renderHeader(meta)
  const body_html = renderBody(body)
  return { header, body: body_html, meta }
}
