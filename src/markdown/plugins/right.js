/**
 * markdown-it 行内右对齐插件
 *
 * 语法：@r{2022.09 - 2026.06}  ->  <span class="md-right">…</span>
 * 配合 CSS 的 float:right，使括号内内容右对齐到当前行末，
 * 常用于条目（学校 / 公司）行右侧的日期、地点等。
 *
 * 实现为 inline ruler：括号内内容作为 text token 入栈，
 * 因此其中的 icon: 等仍会被后续 core 规则正常处理（如 @r{icon:calendar 2025}）。
 * 注意：括号内按纯文本处理，不解析加粗 / 链接等行内语法。
 */
export default function rightPlugin(md) {
  md.inline.ruler.before('text', 'right_align', (state, silent) => {
    const start = state.pos
    const src = state.src

    // 必须以 "@r{" 开头
    if (src.slice(start, start + 3) !== '@r{') return false

    // 找到配对的 "}"
    const end = src.indexOf('}', start + 3)
    if (end < 0) return false

    const inner = src.slice(start + 3, end)

    if (!silent) {
      let token = state.push('html_inline', '', 0)
      token.content = '<span class="md-right">'

      token = state.push('text', '', 0)
      token.content = inner

      token = state.push('html_inline', '', 0)
      token.content = '</span>'
    }

    state.pos = end + 1
    return true
  })
}
