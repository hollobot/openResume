<template>
  <div v-if="visible" class="rr-level" :class="`rr-level-${design.type}`">
    <template v-for="i in 5" :key="i">
      <!-- icon 型：图标透明度区分激活态 -->
      <i
        v-if="design.type === 'icon'"
        :class="`ph ph-${design.icon}`"
        class="rr-level-icon"
        :style="{ opacity: i <= level ? 1 : 0.35 }"
      />
      <!-- 其余几何型：边框 + 激活填充 -->
      <span
        v-else
        class="rr-level-item"
        :class="{ active: i <= level }"
      />
    </template>
  </div>
</template>

<script setup>
/**
 * 技能/语言等级显示（对应 RR shared/level-display.tsx）
 * 类型：hidden | circle | square | rectangle | rectangle-full | progress-bar | icon
 * level=0 不渲染；几何尺寸与间距由 artboard.css 按类型定义
 */
import { computed } from 'vue'
import { useResumeData } from './context.js'

const props = defineProps({
  level: { type: Number, default: 0 },
})

const data = useResumeData()

const design = computed(() => data.value.metadata.design.level)

const visible = computed(() => {
  if (props.level === 0) return false
  const d = design.value
  if (d.type === 'hidden') return false
  if (d.type === 'icon' && !d.icon) return false
  return true
})

const level = computed(() => props.level)
</script>
