/**
 * 简历状态管理（轻量 composable，替代 Pinia）
 *
 * 支持「多份简历」：每份简历有独立的内容（markdown）与设置（settings）。
 * 持久化到 localStorage：
 *  - 简历列表元数据：RESUMES_KEY = [{ id, name }]
 *  - 每份简历内容：CONTENT_PREFIX + id = { markdown, settings }
 *  - 当前简历 id：CURRENT_KEY
 * 兼容旧版「单份草稿」：首次加载时自动迁移为一份简历。
 *
 * markdown / settings 始终指向「当前简历」的内容，切换简历即换入对应内容。
 */
import { ref, reactive, computed, watch } from 'vue'
import { SAMPLE_MARKDOWN } from './sample.js'

const RESUMES_KEY = 'open-resume:resumes'
const CURRENT_KEY = 'open-resume:current'
const CONTENT_PREFIX = 'open-resume:resume:'
// 旧版单份草稿键（仅用于迁移）
const DRAFT_KEY = 'open-resume:draft'
const SETTINGS_KEY = 'open-resume:settings'

// 证件照默认位置（相对简历纸张左上角，px）：放在右上角
const DEFAULT_AVATAR_POS = { x: 650, y: 44 }

// 预览样式默认值
const DEFAULT_SETTINGS = {
  template: 'default', // 简历模板：default 经典 / blue 蓝色商务 / compact 紧凑
  fontFamily: '', // 空串表示使用模板默认字体
  lineHeight: 1.65, // 行距
  themeColor: '', // 主题色（仅作用于区块标题）；空串表示用模板默认黑色
  themeColorExtended: false, // 主题色是否扩展到圆点/图标/链接/姓名
  linkUnderline: false, // 链接是否显示下划线
  pagePadV: 48, // 页边距·上下（px）
  pagePadH: 56, // 页边距·左右（px）
  customCss: '', // 自定义 CSS（作用于简历预览）
  avatar: '', // 证件照（base64 dataURL，空则不显示）
  avatarPos: { ...DEFAULT_AVATAR_POS }, // 证件照在简历上的固定位置（可自由拖动）
  avatarScale: 1, // 证件照缩放系数（相对基准宽度 90，可在预览中等比缩放）
  avatarShape: '3:4', // 证件照形状/比例：3:4 / 2:3 / 1:1 / circle
  avatarBorderWidth: 0, // 证件照描边宽度（px，0 为无描边）
  avatarBorderColor: '#ffffff' // 证件照描边颜色
}

// 安全读写：localStorage 不可用 / 容量满时静默失败，不影响编辑
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    return false
  }
}
function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}
function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    /* ignore */
  }
}

// 生成短 id
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const contentKey = (id) => CONTENT_PREFIX + id

// 全新的默认设置（含独立的 avatarPos 对象）
function freshSettings() {
  return { ...DEFAULT_SETTINGS, avatarPos: { ...DEFAULT_AVATAR_POS } }
}

// 读取某份简历的内容（缺字段用默认补齐）
function loadContent(id) {
  try {
    const raw = safeGet(contentKey(id))
    if (raw) {
      const obj = JSON.parse(raw)
      return {
        markdown: typeof obj.markdown === 'string' ? obj.markdown : SAMPLE_MARKDOWN,
        settings: { ...freshSettings(), ...(obj.settings || {}) }
      }
    }
  } catch (e) {
    /* ignore */
  }
  return { markdown: SAMPLE_MARKDOWN, settings: freshSettings() }
}

// 加载简历列表；为空时尝试从旧版单份草稿迁移，最终保证至少一份
function loadResumeList() {
  try {
    const raw = safeGet(RESUMES_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr) && arr.length) return arr
    }
  } catch (e) {
    /* ignore */
  }
  // 迁移：把旧版 draft/settings 包装成一份简历
  const id = uid()
  const content = { markdown: SAMPLE_MARKDOWN, settings: freshSettings() }
  const legacyMd = safeGet(DRAFT_KEY)
  if (legacyMd !== null) content.markdown = legacyMd
  const legacySettings = safeGet(SETTINGS_KEY)
  if (legacySettings) {
    try {
      content.settings = { ...content.settings, ...JSON.parse(legacySettings) }
    } catch (e) {
      /* ignore */
    }
  }
  safeSet(contentKey(id), JSON.stringify(content))
  const list = [{ id, name: '我的简历' }]
  safeSet(RESUMES_KEY, JSON.stringify(list))
  safeSet(CURRENT_KEY, id)
  // 迁移完成后清理旧的单份草稿键（数据已并入新简历）
  safeRemove(DRAFT_KEY)
  safeRemove(SETTINGS_KEY)
  return list
}

// 模块级单例状态
const resumes = reactive(loadResumeList()) // [{ id, name }]
const currentId = ref((() => {
  const saved = safeGet(CURRENT_KEY)
  return saved && resumes.some((r) => r.id === saved) ? saved : resumes[0].id
})())

const markdown = ref('')
const settings = reactive(freshSettings())

// 把一份内容应用到当前的 markdown / settings（保持同一 reactive 引用）
function applyContent(content) {
  markdown.value = content.markdown
  Object.assign(settings, content.settings)
}
applyContent(loadContent(currentId.value)) // 初始化当前简历内容

// 持久化：当前简历内容 / 列表元数据
function persistCurrent() {
  return safeSet(contentKey(currentId.value), JSON.stringify({ markdown: markdown.value, settings }))
}
function persistList() {
  return safeSet(RESUMES_KEY, JSON.stringify(resumes.map((r) => ({ id: r.id, name: r.name }))))
}

// 内容 / 设置变更后防抖自动保存到当前简历
let saveTimer = null
watch(
  [markdown, settings],
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(persistCurrent, 300)
  },
  { deep: true }
)

// —— 多份简历操作 ——
function switchResume(id) {
  if (id === currentId.value) return
  persistCurrent() // 离开前先存当前
  currentId.value = id
  safeSet(CURRENT_KEY, id)
  applyContent(loadContent(id))
}
function createResume(name) {
  persistCurrent()
  const id = uid()
  safeSet(contentKey(id), JSON.stringify({ markdown: SAMPLE_MARKDOWN, settings: freshSettings() }))
  resumes.push({ id, name: name || '未命名简历' })
  persistList()
  currentId.value = id
  safeSet(CURRENT_KEY, id)
  applyContent(loadContent(id))
}
function duplicateResume(id) {
  const src = resumes.find((r) => r.id === id)
  if (!src) return
  persistCurrent()
  const content = loadContent(id)
  const newId = uid()
  safeSet(contentKey(newId), JSON.stringify(content))
  resumes.push({ id: newId, name: src.name + ' 副本' })
  persistList()
  currentId.value = newId
  safeSet(CURRENT_KEY, newId)
  applyContent(content)
}
function renameResume(id, name) {
  const r = resumes.find((x) => x.id === id)
  if (!r || !name) return
  r.name = name
  persistList()
}
// 删除简历（至少保留一份）；返回是否成功
function deleteResume(id) {
  if (resumes.length <= 1) return false
  const idx = resumes.findIndex((r) => r.id === id)
  if (idx < 0) return false
  resumes.splice(idx, 1)
  safeRemove(contentKey(id))
  persistList()
  if (currentId.value === id) {
    const next = resumes[0].id
    currentId.value = next
    safeSet(CURRENT_KEY, next)
    applyContent(loadContent(next))
  }
  return true
}

// 编辑器 CodeMirror 实例（EditorPane 就绪时注入），供工具栏在光标处插入文本
let editorView = null
function setEditorView(view) {
  editorView = view
}
// 在当前光标处插入文本（替换选区），并把光标移到插入内容之后
function insertAtCursor(text) {
  if (!editorView) {
    markdown.value += text // 编辑器未就绪时退化为追加到末尾
    return
  }
  const { from, to } = editorView.state.selection.main
  editorView.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length }
  })
  editorView.focus()
}
// 用 before/after 包裹当前选区；无选区时插入 placeholder 并选中它，便于继续输入
function wrapSelection(before, after, placeholder = '') {
  if (!editorView) {
    markdown.value += before + placeholder + after
    return
  }
  const { from, to } = editorView.state.selection.main
  const selected = editorView.state.sliceDoc(from, to) || placeholder
  editorView.dispatch({
    changes: { from, to, insert: before + selected + after },
    selection: { anchor: from + before.length, head: from + before.length + selected.length }
  })
  editorView.focus()
}

// 当前简历名（响应式）
const currentName = computed(() => {
  const r = resumes.find((x) => x.id === currentId.value)
  return r ? r.name : ''
})

export function useResume() {
  // 用新内容替换当前简历正文（导入时使用）
  function setMarkdown(text) {
    markdown.value = text || ''
  }
  // 重置当前简历为示例
  function resetToSample() {
    markdown.value = SAMPLE_MARKDOWN
  }
  // 清空当前简历正文
  function clear() {
    markdown.value = ''
  }
  // 立即落盘（取消防抖，同步写入当前简历与列表），返回是否成功
  function saveNow() {
    clearTimeout(saveTimer)
    const ok1 = persistCurrent()
    const ok2 = persistList()
    safeSet(CURRENT_KEY, currentId.value)
    return ok1 && ok2
  }
  // 把当前简历设置恢复为默认值
  function resetSettings() {
    Object.assign(settings, freshSettings())
  }
  // 仅把证件照位置恢复默认（右上角）
  function resetAvatarPos() {
    settings.avatarPos = { ...DEFAULT_AVATAR_POS }
  }

  return {
    markdown,
    settings,
    // 多份简历
    resumes,
    currentId,
    currentName,
    switchResume,
    createResume,
    duplicateResume,
    renameResume,
    deleteResume,
    // 内容操作
    setMarkdown,
    resetToSample,
    clear,
    saveNow,
    resetSettings,
    resetAvatarPos,
    // 编辑器
    setEditorView,
    insertAtCursor,
    wrapSelection
  }
}
