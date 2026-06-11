<template>
  <SectionBase
    anchor-id="summary"
    :title="summary.title || '个人简介'"
    :icon="summary.icon || 'article'"
    :hidden="summary.hidden"
    :columns="summary.columns"
    @toggle-hidden="summary.hidden = !summary.hidden"
    @rename="summary.title = $event"
    @set-columns="summary.columns = $event"
  >
    <RichTextEditor v-model="summary.content" />
  </SectionBase>
</template>

<script setup>
/**
 * 个人简介编辑（对应 RR sections/summary.tsx：tiptap 富文本）
 */
import { computed } from 'vue'
import { draft } from '../../../stores/builder.js'
import SectionBase from './SectionBase.vue'
import RichTextEditor from '../../ui/RichTextEditor.vue'

const summary = computed(() => draft.record.data.summary)
</script>
