<script setup>
/**
 * 图标选择器：可搜索的 Tabler 图标面板（弹窗）。
 * - 顶部搜索框按图标名过滤（kebab 名，如 brand-github、map-pin）。
 * - 点击图标即在编辑器当前光标处插入 `icon:名称`，方便继续连续插入。
 * - 数据与渲染复用 markdown 图标插件导出的 ICON_NAMES / iconToSvg，保持单一来源。
 */
import { computed, ref } from 'vue'
import { ICON_NAMES, iconToSvg } from '../markdown/plugins/icon.js'
import { useResume } from '../composables/useResume.js'
import { useToast } from '../composables/useToast.js'

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const { insertAtCursor } = useResume()
const { show } = useToast()

// 空搜索时展示的常用简历图标，避免一上来全是冷门图标
const COMMON = [
  'phone', 'device-mobile', 'mail', 'at', 'map-pin', 'world', 'link',
  'brand-github', 'brand-gitlab', 'brand-wechat', 'brand-qq', 'rss',
  'calendar', 'clock', 'user', 'school', 'briefcase', 'home',
  'award', 'star', 'heart', 'book', 'code', 'building', 'id-badge-2'
]

const query = ref('')
const MAX = 150 // 限制单次渲染数量，避免一次渲染数千个 SVG 卡顿

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return COMMON.filter((n) => iconToSvg(n)) // 过滤掉个别不存在的名
  return ICON_NAMES.filter((n) => n.includes(q)).slice(0, MAX)
})

function pick(name) {
  insertAtCursor(`icon:${name} `)
  show(`已插入 icon:${name}`, 'success')
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="icon-overlay" @click="emit('close')">
      <div class="icon-dialog" @click.stop>
        <header class="icon-header">
          <span>选择图标（Tabler）</span>
          <button class="close-btn" @click="emit('close')" aria-label="关闭">×</button>
        </header>

        <div class="icon-search">
          <input
            v-model="query"
            type="text"
            placeholder="搜索图标名，如 github、phone、map…"
            spellcheck="false"
          />
        </div>

        <div class="icon-grid">
          <button
            v-for="name in results"
            :key="name"
            class="icon-cell"
            :title="name"
            @click="pick(name)"
          >
            <span class="icon-svg" v-html="iconToSvg(name)"></span>
            <span class="icon-name">{{ name }}</span>
          </button>
          <p v-if="!results.length" class="icon-empty">没有匹配的图标</p>
        </div>

        <p class="icon-hint">点击图标即在编辑器光标处插入 icon:名称；可继续连续插入。</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.icon-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-dialog {
  width: 560px;
  max-width: calc(100vw - 32px);
  max-height: 80vh;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.icon-header {
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid #eef0f3;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
}
.close-btn:hover {
  color: #111827;
}
.icon-search {
  padding: 14px 18px 8px;
}
.icon-search input {
  width: 100%;
  height: 36px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}
.icon-search input:focus {
  outline: none;
  border-color: #3b82f6;
}
.icon-grid {
  flex: 1;
  overflow: auto;
  padding: 8px 14px 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  align-content: start;
}
.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.icon-cell:hover {
  border-color: #3b82f6;
  background: #f5f9ff;
}
.icon-svg {
  font-size: 24px; /* 控制内联 SVG（width:1em）的实际大小 */
  color: #1f2937;
  line-height: 1;
}
.icon-name {
  font-size: 11px;
  color: #6b7280;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #9aa0a6;
  font-size: 13px;
  padding: 24px 0;
}
.icon-hint {
  flex: 0 0 auto;
  margin: 0;
  padding: 10px 18px;
  border-top: 1px solid #eef0f3;
  font-size: 12px;
  color: #9aa0a6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
