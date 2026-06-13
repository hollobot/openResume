/**
 * 导出工具：Markdown / JSON / PNG / PDF
 *
 * PNG、PDF 均基于 html2canvas 对预览区截图：
 *  - PNG：直接保存截图。
 *  - PDF：把截图按 A4 宽度等比缩放，超长时分页贴图。
 * 取舍：纯前端截图方案所见即所得、无需服务端，但 PDF 文字为位图（不可选中）。
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// 通用：触发浏览器下载一个 Blob
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

// 导出 Markdown 源文件
export function exportMarkdown(text, filename = 'resume.md') {
  downloadBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), filename)
}

// 导出 JSON（带元信息，便于后续兼容性校验）
export function exportJSON(text, filename = 'resume.json') {
  const data = {
    type: 'open-resume',
    version: 1,
    exportedAt: new Date().toISOString(),
    markdown: text
  }
  const json = JSON.stringify(data, null, 2)
  downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8' }), filename)
}

// 把 DOM 元素渲染为 canvas（统一截图参数）
async function elementToCanvas(element) {
  return html2canvas(element, {
    scale: 2, // 2 倍分辨率，保证导出清晰度
    useCORS: true, // 允许加载跨域图片（照片等）
    backgroundColor: '#ffffff'
  })
}

// 导出 PNG：把所有页面纵向拼接成一张图片
export async function exportPNG(pages, filename = 'resume.png') {
  const list = Array.isArray(pages) ? pages : [pages]
  const canvases = []
  for (const el of list) canvases.push(await elementToCanvas(el))

  const width = Math.max(...canvases.map((c) => c.width))
  const totalH = canvases.reduce((sum, c) => sum + c.height, 0)

  const out = document.createElement('canvas')
  out.width = width
  out.height = totalH
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, totalH)

  let y = 0
  for (const c of canvases) {
    ctx.drawImage(c, 0, y)
    y += c.height
  }

  out.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename)
  }, 'image/png')
}

// 导出 PDF：每一页（A4 纸）对应 PDF 的一页，与预览逐页一致
export async function exportPDF(pages, filename = 'resume.pdf') {
  const list = Array.isArray(pages) ? pages : [pages]
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < list.length; i++) {
    const canvas = await elementToCanvas(list[i])
    const imgData = canvas.toDataURL('image/png')
    if (i > 0) pdf.addPage()
    // 每页元素本身即 A4 比例，铺满整张 A4
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)
  }

  pdf.save(filename)
}
