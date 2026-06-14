/**
 * markdown-it 行内图标插件（基于 Tabler Icons 图标库）
 *
 * 语法：icon:phone / icon:map-pin / icon:brand-github …
 *   - 常用简历名（phone/email/github/location…）通过别名表映射到 Tabler 图标。
 *   - 也支持直接写任意 Tabler 图标名（kebab 形式，如 icon:briefcase、icon:brand-wechat）。
 *   - 未匹配到的名称原样保留为文本。
 *
 * 实现为 core 规则：在 inline 解析后遍历 text 子 token，用正则切分替换，
 * 以正确处理「一行内多个 icon:」的情况（inline ruler 会被贪婪 text 规则吞字）。
 * 图标统一输出为内联 SVG，导出 PDF / PNG（html2canvas 截图）时也能正常呈现。
 *
 * Tabler 节点数据格式与 lucide 一致：name -> [[tag, attrs], ...]，
 * 因此可直接复用同一套 SVG 拼装逻辑。图标选择器（IconPicker）也复用此处导出的
 * ICON_NAMES（全部图标名）与 iconToSvg（按名渲染 SVG）。
 */
// 路径经 vite.config.js 的别名指向 @tabler/icons 根目录的 nodes JSON
import TABLER_NODES from 'tabler-nodes-outline'

// 全部可用图标名（kebab），供图标选择器搜索 / 展示
export const ICON_NAMES = Object.keys(TABLER_NODES)

// 常用简历图标名 / lucide 旧名 -> Tabler 图标名（kebab-case）
// 保留此别名层，保证历史简历里的 icon:github、icon:email、icon:graduation-cap 等仍可用
const ALIASES = {
  phone: 'phone',
  tel: 'phone',
  mobile: 'device-mobile',
  email: 'mail',
  mail: 'mail',
  at: 'at',
  blog: 'rss',
  rss: 'rss',
  info: 'info-circle',
  link: 'link',
  url: 'link',
  location: 'map-pin',
  address: 'map-pin',
  map: 'map-pin',
  github: 'brand-github',
  gitlab: 'brand-gitlab',
  wechat: 'brand-wechat',
  weixin: 'brand-wechat',
  qq: 'brand-qq',
  calendar: 'calendar',
  date: 'calendar',
  time: 'clock',
  home: 'home',
  web: 'world',
  website: 'world',
  globe: 'world',
  user: 'user',
  age: 'user',
  gender: 'user',
  edu: 'school',
  education: 'school',
  'graduation-cap': 'school',
  work: 'briefcase',
  job: 'briefcase'
}

// 匹配 icon:name（name 由字母/数字/下划线/连字符组成）
const ICON_RE = /icon:([a-zA-Z0-9_-]+)/g

// 把节点（[ [tag, attrs], ... ]）序列化为 SVG 子元素字符串
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

// 包裹为完整 SVG：Tabler 为描边风格，与原样式保持一致
function wrapSvg(inner) {
  return (
    `<svg class="md-icon" viewBox="0 0 24 24" width="1em" height="1em" ` +
    `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
  )
}

/**
 * 把图标名渲染为内联 SVG 字符串；未知图标返回 null。
 * 既用于 markdown 渲染，也导出给图标选择器做预览。
 */
export function iconToSvg(name) {
  const key = String(name).toLowerCase()
  const tablerName = ALIASES[key] || key
  const node = TABLER_NODES[tablerName]
  if (Array.isArray(node)) return wrapSvg(nodeToInner(node))
  return null
}

// 将一个 text 字符串按 icon:name 切分为若干 token；无任何替换时返回 null
function splitTextToken(text, Token) {
  const nodes = []
  let lastIndex = 0
  let match

  ICON_RE.lastIndex = 0
  while ((match = ICON_RE.exec(text)) !== null) {
    const svg = iconToSvg(match[1])
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
