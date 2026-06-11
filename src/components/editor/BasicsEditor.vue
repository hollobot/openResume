<template>
  <section class="editor-card">
    <header class="card-head">
      <h3 class="card-title">基本信息</h3>
    </header>

    <div class="card-body">
      <FieldInput v-model="resume.basics.name" label="姓名" />
      <FieldInput v-model="resume.basics.headline" label="职位" placeholder="Java 开发工程师" />
      <FieldInput v-model="resume.basics.email" label="邮箱" />
      <FieldInput v-model="resume.basics.phone" label="电话" />
      <FieldInput v-model="resume.basics.location" label="所在地" />
      <FieldInput v-model="resume.basics.website" label="网站" type="website" />
    </div>

    <header class="card-head card-head-sub">
      <h3 class="card-title">个人简介</h3>
    </header>
    <div class="card-body">
      <FieldInput v-model="resume.summary.title" label="标题" />
      <FieldInput v-model="resume.summary.content" label="内容" type="textarea" />
    </div>
  </section>
</template>

<script setup>
import { resume } from '../../composables/useResumeStore.js'
import FieldInput from './fields/FieldInput.vue'
</script>

<style scoped>
.editor-card {
  background: #14142a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #181836;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-head-sub {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin: 0;
}

.card-body {
  padding: 12px 14px;
}
</style>
