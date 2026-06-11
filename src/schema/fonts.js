/**
 * 字体清单（本地方案，不依赖 Google Fonts CDN）
 *
 * value 为空字符串 = 跟随页面默认中文字体栈（artboard.css 定义）。
 * 系统字体零网络加载；后续如需自托管 woff2，在 files 中登记并由
 * typography 面板按需注入 @font-face。
 */

export const FONT_LIST = [
  { family: '', label: '默认（系统中文）', category: 'system' },
  { family: 'Microsoft YaHei', label: '微软雅黑', category: 'system' },
  { family: 'SimSun', label: '宋体', category: 'system' },
  { family: 'SimHei', label: '黑体', category: 'system' },
  { family: 'KaiTi', label: '楷体', category: 'system' },
  { family: 'Arial', label: 'Arial', category: 'system' },
  { family: 'Georgia', label: 'Georgia', category: 'system' },
  { family: 'Times New Roman', label: 'Times New Roman', category: 'system' },
  { family: 'Courier New', label: 'Courier New', category: 'system' },
  { family: 'Verdana', label: 'Verdana', category: 'system' },
  { family: 'Tahoma', label: 'Tahoma', category: 'system' },
]

// 可选字重（与 RR fontWeightSchema 一致）
export const FONT_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
