<template>
  <div class="ci">
    <span v-if="label" class="ci-label">{{ label }}</span>
    <div class="ci-row">
      <!-- 预设色板 -->
      <button
        v-for="c in PRESETS"
        :key="c"
        class="ci-swatch"
        :class="{ active: modelValue === c }"
        :style="{ background: c }"
        :title="c"
        type="button"
        @click="$emit('update:modelValue', c)"
      />
    </div>
    <div class="ci-row">
      <!-- 原生取色器（hex 部分） -->
      <input class="ci-native" type="color" :value="hexValue" @input="onHexInput" />
      <!-- rgba 文本（可直接编辑） -->
      <input
        class="ci-text"
        :value="modelValue"
        placeholder="rgba(0, 0, 0, 1)"
        @change="onTextInput"
      />
      <!-- alpha 滑块 -->
      <input
        class="ci-alpha"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="alphaValue"
        title="不透明度"
        @input="onAlphaInput"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * 颜色选择器：数据格式与 RR 一致，存储 rgba(r, g, b, a) 字符串。
 * 预设色板（对齐 RR 常用主色）+ 原生取色器 + alpha 滑块 + 文本直输。
 */
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'rgba(0, 0, 0, 1)' },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// RR 风格预设主色
const PRESETS = [
  'rgba(220, 38, 38, 1)', // red
  'rgba(234, 88, 12, 1)', // orange
  'rgba(202, 138, 4, 1)', // yellow
  'rgba(22, 163, 74, 1)', // green
  'rgba(13, 148, 136, 1)', // teal
  'rgba(37, 99, 235, 1)', // blue
  'rgba(79, 70, 229, 1)', // indigo
  'rgba(147, 51, 234, 1)', // purple
  'rgba(219, 39, 119, 1)', // pink
  'rgba(0, 0, 0, 1)', // black
  'rgba(82, 82, 82, 1)', // gray
]

/**
 * 解析 rgba 字符串 → { r, g, b, a }，失败返回黑色
 */
function parseRgba(str) {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(str || '')
  if (!m) return { r: 0, g: 0, b: 0, a: 1 }
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] }
}

function toRgbaString({ r, g, b, a }) {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const parsed = computed(() => parseRgba(props.modelValue))

// hex（供原生取色器）
const hexValue = computed(() => {
  const { r, g, b } = parsed.value
  const h = (n) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
})

const alphaValue = computed(() => parsed.value.a)

function onHexInput(e) {
  const hex = e.target.value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  emit('update:modelValue', toRgbaString({ r, g, b, a: parsed.value.a }))
}

function onAlphaInput(e) {
  emit('update:modelValue', toRgbaString({ ...parsed.value, a: +e.target.value }))
}

function onTextInput(e) {
  // 仅在能解析时采纳，否则还原显示
  const v = e.target.value.trim()
  if (/rgba?\(/.test(v)) {
    emit('update:modelValue', toRgbaString(parseRgba(v)))
  } else {
    e.target.value = props.modelValue
  }
}
</script>

<style scoped>
.ci { display: flex; flex-direction: column; gap: 6px; }

.ci-label { font-size: 12px; color: #94a3b8; }

.ci-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.ci-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.ci-swatch.active { border-color: #fff; box-shadow: 0 0 0 2px #6366f1; }

.ci-native {
  width: 34px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
}

.ci-text {
  flex: 1;
  min-width: 120px;
  background: #15152c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 12px;
  color: #e2e8f0;
  outline: none;
  font-family: monospace;
}

.ci-text:focus { border-color: #6366f1; }

.ci-alpha {
  width: 72px;
  accent-color: #6366f1;
}
</style>
