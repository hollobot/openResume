<template>
  <div class="rr-page rr-tpl-onyx" :class="classes" :style="vars">
    <!-- ── 头部（仅第一页）：头像 + 姓名/职位 + 联系方式，底部主色分隔线 ── -->
    <header v-if="pageIndex === 0" class="onyx-header">
      <PictureImg />
      <div class="onyx-header-title">
        <div class="onyx-header-identity">
          <h1 class="rr-name">{{ basics.name }}</h1>
          <div v-if="basics.headline">{{ basics.headline }}</div>
        </div>
        <div class="onyx-contact-list">
          <ContactItem v-if="basics.email" icon="envelope-simple" :text="basics.email" :href="`mailto:${basics.email}`" />
          <ContactItem v-if="basics.phone" icon="phone" :text="basics.phone" :href="`tel:${basics.phone}`" />
          <ContactItem v-if="basics.location" icon="map-pin" :text="basics.location" />
          <ContactItem
            v-if="basics.website?.url"
            icon="globe"
            :text="basics.website.label || basics.website.url"
            :href="basics.website.url"
          />
          <ContactItem
            v-for="field in basics.customFields"
            :key="field.id"
            :icon="field.icon"
            :text="field.text"
            :href="field.link"
          />
        </div>
      </div>
    </header>

    <!-- ── 主栏区块组（onyx 为单栏：main 与 sidebar 纵向堆叠） ── -->
    <div class="rr-section-group">
      <SectionRenderer v-for="id in page.main" :key="id" :section-id="id" placement="main" />
    </div>

    <div v-if="!page.fullWidth && page.sidebar.length" class="rr-section-group">
      <SectionRenderer v-for="id in page.sidebar" :key="id" :section-id="id" placement="sidebar" />
    </div>
  </div>
</template>

<script setup>
/**
 * Onyx 模板（移植 RR templates/onyx/OnyxPage.tsx）
 * 视觉特征：单栏极简；头部水平布局（头像左、信息右），底部 1pt 主色分隔线。
 */
import { computed } from 'vue'
import { useResumeData } from '../shared/context.js'
import { pageVars, pageClasses } from '../shared/metrics.js'
import SectionRenderer from '../shared/SectionRenderer.vue'
import ContactItem from '../shared/ContactItem.vue'
import PictureImg from '../shared/PictureImg.vue'

const props = defineProps({
  // 当前页布局 { fullWidth, main: [], sidebar: [] }
  page: { type: Object, required: true },
  pageIndex: { type: Number, default: 0 },
})

const data = useResumeData()

const basics = computed(() => data.value.basics)
const vars = computed(() => pageVars(data.value.metadata))
const classes = computed(() => pageClasses(data.value.metadata))
</script>

<style>
/* onyx 私有样式（非 scoped，rr-tpl-onyx 前缀隔离） */

.rr-tpl-onyx .onyx-header {
  display: flex;
  align-items: center;
  column-gap: var(--rr-gap-x);
  border-bottom: 1pt solid var(--rr-primary);
  padding-bottom: var(--rr-margin-y);
}

.rr-tpl-onyx .onyx-header-title {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--rr-gap-y) * 0.5);
  min-width: 0;
}

.rr-tpl-onyx .onyx-header-identity {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--rr-gap-y) * 0.35);
}

.rr-tpl-onyx .onyx-contact-list {
  display: flex;
  flex-wrap: wrap;
  row-gap: calc(var(--rr-gap-y) * 0.125);
  column-gap: calc(var(--rr-gap-x) * 0.75);
}
</style>
