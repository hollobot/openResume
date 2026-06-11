<template>
  <div class="ls">
    <PictureSection />
    <BasicsSection />
    <SummarySection />
    <ItemsSection v-for="key in STANDARD_SECTION_KEYS" :key="key" :section-key="key" />
  </div>
</template>

<script setup>
/**
 * 左侧编辑栏：picture + basics + summary + 12 标准区块
 * （自定义区块入口在阶段 5 接入）
 */
import { STANDARD_SECTION_KEYS } from '../../../schema/index.js'
import PictureSection from './PictureSection.vue'
import BasicsSection from './BasicsSection.vue'
import SummarySection from './SummarySection.vue'
import ItemsSection from './ItemsSection.vue'
</script>

<style scoped>
.ls {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background: #0f0f1e;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.ls::-webkit-scrollbar { width: 6px; }
.ls::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 10px; }
</style>
