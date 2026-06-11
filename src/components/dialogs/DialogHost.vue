<template>
  <!-- 全局 dialog 出口：各 dialog 自行判断 dialog.type 是否匹配 -->
  <SectionItemDialog />
  <CreateResumeDialog />
</template>

<script setup>
/**
 * dialog 分发宿主（对应 RR 的 dialogs 注册机制）
 * 阶段 3+ 在此追加 Rename/Duplicate/Delete/Import/TemplateGallery 等
 */
import SectionItemDialog from './SectionItemDialog.vue'
import CreateResumeDialog from './CreateResumeDialog.vue'
</script>
