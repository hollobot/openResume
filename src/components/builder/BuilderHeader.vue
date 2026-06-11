<template>
  <header class="bh">
    <div class="bh-left">
      <RouterLink to="/" class="bh-home" title="返回仪表盘">
        <i class="ph ph-house-simple" />
      </RouterLink>
      <span class="bh-sep">/</span>
      <!-- 简历名（可直接编辑） -->
      <input v-model="name" class="bh-name" placeholder="未命名简历" />
    </div>

    <div class="bh-right">
      <span class="bh-saved" title="编辑内容自动保存到本地">
        <i class="ph ph-check-circle" /> 自动保存
      </span>
    </div>
  </header>
</template>

<script setup>
/**
 * builder 顶栏（对应 RR builder header.tsx 精简版：返回 + 简历名编辑）
 */
import { computed } from 'vue'
import { draft } from '../../stores/builder.js'

const name = computed({
  get: () => draft.record?.name || '',
  set: (v) => {
    if (draft.record) draft.record.name = v
  },
})
</script>

<style scoped>
.bh {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: #0d0d1c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.bh-left { display: flex; align-items: center; gap: 8px; min-width: 0; }

.bh-home {
  display: flex;
  align-items: center;
  color: #94a3b8;
  font-size: 17px;
  text-decoration: none;
  padding: 5px;
  border-radius: 6px;
}

.bh-home:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }

.bh-sep { color: #334155; }

.bh-name {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #e2e8f0;
  outline: none;
  min-width: 160px;
}

.bh-name:hover { border-color: rgba(255, 255, 255, 0.12); }
.bh-name:focus { border-color: #6366f1; background: #15152c; }

.bh-saved {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4ade80;
  opacity: 0.8;
}
</style>
