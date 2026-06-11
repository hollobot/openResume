<template>
  <div class="ip">
    <span v-if="label" class="ip-label">{{ label }}</span>
    <div class="ip-row">
      <!-- 当前图标预览 + 点击展开 -->
      <button class="ip-preview" type="button" title="选择图标" @click="open = !open">
        <i v-if="modelValue" :class="`ph ph-${modelValue}`" />
        <span v-else class="ip-none">无</span>
      </button>
      <!-- 图标名直输（支持任意 Phosphor 名称） -->
      <input
        class="ip-input"
        :value="modelValue"
        placeholder="phosphor 图标名"
        @change="$emit('update:modelValue', $event.target.value.trim())"
      />
      <button v-if="modelValue" class="ip-clear" type="button" title="清除" @click="$emit('update:modelValue', '')">✕</button>
    </div>

    <!-- 常用图标网格 -->
    <div v-if="open" class="ip-grid">
      <button
        v-for="name in COMMON_ICONS"
        :key="name"
        class="ip-cell"
        :class="{ active: modelValue === name }"
        :title="name"
        type="button"
        @click="pick(name)"
      >
        <i :class="`ph ph-${name}`" />
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * Phosphor 图标选择器：
 * - 常用图标网格快速选择（@phosphor-icons/web icon font 按名渲染）
 * - 文本框支持直接输入任意合法图标名（与 RR 数据格式一致：纯字符串名）
 */
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

function pick(name) {
  emit('update:modelValue', name)
  open.value = false
}

// 简历场景常用子集（完整 Phosphor 名称可通过文本框直输）
const COMMON_ICONS = [
  'user', 'envelope-simple', 'phone', 'map-pin', 'globe', 'link',
  'github-logo', 'gitlab-logo', 'linkedin-logo', 'twitter-logo', 'x-logo',
  'wechat-logo', 'telegram-logo', 'discord-logo', 'youtube-logo', 'instagram-logo',
  'briefcase', 'graduation-cap', 'code-simple', 'code', 'terminal',
  'compass-tool', 'translate', 'football', 'trophy', 'certificate',
  'books', 'book-open', 'hand-heart', 'article', 'note-pencil',
  'star', 'heart', 'lightning', 'fire', 'rocket', 'rocket-launch',
  'target', 'medal', 'crown', 'diamond', 'shield-check',
  'music-notes', 'camera', 'palette', 'pen-nib', 'game-controller',
  'airplane', 'car', 'bicycle', 'barbell', 'coffee',
  'chart-line-up', 'chart-bar', 'database', 'cloud', 'cpu',
  'device-mobile', 'desktop', 'wrench', 'gear', 'puzzle-piece',
  'users', 'chats-circle', 'megaphone', 'presentation-chart', 'calendar',
]
</script>

<style scoped>
.ip { display: flex; flex-direction: column; gap: 5px; }

.ip-label { font-size: 12px; color: #94a3b8; }

.ip-row { display: flex; align-items: center; gap: 6px; }

.ip-preview {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.ip-preview:hover { border-color: #6366f1; }

.ip-none { font-size: 10px; color: #64748b; }

.ip-input {
  flex: 1;
  min-width: 0;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 9px;
  font-size: 12px;
  color: #e2e8f0;
  outline: none;
}

.ip-input:focus { border-color: #6366f1; }

.ip-clear {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
}

.ip-clear:hover { color: #f87171; }

.ip-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  max-height: 180px;
  overflow-y: auto;
  background: #12122a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px;
  scrollbar-width: thin;
}

.ip-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 5px;
  color: #cbd5e1;
  font-size: 15px;
  cursor: pointer;
}

.ip-cell:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.ip-cell.active { background: #6366f1; color: #fff; }
</style>
