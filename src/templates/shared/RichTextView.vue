<template>
  <div v-if="cleaned" class="rr-rich" v-html="cleaned" />
</template>

<script setup>
/**
 * 简历内富文本渲染（对应 RR shared/rich-text.tsx）
 * 白名单净化后 v-html；样式见 artboard.css 的 .rr-rich 系列
 */
import { computed } from 'vue'
import { sanitizeHtml } from './sanitize.js'

const props = defineProps({
  html: { type: String, default: '' },
})

const cleaned = computed(() => sanitizeHtml(props.html))
</script>
