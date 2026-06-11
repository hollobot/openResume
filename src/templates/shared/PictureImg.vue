<template>
  <img v-if="visible" class="rr-picture" :src="picture.url" :style="style" alt="" />
</template>

<script setup>
/**
 * 简历头像（对应 RR shared/picture.ts 的全部参数）
 * size/rotation/aspectRatio/borderRadius/border/shadow 全部由 picture 字段驱动
 */
import { computed } from 'vue'
import { useResumeData } from './context.js'

const data = useResumeData()

const picture = computed(() => data.value.picture)

const visible = computed(() => !picture.value.hidden && Boolean(picture.value.url))

const style = computed(() => {
  const p = picture.value
  return {
    width: `${p.size}pt`,
    height: `${p.size / (p.aspectRatio || 1)}pt`,
    objectFit: 'cover',
    borderRadius: `${p.borderRadius}pt`,
    border: p.borderWidth ? `${p.borderWidth}pt solid ${p.borderColor}` : 'none',
    boxShadow: p.shadowWidth ? `0 0 ${p.shadowWidth}pt ${p.shadowColor}` : 'none',
    transform: p.rotation ? `rotate(${p.rotation}deg)` : 'none',
  }
})
</script>
