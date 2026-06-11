<template>
  <div class="sir" :class="{ 'sir-hidden': item.hidden }">
    <!-- 拖拽把手 -->
    <span class="sir-handle" title="拖拽排序">
      <i class="ph ph-dots-six-vertical" />
    </span>

    <!-- 标题/副标题（点击编辑） -->
    <button class="sir-main" @click="$emit('edit')">
      <span class="sir-title">{{ title || '（未命名）' }}</span>
      <span v-if="subtitle" class="sir-subtitle">{{ subtitle }}</span>
    </button>

    <!-- 条目菜单 -->
    <DropdownMenu>
      <template #trigger>
        <button class="sir-menu-btn"><i class="ph ph-dots-three-vertical" /></button>
      </template>
      <button class="dd-item" @click="$emit('toggle-hidden')">
        <i :class="item.hidden ? 'ph ph-eye' : 'ph ph-eye-slash'" />
        {{ item.hidden ? '显示' : '隐藏' }}
      </button>
      <button class="dd-item" @click="$emit('edit')"><i class="ph ph-pencil-simple" /> 编辑</button>
      <button class="dd-item" @click="$emit('duplicate')"><i class="ph ph-copy" /> 复制</button>
      <div class="dd-sep" />
      <button class="dd-item dd-danger" @click="$emit('remove')"><i class="ph ph-trash" /> 删除</button>
    </DropdownMenu>
  </div>
</template>

<script setup>
/**
 * 区块内条目行（对应 RR -sidebar/left/shared/section-item.tsx）
 * 把手拖拽排序 + 点击打开编辑 dialog + 条目菜单（显隐/编辑/复制/删除）
 */
import DropdownMenu from '../../ui/DropdownMenu.vue'

defineProps({
  item: { type: Object, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

defineEmits(['edit', 'toggle-hidden', 'duplicate', 'remove'])
</script>

<style scoped>
.sir {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  margin-bottom: 6px;
  background: #17172f;
  transition: border-color 0.15s;
}

.sir:hover { border-color: rgba(255, 255, 255, 0.16); }

.sir-hidden { opacity: 0.5; }

.sir-handle {
  display: flex;
  align-items: center;
  padding: 0 2px 0 6px;
  color: #475569;
  cursor: grab;
  font-size: 14px;
}

.sir-handle:active { cursor: grabbing; }

.sir-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  background: transparent;
  border: none;
  padding: 8px 4px;
  cursor: pointer;
  text-align: left;
}

.sir-title {
  font-size: 12.5px;
  font-weight: 500;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sir-subtitle {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sir-menu-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 5px;
  color: #64748b;
  cursor: pointer;
  margin-right: 4px;
  flex-shrink: 0;
}

.sir-menu-btn:hover { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }
</style>
