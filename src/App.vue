<template>
  <RouterView />
  <!-- 全局 dialog 出口：按 dialog store 的 type 分发 -->
  <DialogHost />
</template>

<script setup>
import DialogHost from './components/dialogs/DialogHost.vue'
</script>
