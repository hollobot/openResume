/**
 * 描述文本 → 安全 HTML
 *
 * 阶段1 的轻量富文本：纯文本多行，按行解析
 *   - 「- 」开头的连续行 → <ul><li>
 *   - 其余非空行 → <p>
 * 先做 HTML 转义，避免注入。阶段2 接入 contenteditable 后此函数可保留作纯文本兜底。
 */

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function textToHtml(text) {
  if (!text) return ''
  const lines = String(text).split('\n')
  const out = []
  let listBuf = []

  const flushList = () => {
    if (listBuf.length) {
      out.push(`<ul>${listBuf.map((li) => `<li>${escapeHtml(li)}</li>`).join('')}</ul>`)
      listBuf = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }
    if (line.startsWith('- ')) {
      listBuf.push(line.slice(2))
    } else {
      flushList()
      out.push(`<p>${escapeHtml(line)}</p>`)
    }
  }
  flushList()
  return out.join('')
}
