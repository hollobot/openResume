<template>
  <!-- resume-print-area 是打印时的定位锚点 -->
  <div class="preview-wrapper resume-print-area">
    <div class="preview-scroll">
      <div ref="pageRef" class="resume-page" :style="pageVars">
        <component :is="templateComponent" :resume="resume" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { resume } from '../../composables/useResumeStore.js'
import { getTemplate } from '../../resume/templates/index.js'
import '../../styles/resume.css'

// 当前模板组件（随 metadata.template 变化）
const templateComponent = computed(() => getTemplate(resume.metadata.template))

// 把 metadata 映射成页面 CSS 变量，注入到 .resume-page
const pageVars = computed(() => {
  const m = resume.metadata
  return {
    '--primary': m.design.colors.primary,
    '--text': m.design.colors.text,
    '--bg': m.design.colors.background,
    '--font-size': `${m.typography.body.fontSize}px`,
    '--line-height': m.typography.body.lineHeight,
    '--heading-size': `${m.typography.heading.fontSize}px`,
    '--page-margin-x': `${m.page.marginX}px`,
    '--page-margin-y': `${m.page.marginY}px`,
    '--section-gap': `${m.page.gapY}px`,
    'font-family': m.typography.body.fontFamily || undefined,
  }
})

// 暴露 DOM 引用给父组件（JPG 导出时使用）
const pageRef = ref(null)
defineExpose({ pageRef })
</script>

<style scoped>
.preview-wrapper {
  height: 100%;
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
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.preview-scroll::-webkit-scrollbar {
  width: 5px;
}

.preview-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}
</style>
