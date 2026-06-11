/**
 * 富文本 HTML 白名单净化（v-html 注入前调用）
 *
 * 数据来源是本地 tiptap 输出 + 导入的 JSON，净化是防御导入内容携带脚本。
 * 白名单对齐 RR rich-text 支持的标签集。
 */

const ALLOWED_TAGS = new Set([
  'p', 'ul', 'ol', 'li', 'a', 'b', 'strong', 'em', 'i', 'u', 's',
  'mark', 'code', 'br', 'span', 'div',
])

// 允许的属性（按标签）
const ALLOWED_ATTRS = {
  a: ['href', 'target', 'rel'],
  '*': ['style'],
}

// style 属性中仅允许的声明（避免任意 CSS 注入）
const ALLOWED_STYLE_PROPS = new Set(['text-align', 'color', 'background-color'])

function cleanStyle(value) {
  return value
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      const prop = s.split(':')[0]?.trim().toLowerCase()
      return prop && ALLOWED_STYLE_PROPS.has(prop)
    })
    .join('; ')
}

function cleanNode(node) {
  // 元素节点：白名单外直接展开为其子内容
  for (const child of [...node.children]) {
    const tag = child.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) {
      // 用子节点替换该元素（保留文本内容）
      child.replaceWith(...child.childNodes)
      continue
    }
    // 清理属性
    for (const attr of [...child.attributes]) {
      const name = attr.name.toLowerCase()
      const allowed = (ALLOWED_ATTRS[tag] || []).includes(name) || (ALLOWED_ATTRS['*'] || []).includes(name)
      if (!allowed || name.startsWith('on')) {
        child.removeAttribute(attr.name)
      } else if (name === 'style') {
        const cleaned = cleanStyle(attr.value)
        if (cleaned) child.setAttribute('style', cleaned)
        else child.removeAttribute('style')
      } else if (name === 'href' && /^\s*javascript:/i.test(attr.value)) {
        child.removeAttribute('href')
      }
    }
    cleanNode(child)
  }
}

/**
 * @param {string} html
 * @returns {string} 净化后的 HTML
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  cleanNode(doc.body)
  return doc.body.innerHTML
}
