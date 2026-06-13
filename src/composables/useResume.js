/**
 * 简历状态管理（轻量 composable，替代 Pinia）
 *
 * 管理两类数据，均持久化到 localStorage：
 *  - markdown：简历正文（后台防抖自动保存，刷新不丢失）。
 *  - settings：预览样式设置（字体 / 行距 / 自定义 CSS）。
 * 同时提供 saveNow()，供 Ctrl+S / 「保存」按钮立即落盘。
 */
import { ref, reactive, watch } from 'vue'
import { SAMPLE_MARKDOWN } from './sample.js'

const DRAFT_KEY = 'open-resume:draft'
const SETTINGS_KEY = 'open-resume:settings'

// 证件照默认位置（相对简历纸张左上角，px）：放在右上角
const DEFAULT_AVATAR_POS = { x: 650, y: 44 }

// 预览样式默认值
const DEFAULT_SETTINGS = {
  fontFamily: '', // 空串表示使用模板默认字体
  lineHeight: 1.65, // 行距
  customCss: '', // 自定义 CSS（作用于简历预览）
  avatar: '', // 证件照（base64 dataURL，空则不显示）
  avatarPos: { ...DEFAULT_AVATAR_POS } // 证件照在简历上的固定位置（可自由拖动）
}

// 启动时读取本地草稿，没有则回填示例简历
function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    return saved !== null ? saved : SAMPLE_MARKDOWN
  } catch (e) {
    return SAMPLE_MARKDOWN
  }
}

// 启动时读取本地设置，缺字段用默认值补齐
function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }
  } catch (e) {
    return { ...DEFAULT_SETTINGS }
  }
}

// 模块级单例状态：所有组件共享同一份数据
const markdown = ref(loadDraft())
const settings = reactive(loadSettings())

// 安全写入：localStorage 不可用 / 容量满时静默失败，不影响编辑
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    return false
  }
}

// 草稿后台防抖自动保存
let draftTimer = null
watch(markdown, (val) => {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(() => safeSet(DRAFT_KEY, val), 300)
})

// 设置项变更后防抖保存
let settingsTimer = null
watch(
  settings,
  (val) => {
    clearTimeout(settingsTimer)
    settingsTimer = setTimeout(() => safeSet(SETTINGS_KEY, JSON.stringify(val)), 300)
  },
  { deep: true }
)

export function useResume() {
  // 用新内容替换当前简历（导入时使用）
  function setMarkdown(text) {
    markdown.value = text || ''
  }

  // 重置为示例简历
  function resetToSample() {
    markdown.value = SAMPLE_MARKDOWN
  }

  // 清空内容
  function clear() {
    markdown.value = ''
  }

  // 立即落盘（取消防抖，同步写入草稿与设置），返回是否成功
  function saveNow() {
    clearTimeout(draftTimer)
    clearTimeout(settingsTimer)
    const ok1 = safeSet(DRAFT_KEY, markdown.value)
    const ok2 = safeSet(SETTINGS_KEY, JSON.stringify(settings))
    return ok1 && ok2
  }

  // 把设置恢复为默认值
  function resetSettings() {
    Object.assign(settings, { ...DEFAULT_SETTINGS, avatarPos: { ...DEFAULT_AVATAR_POS } })
  }

  // 仅把证件照位置恢复默认（右上角）
  function resetAvatarPos() {
    settings.avatarPos = { ...DEFAULT_AVATAR_POS }
  }

  return {
    markdown,
    settings,
    setMarkdown,
    resetToSample,
    clear,
    saveNow,
    resetSettings,
    resetAvatarPos
  }
}
