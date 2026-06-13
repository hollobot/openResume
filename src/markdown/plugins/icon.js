/**
 * markdown-it 行内图标插件（基于 lucide 图标库）
 *
 * 语法：icon:phone / icon:map-pin / icon:graduation-cap …
 *   - 常用简历名（phone/email/blog/location…）通过别名表映射到 lucide 图标。
 *   - 也支持直接写任意 lucide 图标名（kebab 形式，如 icon:briefcase）。
 *   - github / wechat 等品牌图标 lucide 已移除，这里保留手绘 SVG 以保证辨识度。
 *   - 未匹配到的名称原样保留为文本。
 *
 * 实现为 core 规则：在 inline 解析后遍历 text 子 token，用正则切分替换，
 * 以正确处理「一行内多个 icon:」的情况（inline ruler 会被贪婪 text 规则吞字）。
 * 图标统一输出为内联 SVG，导出 PDF / PNG（html2canvas 截图）时也能正常呈现。
 */
import * as lucide from 'lucide'

// 品牌图标（lucide 已移除）：用描边风格 SVG，与 lucide 图标保持统一观感
const STROKE_BRAND = {
  github:
    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'
}

// 常用简历图标名 -> lucide 图标名（PascalCase）
const ALIASES = {
  phone: 'Phone',
  tel: 'Phone',
  email: 'Mail',
  mail: 'Mail',
  blog: 'Rss',
  rss: 'Rss',
  info: 'Info',
  link: 'Link',
  url: 'Link',
  location: 'MapPin',
  address: 'MapPin',
  map: 'MapPin',
  wechat: 'MessageCircle',
  weixin: 'MessageCircle',
  qq: 'MessageSquare',
  calendar: 'Calendar',
  date: 'Calendar',
  time: 'Calendar',
  home: 'House',
  web: 'Globe',
  website: 'Globe',
  globe: 'Globe',
  user: 'User',
  age: 'User',
  gender: 'User',
  edu: 'GraduationCap',
  education: 'GraduationCap',
  work: 'Briefcase',
  job: 'Briefcase'
}

// 匹配 icon:name（name 由字母/数字/下划线/连字符组成）
const ICON_RE = /icon:([a-zA-Z0-9_-]+)/g

// kebab/snake 名转 lucide 的 PascalCase，如 map-pin -> MapPin
function toPascal(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

// 把 lucide 的 IconNode（[ [tag, attrs], ... ]）序列化为 SVG 子元素字符串
function nodeToInner(node) {
  return node
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
      return `<${tag} ${a}></${tag}>`
    })
    .join('')
}

// 包裹为完整 SVG：lucide 用描边风格，品牌图标用填充风格
function wrapSvg(inner, stroke) {
  const style = stroke
    ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    : 'fill="currentColor"'
  return (
    `<svg class="md-icon" viewBox="0 0 24 24" width="1em" height="1em" ` +
    `${style} aria-hidden="true">${inner}</svg>`
  )
}

// 把图标名渲染为内联 SVG 字符串；未知图标返回 null
function renderIcon(name) {
  const key = name.toLowerCase()

  // 1) 品牌图标（描边风格，与 lucide 统一）
  if (STROKE_BRAND[key]) return wrapSvg(STROKE_BRAND[key], true)

  // 2) 别名映射 / 直接的 lucide 名（描边风格）
  const lucideName = ALIASES[key] || toPascal(name)
  const node = lucide[lucideName]
  if (Array.isArray(node)) return wrapSvg(nodeToInner(node), true)

  return null
}

// 将一个 text 字符串按 icon:name 切分为若干 token；无任何替换时返回 null
function splitTextToken(text, Token) {
  const nodes = []
  let lastIndex = 0
  let match

  ICON_RE.lastIndex = 0
  while ((match = ICON_RE.exec(text)) !== null) {
    const svg = renderIcon(match[1])
    if (!svg) continue // 未知图标名：跳过，留待后续作为普通文本输出

    if (match.index > lastIndex) {
      const textToken = new Token('text', '', 0)
      textToken.content = text.slice(lastIndex, match.index)
      nodes.push(textToken)
    }

    const iconToken = new Token('html_inline', '', 0)
    iconToken.content = svg
    nodes.push(iconToken)

    lastIndex = match.index + match[0].length
  }

  if (nodes.length === 0) return null

  if (lastIndex < text.length) {
    const tail = new Token('text', '', 0)
    tail.content = text.slice(lastIndex)
    nodes.push(tail)
  }

  return nodes
}

export default function iconPlugin(md) {
  md.core.ruler.push('icon', (state) => {
    const Token = state.Token
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue

      const newChildren = []
      for (const child of token.children) {
        if (child.type === 'text') {
          const replaced = splitTextToken(child.content, Token)
          if (replaced) {
            newChildren.push(...replaced)
            continue
          }
        }
        newChildren.push(child)
      }
      token.children = newChildren
    }
  })
}
