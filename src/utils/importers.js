/**
 * 导入工具：从用户选择的文件中读出 Markdown 文本
 *  - .md  ：内容即 Markdown，直接返回。
 *  - .json：解析后取出 markdown 字段（兼容导出的结构）。
 */

// 读取文件为纯文本
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * 导入 Markdown 文件
 * @returns {Promise<string>} Markdown 文本
 */
export async function importMarkdownFile(file) {
  return readFileAsText(file)
}

/**
 * 导入 JSON 文件（取 markdown 字段）
 * @returns {Promise<string>} Markdown 文本
 * @throws 当 JSON 解析失败或结构不含 markdown 字段时
 */
export async function importJSONFile(file) {
  const text = await readFileAsText(file)
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error('JSON 文件解析失败，请确认文件格式正确。')
  }
  if (typeof data.markdown !== 'string') {
    throw new Error('JSON 文件缺少 markdown 字段，无法导入。')
  }
  return data.markdown
}

/**
 * 按文件扩展名自动选择导入方式
 * @returns {Promise<string>} Markdown 文本
 */
export async function importFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.json')) return importJSONFile(file)
  // 其余一律按文本/Markdown 处理（.md / .markdown / .txt）
  return importMarkdownFile(file)
}
