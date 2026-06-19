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

/**
 * html2canvas 1.x 不支持 CSS object-fit，会把图片直接拉伸填满方框，
 * 导致证件照等设了 object-fit:cover 的图片在导出时比例失真。
 * 这里在克隆的 DOM 上把这类 <img> 替换为等尺寸的背景图 <div>，
 * 用 background-size 还原 cover/contain 效果，使导出与预览一致。
 */
function fixObjectFitImages(clonedDoc) {
  // 预览里 .page 用了 content-visibility:auto（屏幕外跳过渲染以保证滚动流畅），
  // 截图时强制还原为 visible，否则屏幕外的页会被跳过、导出成空白。
  clonedDoc.querySelectorAll('.page').forEach((el) => {
    el.style.contentVisibility = 'visible'
  })

  const view = clonedDoc.defaultView || window
  clonedDoc.querySelectorAll('img').forEach((img) => {
    const cs = view.getComputedStyle(img)
    const fit = cs.objectFit
    if (!fit || fit === 'fill' || fit === 'none') return

    // 若图片自身宽高比已与显示框一致，object-fit 不会裁剪/变形，
    // 无需转换为背景图——直接让 html2canvas 绘制 <img> 更清晰
    // （背景图渲染比直接画 <img> 更糊，证件照本就是 3:4，命中此分支）。
    const boxW = parseFloat(cs.width)
    const boxH = parseFloat(cs.height)
    if (boxW && boxH && img.naturalWidth && img.naturalHeight) {
      const boxRatio = boxW / boxH
      const natRatio = img.naturalWidth / img.naturalHeight
      if (Math.abs(boxRatio - natRatio) < 0.01) return
    }

    const div = clonedDoc.createElement('div')
    // 逐属性复制计算样式，保持位置 / 尺寸 / 圆角 / 浮动等一致
    // （注意：Chrome 下 getComputedStyle().cssText 为空，必须逐项拷贝）
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i]
      div.style.setProperty(prop, cs.getPropertyValue(prop))
    }
    // 行内图片需改为 inline-block，否则宽高不生效
    if (cs.display === 'inline') div.style.display = 'inline-block'
    // 用背景图模拟 object-fit
    div.style.backgroundImage = `url("${img.currentSrc || img.src}")`
    div.style.backgroundSize = fit // cover / contain
    div.style.backgroundPosition = cs.objectPosition || 'center'
    div.style.backgroundRepeat = 'no-repeat'
    img.replaceWith(div)
  })
}

// 截图分辨率倍数：4 倍 ≈ 384DPI，远高于印刷标准，文字/照片尽量清晰。
// （矢量级清晰需走浏览器打印，但那会弹打印对话框；此处用纯下载的截图方案，
//   分辨率是唯一可调的清晰度杠杆，4 倍为兼顾内存/体积的实用上限。）
const EXPORT_SCALE = 4

// 把 DOM 元素渲染为 canvas（统一截图参数）
async function elementToCanvas(element) {
  return html2canvas(element, {
    scale: EXPORT_SCALE,
    useCORS: true, // 允许加载跨域图片（照片等）
    backgroundColor: '#ffffff',
    onclone: fixObjectFitImages // 修正 object-fit 图片比例
  })
}

// 导出 PNG：把所有页面纵向拼接成一张图片
export async function exportPNG(pages, filename = 'resume.png') {
  await document.fonts.ready // 等字体加载完成，保证导出字体与预览一致
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

/**
 * 在 PDF 当前页叠加可点击的链接热区。
 * PDF 内容是截图（位图），文字不可点；这里读取页面里每个 <a href> 的位置，
 * 按「A4 毫米 / 页面像素」比例换算后用 jsPDF.link 铺一层透明可点链接。
 */
function addPageLinks(pdf, pageEl, pageW, pageH) {
  const pageRect = pageEl.getBoundingClientRect()
  const mmPerPxX = pageW / pageRect.width
  const mmPerPxY = pageH / pageRect.height
  pageEl.querySelectorAll('a[href]').forEach((a) => {
    const url = a.href
    if (!url) return
    // 链接可能换行成多段，逐段（getClientRects）铺设热区，避免跨行误覆盖
    Array.from(a.getClientRects()).forEach((r) => {
      const x = (r.left - pageRect.left) * mmPerPxX
      const y = (r.top - pageRect.top) * mmPerPxY
      const w = r.width * mmPerPxX
      const h = r.height * mmPerPxY
      if (w <= 0 || h <= 0) return
      pdf.link(x, y, w, h, { url })
    })
  })
}

// 导出 PDF：每一页（A4 纸）对应 PDF 的一页，与预览逐页一致
export async function exportPDF(pages, filename = 'resume.pdf') {
  await document.fonts.ready // 等字体加载完成，保证导出字体与预览一致
  const list = Array.isArray(pages) ? pages : [pages]
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < list.length; i++) {
    const canvas = await elementToCanvas(list[i])
    // 用 JPEG 而非 PNG：背景为纯白无需透明通道，体积远小于无损 PNG；
    // 质量 0.95 进一步减少黑色文字边缘的压缩噪点，更清晰。
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    if (i > 0) pdf.addPage()
    // 每页元素本身即 A4 比例，铺满整张 A4
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST')
    // 叠加可点击链接热区（让 PDF 里的链接仍可点击）
    addPageLinks(pdf, list[i], pageW, pageH)
  }

  pdf.save(filename)
}
