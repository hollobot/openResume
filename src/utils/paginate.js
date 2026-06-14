/**
 * 分页计算：把一段渲染后的 HTML 按 A4 页面内容高度切分成多页。
 *
 * 思路：把完整 HTML 放进一个离屏容器（宽度 = 页面内容宽、套用相同主题/字体），
 * 读取每个顶层区块的实际排版位置，按内容高度贪心打包；**只在区块之间断页**，
 * 不会把一段文字从中间切开。单个区块超过一页时，独立成页（允许其溢出）。
 *
 * @param {string} html 渲染后的简历 HTML
 * @param {object} opts
 * @param {number} opts.contentWidth 页面内容区宽度（页宽 - 左右页边距）
 * @param {number} opts.contentHeight 页面内容区高度（页高 - 上下页边距）
 * @param {string} opts.themeClass 主题类名（保证测量时样式一致）
 * @param {string} [opts.fontFamily] 字体（与预览一致）
 * @param {number} [opts.lineHeight] 行距（与预览一致）
 * @returns {string[]} 每页的 HTML 字符串数组（至少一页）
 */
export function paginate(html, opts) {
  const { contentWidth, contentHeight, themeClass, fontFamily, lineHeight } = opts

  // 离屏测量容器：与真实页面内容区同宽、同主题/字体
  const measure = document.createElement('div')
  measure.className = themeClass
  measure.style.position = 'absolute'
  measure.style.left = '-99999px'
  measure.style.top = '0'
  measure.style.width = contentWidth + 'px'
  if (fontFamily) measure.style.fontFamily = fontFamily
  if (lineHeight) measure.style.lineHeight = String(lineHeight)
  measure.innerHTML = html
  document.body.appendChild(measure)

  const blocks = Array.from(measure.children)

  // 空内容时也返回一页（空白页），保证预览始终有页面
  if (blocks.length === 0) {
    document.body.removeChild(measure)
    return ['']
  }

  const pages = []
  let current = []
  let pageTop = blocks[0].offsetTop // 当前页起始基线

  for (const block of blocks) {
    // 手动分页标记（<div class="page-break">）：强制另起一页，标记本身不输出
    if (block.classList && block.classList.contains('page-break')) {
      if (current.length) {
        pages.push(current.join('\n'))
        current = []
      }
      pageTop = block.offsetTop // 后续内容从此基线起算
      continue
    }
    const blockBottom = block.offsetTop + block.offsetHeight
    // 当前页已有内容、且加入该块会超出页高 -> 从该块起新开一页
    if (current.length && blockBottom - pageTop > contentHeight) {
      pages.push(current.join('\n'))
      current = []
      pageTop = block.offsetTop
    }
    current.push(block.outerHTML)
  }
  if (current.length) pages.push(current.join('\n'))

  document.body.removeChild(measure)
  return pages
}
