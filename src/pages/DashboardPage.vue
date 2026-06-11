<template>
  <div class="dp">
    <header class="dp-head">
      <h1 class="dp-title"><span class="dp-logo">✦</span> 我的简历</h1>
    </header>

    <div class="dp-grid">
      <!-- 新建卡片 -->
      <button class="dp-card dp-create" @click="openDialog('resume-create')">
        <i class="ph ph-plus" />
        <span>新建简历</span>
      </button>

      <!-- 简历列表（阶段 3 升级为缩略图卡片 + 完整操作） -->
      <RouterLink
        v-for="r in sorted"
        :key="r.id"
        class="dp-card dp-resume"
        :to="`/builder/${r.id}`"
      >
        <i class="ph ph-read-cv-logo dp-resume-icon" />
        <span class="dp-resume-name">{{ r.name }}</span>
        <span class="dp-resume-time">{{ formatTime(r.updatedAt) }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
/**
 * 仪表盘（阶段 1 简版：新建 + 打开；阶段 3 补缩略图与完整操作）
 */
import { computed } from 'vue'
import { resumesIndex } from '../stores/resumes.js'
import { openDialog } from '../stores/dialog.js'

const sorted = computed(() => [...resumesIndex].sort((a, b) => b.updatedAt - a.updatedAt))

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.dp {
  height: 100vh;
  overflow-y: auto;
  padding: 32px clamp(20px, 6vw, 80px);
  background: #0d0d1c;
}

.dp-head { margin-bottom: 24px; }

.dp-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dp-logo { color: #6366f1; }

.dp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.dp-card {
  aspect-ratio: 1 / 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

.dp-card:hover { transform: translateY(-2px); }

.dp-create {
  border: 2px dashed rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #64748b;
  font-size: 14px;
}

.dp-create i { font-size: 28px; }
.dp-create:hover { border-color: #6366f1; color: #a5b4fc; }

.dp-resume {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #14142a;
  padding: 16px;
}

.dp-resume:hover { border-color: rgba(99, 102, 241, 0.5); }

.dp-resume-icon { font-size: 36px; color: #818cf8; }

.dp-resume-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
}

.dp-resume-time { font-size: 11px; color: #475569; }
</style>
