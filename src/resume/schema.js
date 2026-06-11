/**
 * 简历数据模型（借鉴 Reactive Resume，精简适配 Vue）
 *
 * 核心思想：用一份「区块字段元定义」(SECTION_DEFS) 同时驱动
 *   1. 左栏表单的字段渲染
 *   2. 新建条目时的默认值生成
 *   3. 右栏模板的取值
 * 新增 / 调整区块字段时只需改这一处，避免表单与模板两边不同步。
 */

// ── 工具：生成唯一 id ────────────────────────────────────────
let _seq = 0
export function uid() {
  // 时间戳 + 自增序列，足够前端单机场景去重
  return `${Date.now().toString(36)}-${(_seq++).toString(36)}`
}

/**
 * 字段类型说明（type）：
 *   text     单行文本
 *   textarea 多行文本（描述，支持「- 」开头的列表行，渲染时转 <li>）
 *   tags     标签数组（如技能关键字）
 *   website  链接对象 { url, label }
 */

// ── 区块字段元定义 ───────────────────────────────────────────
// key 与 resume.sections 下的键一一对应；顺序即默认展示顺序。
export const SECTION_DEFS = [
  {
    key: 'profiles',
    title: '社交主页',
    // 单条社交账号
    itemFields: [
      { key: 'network', label: '平台', type: 'text', placeholder: 'GitHub / 博客' },
      { key: 'username', label: '用户名', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
    ],
  },
  {
    key: 'education',
    title: '教育经历',
    itemFields: [
      { key: 'school', label: '学校', type: 'text' },
      { key: 'degree', label: '学历', type: 'text', placeholder: '本科 / 硕士' },
      { key: 'area', label: '专业', type: 'text' },
      { key: 'location', label: '地点', type: 'text' },
      { key: 'period', label: '时间', type: 'text', placeholder: '2022-09 ~ 2026-06' },
      { key: 'description', label: '描述', type: 'textarea' },
    ],
  },
  {
    key: 'skills',
    title: '专业技能',
    itemFields: [
      { key: 'name', label: '技能', type: 'text', placeholder: 'Java 编程' },
      { key: 'description', label: '说明', type: 'textarea' },
    ],
  },
  {
    key: 'experience',
    title: '工作经历',
    itemFields: [
      { key: 'company', label: '公司', type: 'text' },
      { key: 'position', label: '职位', type: 'text' },
      { key: 'location', label: '地点', type: 'text' },
      { key: 'period', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'description', label: '描述', type: 'textarea' },
    ],
  },
  {
    key: 'projects',
    title: '项目经历',
    itemFields: [
      { key: 'name', label: '项目', type: 'text' },
      { key: 'role', label: '角色', type: 'text', placeholder: '独立开发' },
      { key: 'period', label: '时间', type: 'text' },
      { key: 'website', label: '链接', type: 'website' },
      { key: 'keywords', label: '技术栈', type: 'tags' },
      { key: 'description', label: '描述', type: 'textarea' },
    ],
  },
  {
    key: 'awards',
    title: '荣誉奖项',
    itemFields: [
      { key: 'title', label: '奖项', type: 'text' },
      { key: 'awarder', label: '颁发方', type: 'text' },
      { key: 'date', label: '时间', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' },
    ],
  },
]

// key → def 的快速查表
export const SECTION_DEF_MAP = Object.fromEntries(SECTION_DEFS.map((d) => [d.key, d]))

/**
 * 按字段类型生成默认空值
 */
function blankValue(type) {
  switch (type) {
    case 'tags':
      return []
    case 'website':
      return { url: '', label: '' }
    default:
      return ''
  }
}

/**
 * 依据区块定义创建一条空白条目（含 id + hidden）
 * @param {string} sectionKey
 */
export function blankItem(sectionKey) {
  const def = SECTION_DEF_MAP[sectionKey]
  const item = { id: uid(), hidden: false }
  for (const f of def.itemFields) {
    item[f.key] = blankValue(f.type)
  }
  return item
}

// ── 默认简历数据（真实示例，迁移自 docs/语法.md）────────────
export function createDefaultResume() {
  return {
    basics: {
      name: '陶 潇',
      headline: 'Java 开发工程师',
      email: '2380983020@qq.com',
      phone: '13203071697',
      location: '长沙',
      website: { url: 'https://hollobot.github.io/blog', label: '个人博客' },
    },
    summary: {
      title: '个人简介',
      hidden: false,
      content:
        '在校期间多次参与算法竞赛并取得优异成绩，具备扎实的算法设计与优化能力；独立开发多个实战项目，熟悉全栈开发流程，具备全栈开发经验。',
    },
    sections: {
      profiles: {
        title: '社交主页',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            network: 'GitHub',
            username: 'hollobot',
            website: { url: 'https://github.com/hollobot', label: 'github.com/hollobot' },
          },
        ],
      },
      education: {
        title: '教育经历',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            school: '中南林业科技大学涉外学院',
            degree: '全日制本科',
            area: '计算机科学与技术',
            location: '',
            period: '2022-09 ~ 2026-06',
            description: '',
          },
        ],
      },
      skills: {
        title: '专业技能',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            name: 'Java 编程',
            description:
              '熟悉 Java 语言，具备较强的编码能力和良好的代码风格，深入理解集合框架、多线程并发机制。',
          },
          {
            id: uid(),
            hidden: false,
            name: '开发框架',
            description: '熟练使用 Spring、Spring Boot、MyBatis 等开源框架。',
          },
          {
            id: uid(),
            hidden: false,
            name: '数据库',
            description:
              '熟悉 MySQL，掌握索引、事务隔离级别及锁机制，具备慢 SQL 分析与优化能力。',
          },
        ],
      },
      experience: {
        title: '工作经历',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            company: '北京智乐活科技有限公司',
            position: 'Java 实习生',
            location: '长沙',
            period: '2025-07 ~ 至今',
            website: { url: '', label: '' },
            description:
              '参与适趣 AI 中文（儿童阅读 APP）后端核心功能开发与后台运营系统迭代。\n- 基于 Spring Event 实现事件驱动架构，将喂食、签到等行为动作与金币/经验副作用解耦。\n- 使用 Redisson 分布式锁保护金币变更、签到、虚拟商品购买等并发写入。',
          },
        ],
      },
      projects: {
        title: '项目经历',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            name: 'SwiftChat',
            role: '独立开发',
            period: '2025-02 ~ 2025-05',
            website: { url: 'https://github.com/hollobot/chat-server', label: 'github.com/hollobot/chat-server' },
            keywords: ['Spring Boot', 'Netty', 'Redis', 'Electron', 'Vue3'],
            description:
              '基于 Spring Boot + Electron-Vite 的跨平台 IM 系统，支持单聊/群聊、好友管理、媒体文件发送、点对点视频通话。\n- 基于 Netty 构建 WebSocket 长连接管理，实现心跳检测与消息实时推送。\n- 集成 WebRTC 实现点对点视频通话，降低音视频流延迟。',
          },
        ],
      },
      awards: {
        title: '荣誉奖项',
        hidden: false,
        items: [
          {
            id: uid(),
            hidden: false,
            title: '传智杯程序设计挑战赛校赛一等奖',
            awarder: '',
            date: '2024-12',
            description: '',
          },
          {
            id: uid(),
            hidden: false,
            title: '全国程序设计天梯赛三等奖',
            awarder: '',
            date: '2025-04',
            description: '',
          },
        ],
      },
    },
    metadata: {
      template: 'classic',
      page: {
        format: 'a4',
        marginX: 48, // 页面左右内边距（px）
        marginY: 44, // 页面上下内边距（px）
        gapY: 20, // 区块之间纵向间距（px）
      },
      typography: {
        body: { fontFamily: '', fontSize: 14, lineHeight: 1.6 },
        heading: { fontFamily: '', fontSize: 16 },
      },
      design: {
        colors: { primary: '#2563eb', text: '#1f2933', background: '#ffffff' },
      },
    },
  }
}
