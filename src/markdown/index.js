/**
 * Markdown 引擎装配
 *
 * 在 markdown-it 基础上扩展简历专用语法：
 *  - 行内图标：icon:phone   （见 plugins/icon.js）
 *  - 左右分栏：:::left ... :::   /   :::right ... :::   （基于 markdown-it-container）
 *
 * 分栏实现说明：left 用浮动靠左、right 浮动靠右，配合区块后的 clearfix，
 * 即可在不引入额外包裹层的情况下实现「左联系方式 / 右照片」的顶部布局。
 */
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import attrs from 'markdown-it-attrs'
import iconPlugin from './plugins/icon.js'
import rightPlugin from './plugins/right.js'

const md = new MarkdownIt({
  html: true, // 允许内联 HTML（图标 SVG、少量自定义标签）
  linkify: true, // 自动把 URL 转为链接
  breaks: true // 单换行也渲染为 <br>，更贴近简历的逐行书写习惯
})

// 注册自定义图标语法
md.use(iconPlugin)

// 注册右对齐语法 @r{...}
md.use(rightPlugin)

// 注册属性语法：可给元素加 class / style / id，如 `## 标题 {.center}`、`文字{style="color:red"}`
md.use(attrs, {
  // 允许的属性：class / id / style，满足简历自定义样式即可
  allowedAttributes: ['id', 'class', 'style']
})

// 注册左右分栏容器：:::left / :::right
md.use(container, 'left', {
  render(tokens, idx) {
    return tokens[idx].nesting === 1
      ? '<div class="md-col md-col--left">\n'
      : '</div>\n'
  }
})
md.use(container, 'right', {
  render(tokens, idx) {
    return tokens[idx].nesting === 1
      ? '<div class="md-col md-col--right">\n'
      : '</div>\n<div class="md-col-clear"></div>\n'
  }
})

/**
 * 把 Markdown 文本渲染为 HTML 字符串
 * @param {string} source Markdown 源文本
 * @returns {string} 渲染后的 HTML
 */
export function renderMarkdown(source) {
  return md.render(source || '')
}

export default md
