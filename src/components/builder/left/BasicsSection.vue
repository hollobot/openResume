<template>
  <SectionBase anchor-id="basics" title="基本信息" icon="user" :menu="false" :columns-enabled="false">
    <div class="bs-grid">
      <TextInput v-model="basics.name" label="姓名" />
      <TextInput v-model="basics.headline" label="职位头衔" placeholder="Java 开发工程师" />
      <TextInput v-model="basics.email" label="邮箱" type="email" />
      <TextInput v-model="basics.phone" label="电话" />
      <TextInput v-model="basics.location" label="所在地" />
      <div class="bs-website">
        <TextInput v-model="basics.website.url" label="个人网站" placeholder="https://" />
        <TextInput v-model="basics.website.label" label="显示文本" placeholder="可选" />
      </div>
    </div>

    <!-- 自定义字段 -->
    <div class="bs-cf-title">自定义字段</div>
    <CustomFieldsList />
  </SectionBase>
</template>

<script setup>
/**
 * 基本信息内联表单（对应 RR sections/basics.tsx）
 */
import { computed } from 'vue'
import { draft } from '../../../stores/builder.js'
import SectionBase from './SectionBase.vue'
import TextInput from '../../ui/TextInput.vue'
import CustomFieldsList from './CustomFieldsList.vue'

const basics = computed(() => draft.record.data.basics)
</script>

<style scoped>
.bs-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bs-website {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 8px;
}

.bs-cf-title {
  margin: 14px 0 8px;
  font-size: 12px;
  color: #94a3b8;
}
</style>
