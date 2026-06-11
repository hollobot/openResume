<template>
  <!-- resume-print-area 是打印时的定位锚点 -->
  <div class="preview-wrapper resume-print-area">
    <div class="preview-scroll">
      <div
        ref="pageRef"
        class="resume-page"
        :style="{ '--accent-color': parsedMeta.color || '#262626' }"
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

// 解析结果：{ html, meta }
const parsed = computed(() => parseResume(props.markdown))
const fullHtml = computed(() => parsed.value.html)
const parsedMeta = computed(() => parsed.value.meta)

// 暴露 DOM 引用给父组件（JPG 导出时使用）
const pageRef = ref(null)
defineExpose({ pageRef })
</script>

<style scoped>
.preview-wrapper {
  height: 100%;
  /* 更中性的深灰背景，让白色简历页面对比更自然 */
  background: #1e2028;
  display: flex;
  flex-direction: column;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 28px 20px 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.12) transparent;
}

.preview-scroll::-webkit-scrollbar {
  width: 5px;
}

.preview-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.12);
  border-radius: 10px;
}
</style>
