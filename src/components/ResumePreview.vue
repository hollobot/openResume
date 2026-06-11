<template>
  <!-- resume-print-area 是打印时的定位锚点 -->
  <div class="preview-wrapper resume-print-area">
    <div class="preview-scroll">
      <div
        ref="pageRef"
        class="resume-page"
        :style="{ '--accent-color': parsedMeta.color || '#4a90d9' }"
        v-html="fullHtml"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseResume } from '../composables/useResumeParser.js'
import '../styles/resume.css'

const props = defineProps({
  markdown: { type: String, default: '' },
})

// 解析结果
const parsed = computed(() => parseResume(props.markdown))
const fullHtml = computed(() => parsed.value.header + parsed.value.body)
const parsedMeta = computed(() => parsed.value.meta)

// 暴露 DOM 引用给父组件（JPG 导出时使用）
const pageRef = ref(null)
defineExpose({ pageRef })
</script>

<style scoped>
.preview-wrapper {
  height: 100%;
  background: #2d2d44;
  display: flex;
  flex-direction: column;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}
</style>
