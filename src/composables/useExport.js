/**
 * 导出功能：MD / PDF (打印) / JPG (html2canvas)
 */

import html2canvas from 'html2canvas'

/**
 * 下载纯文本文件
 */
function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 导出为 Markdown 文件
 */
export function exportMarkdown(markdownContent, filename = 'resume.md') {
  downloadText(markdownContent, filename)
}

/**
 * 导出简历数据为 JSON 文件（用于备份与迁移）
 */
export function exportJSON(jsonString, filename = 'resume.json') {
  downloadText(jsonString, filename)
}

/**
 * 导出为 PDF（调用浏览器打印，用户选"另存为 PDF"）
 * 打印前临时切换 body 为仅显示预览区域
 */
export function exportPDF() {
  window.print()
}

/**
 * 导出为 JPG 图片（html2canvas 截图）
 * @param {HTMLElement} el - 要截图的 DOM 元素
 * @param {string} filename
 */
export async function exportJPG(el, filename = 'resume.jpg') {
  const canvas = await html2canvas(el, {
    scale: 2,           // 2x 高清
    useCORS: true,      // 允许跨域图片（头像）
    backgroundColor: '#ffffff',
    logging: false,
  })

  canvas.toBlob(
    (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    'image/jpeg',
    0.95,  // 95% 质量
  )
}
