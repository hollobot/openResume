/**
 * 区块类型元定义（对齐 reactive-resume packages/schema/src/resume/data.ts）
 *
 * 每种区块类型描述：
 *   - label        中文显示名（区块默认标题，title 为空时的回退，对应 RR 的 locale 翻译标题）
 *   - defaultIcon  默认 Phosphor 图标名
 *   - fields       条目字段元定义，驱动 SectionItemDialog 表单渲染与空条目工厂
 *   - display      条目在左栏列表中的 标题/副标题 提取器
 *
 * 字段 type 一览：
 *   text     单行文本
 *   rich     tiptap 富文本（HTML 字符串）
 *   website  链接对象 { url, label, inlineLink }
 *   tags     字符串数组（关键字标签）
 *   level    0-5 等级滑块（0 = 隐藏等级显示）
 *   icon     Phosphor 图标名选择器（附带 iconColor）
 *   roles    经历子角色列表 [{ id, position, period, description }]（仅 experience）
 */

import { uid } from './uid.js'

// 12 个标准区块在 resume.sections 下的固定顺序（与 RR 一致）
export const STANDARD_SECTION_KEYS = [
  'profiles',
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'interests',
  'awards',
  'certifications',
  'publications',
  'volunteer',
  'references',
]

// 自定义区块可选的全部类型（含 summary 与 cover-letter，对齐 RR sectionTypeSchema）
export const CUSTOM_SECTION_TYPES = [
  'summary',
  'profiles',
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'interests',
  'awards',
  'certifications',
  'publications',
  'volunteer',
  'references',
  'cover-letter',
]

export const SECTION_DEFS = {
  summary: {
    label: '个人简介',
    defaultIcon: 'article',
    fields: [{ key: 'content', label: '内容', type: 'rich' }],
    display: { title: () => '简介内容', subtitle: () => '' },
  },
  profiles: {
    label: '社交主页',
    defaultIcon: 'messenger-logo',
    fields: [
      { key: 'network', label: '平台', type: 'text', required: true, placeholder: 'GitHub / LinkedIn' },
      { key: 'username', label: '用户名', type: 'text' },
      { key: 'icon', label: '图标', type: 'icon' },
      { key: 'website', label: '链接', type: 'website' },
    ],
    display: { title: (it) => it.network, subtitle: (it) => it.username },
  },
  experience: {
    label: '工作经历',
    defaultIcon: 'briefcase',
    fields: [
      { key: 'company', label: '公司', type: 'text', required: true },
      { key: 'position', label: '职位', type: 'text' },
      { key: 'location', label: '地点', type: 'text' },
      { key: 'period', label: '时间', type: 'text', placeholder: '2023-01 ~ 至今' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
      { key: 'roles', label: '细分角色', type: 'roles' },
    ],
    display: { title: (it) => it.company, subtitle: (it) => it.position },
  },
  education: {
    label: '教育经历',
    defaultIcon: 'graduation-cap',
    fields: [
      { key: 'school', label: '学校', type: 'text', required: true },
      { key: 'degree', label: '学历', type: 'text', placeholder: '本科 / 硕士' },
      { key: 'area', label: '专业', type: 'text' },
      { key: 'grade', label: '成绩', type: 'text', placeholder: 'GPA 3.8' },
      { key: 'location', label: '地点', type: 'text' },
      { key: 'period', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.school, subtitle: (it) => [it.degree, it.area].filter(Boolean).join(' · ') },
  },
  projects: {
    label: '项目经历',
    defaultIcon: 'code-simple',
    fields: [
      { key: 'name', label: '项目名', type: 'text', required: true },
      { key: 'period', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.name, subtitle: (it) => it.period },
  },
  skills: {
    label: '专业技能',
    defaultIcon: 'compass-tool',
    fields: [
      { key: 'name', label: '技能', type: 'text', required: true },
      { key: 'proficiency', label: '熟练度', type: 'text', placeholder: '精通 / 熟练 / 了解' },
      { key: 'level', label: '等级', type: 'level' },
      { key: 'icon', label: '图标', type: 'icon' },
      { key: 'keywords', label: '关键字', type: 'tags' },
    ],
    display: { title: (it) => it.name, subtitle: (it) => it.proficiency },
  },
  languages: {
    label: '语言',
    defaultIcon: 'translate',
    fields: [
      { key: 'language', label: '语言', type: 'text', required: true },
      { key: 'fluency', label: '流利度', type: 'text', placeholder: '母语 / 流利 / CET-6' },
      { key: 'level', label: '等级', type: 'level' },
    ],
    display: { title: (it) => it.language, subtitle: (it) => it.fluency },
  },
  interests: {
    label: '兴趣爱好',
    defaultIcon: 'football',
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true },
      { key: 'icon', label: '图标', type: 'icon' },
      { key: 'keywords', label: '关键字', type: 'tags' },
    ],
    display: { title: (it) => it.name, subtitle: (it) => (it.keywords || []).join('、') },
  },
  awards: {
    label: '荣誉奖项',
    defaultIcon: 'trophy',
    fields: [
      { key: 'title', label: '奖项', type: 'text', required: true },
      { key: 'awarder', label: '颁发方', type: 'text' },
      { key: 'date', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.title, subtitle: (it) => it.awarder },
  },
  certifications: {
    label: '证书',
    defaultIcon: 'certificate',
    fields: [
      { key: 'title', label: '证书', type: 'text', required: true },
      { key: 'issuer', label: '颁发机构', type: 'text' },
      { key: 'date', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.title, subtitle: (it) => it.issuer },
  },
  publications: {
    label: '出版物',
    defaultIcon: 'books',
    fields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'publisher', label: '出版方', type: 'text' },
      { key: 'date', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.title, subtitle: (it) => it.publisher },
  },
  volunteer: {
    label: '志愿服务',
    defaultIcon: 'hand-heart',
    fields: [
      { key: 'organization', label: '组织', type: 'text', required: true },
      { key: 'location', label: '地点', type: 'text' },
      { key: 'period', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.organization, subtitle: (it) => it.period },
  },
  references: {
    label: '推荐人',
    defaultIcon: 'phone',
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true },
      { key: 'position', label: '职位', type: 'text' },
      { key: 'phone', label: '电话', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'rich' },
    ],
    display: { title: (it) => it.name, subtitle: (it) => it.position },
  },
  'cover-letter': {
    label: '求职信',
    defaultIcon: 'envelope-simple',
    fields: [
      { key: 'recipient', label: '收件人', type: 'rich' },
      { key: 'content', label: '正文', type: 'rich' },
    ],
    display: { title: () => '求职信', subtitle: () => '' },
  },
}

/**
 * 按字段类型生成默认空值
 */
function blankFieldValue(type) {
  switch (type) {
    case 'website':
      return { url: '', label: '', inlineLink: false }
    case 'tags':
      return []
    case 'level':
      return 0
    case 'roles':
      return []
    case 'icon':
      return ''
    default:
      return ''
  }
}

/**
 * 创建指定类型的空白条目（含 id/hidden 与 icon 类型附带的 iconColor）
 * @param {string} type - 区块类型（SECTION_DEFS 的 key）
 */
export function blankItem(type) {
  const def = SECTION_DEFS[type]
  const item = { id: uid(), hidden: false }
  for (const f of def.fields) {
    item[f.key] = blankFieldValue(f.type)
    if (f.type === 'icon') item.iconColor = ''
  }
  return item
}

/**
 * 创建 experience 的空白子角色
 */
export function blankRole() {
  return { id: uid(), position: '', period: '', description: '' }
}
