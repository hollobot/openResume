// 临时调试脚本：测试真实解析器输出
import fs from 'fs'
import { parseResume } from './src/composables/useResumeParser.js'

const md = fs.readFileSync('./src/templates/default.md', 'utf-8')
const { html } = parseResume(md)
console.log('resume-row count:', (html.match(/resume-row/g) || []).length)
console.log('block-default count:', (html.match(/resume-block-default/g) || []).length)
console.log(html.slice(0, 500))
