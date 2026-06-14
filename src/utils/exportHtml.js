/**
 * 导出自包含 HTML：把简历渲染为一个独立 .html 文件，
 * 可直接用浏览器打开 / 发邮件；文字是真实 HTML（清晰、可选中、链接可点、体积小）。
 *
 * 复用 Markdown 渲染与主题样式（通过 ?raw 内联 theme-default.css），
 * 并按当前设置应用模板、主题色、字体、行距、页边距、证件照。
 * 说明：内嵌中文字体过大，故沿用系统字体（与预览的字体回退一致）。
 */
import { renderMarkdown } from '../markdown/index.js'
import themeCss from '../styles/theme-default.css?raw'
import { avatarGeom, AVATAR_BASE_W } from './avatar.js'

// 触发浏览器下载一个 Blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 转义标题里的 HTML 特殊字符
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

/**
 * @param {string} markdownText 简历 Markdown
 * @param {object} settings 预览设置
 * @param {string} filename
 */
export function exportHtml(markdownText, settings, filename = 'resume.html') {
  const body = renderMarkdown(markdownText)

  // 主题/模板/开关类名（与预览一致）
  const tpl = settings.template && settings.template !== 'default' ? `tpl-${settings.template}` : ''
  const classes = ['resume-theme-default', tpl,
    settings.themeColorExtended ? 'accent-extended' : '',
    settings.linkUnderline ? 'link-underline' : ''
  ].filter(Boolean).join(' ')

  // 内容内联样式（主题色变量 / 字体 / 行距）
  const styleVars = [
    settings.themeColor ? `--rt-accent:${settings.themeColor}` : '',
    settings.fontFamily ? `font-family:${settings.fontFamily}` : '',
    settings.lineHeight ? `line-height:${settings.lineHeight}` : ''
  ].filter(Boolean).join(';')

  const padV = settings.pagePadV ?? 48
  const padH = settings.pagePadH ?? 56

  // 证件照（绝对定位，与预览坐标一致）
  let avatarHtml = ''
  if (settings.avatar) {
    const g = avatarGeom(settings.avatarShape)
    const scale = settings.avatarScale || 1
    const w = Math.round(AVATAR_BASE_W * scale)
    const h = Math.round((AVATAR_BASE_W * scale * g.h) / g.w)
    const radius = g.round ? '50%' : '4px'
    const border = settings.avatarBorderWidth
      ? `border:${settings.avatarBorderWidth}px solid ${settings.avatarBorderColor};`
      : ''
    const x = (settings.avatarPos && settings.avatarPos.x) || 0
    const y = (settings.avatarPos && settings.avatarPos.y) || 0
    avatarHtml =
      `<img src="${settings.avatar}" alt="证件照" style="position:absolute;left:${x}px;top:${y}px;` +
      `width:${w}px;height:${h}px;object-fit:cover;box-sizing:border-box;border-radius:${radius};${border}">`
  }

  const customCss = settings.customCss ? `.resume-theme-default{${settings.customCss}}` : ''
  const title = filename.replace(/\.html$/i, '')

  const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
* { margin: 0; padding: 0; }
body {
  background: #e9ebee;
  padding: 24px;
  display: flex;
  justify-content: center;
  font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.sheet {
  position: relative;
  width: 794px;
  box-sizing: border-box;
  padding: ${padV}px ${padH}px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
${themeCss}
${customCss}
@media print {
  @page { size: A4; margin: 0; }
  body { background: #fff; padding: 0; }
  .sheet { box-shadow: none; }
}
</style>
</head>
<body>
  <div class="sheet">
    <div class="${classes}" style="${styleVars}">${body}</div>
    ${avatarHtml}
  </div>
</body>
</html>`

  downloadBlob(new Blob([doc], { type: 'text/html;charset=utf-8' }), filename)
}
