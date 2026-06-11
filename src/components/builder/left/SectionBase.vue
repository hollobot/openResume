<template>
  <section class="sb" :data-anchor="anchorId">
    <!-- 头部：折叠箭头 + 图标 + 标题 + 菜单 -->
    <header class="sb-head" @click="collapsed = !collapsed">
      <i class="ph ph-caret-down sb-caret" :class="{ collapsed }" />
      <i v-if="icon" :class="`ph ph-${icon}`" class="sb-icon" />
      <!-- 重命名态：内联输入框 -->
      <input
        v-if="renaming"
        ref="renameInput"
        class="sb-rename"
        :value="title"
        @click.stop
        @keydown.enter="commitRename($event.target.value)"
        @blur="commitRename($event.target.value)"
      />
      <h3 v-else class="sb-title" :class="{ 'sb-hidden': hidden }">{{ title }}</h3>

      <span class="sb-spacer" />

      <slot name="actions" />

      <!-- 区块菜单 -->
      <DropdownMenu v-if="menu" @click.stop>
        <template #trigger>
          <button class="sb-menu-btn" title="区块选项" @click.stop>
            <i class="ph ph-dots-three-vertical" />
          </button>
        </template>
        <button v-if="onAdd" class="dd-item" @click="onAdd"><i class="ph ph-plus" /> 添加条目</button>
        <button class="dd-item" @click="$emit('toggle-hidden')">
          <i :class="hidden ? 'ph ph-eye' : 'ph ph-eye-slash'" />
          {{ hidden ? '显示区块' : '隐藏区块' }}
        </button>
        <button class="dd-item" @click="startRename"><i class="ph ph-pencil-simple" /> 重命名</button>
        <div v-if="columnsEnabled" class="dd-sep" />
        <div v-if="columnsEnabled" class="sb-columns" @click.stop>
          <span class="sb-columns-label">列数</span>
          <button
            v-for="n in 6"
            :key="n"
            class="sb-col-btn"
            :class="{ active: columns === n }"
            @click="$emit('set-columns', n)"
          >{{ n }}</button>
        </div>
        <slot name="menu-extra" />
      </DropdownMenu>
    </header>

    <!-- 内容区 -->
    <div v-show="!collapsed" class="sb-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * 左栏区块外壳（对应 RR -sidebar/left/shared/section-base.tsx）
 * 可折叠 accordion + 区块菜单（添加/显隐/重命名/列数）
 */
import { ref, nextTick } from 'vue'
import DropdownMenu from '../../ui/DropdownMenu.vue'

const props = defineProps({
  anchorId: { type: String, default: '' }, // 边缘条锚点定位用
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  hidden: { type: Boolean, default: false },
  columns: { type: Number, default: 1 },
  columnsEnabled: { type: Boolean, default: true },
  menu: { type: Boolean, default: true },
  onAdd: { type: Function, default: null },
})

const emit = defineEmits(['toggle-hidden', 'rename', 'set-columns'])

const collapsed = ref(false)
const renaming = ref(false)
const renameInput = ref(null)

async function startRename() {
  renaming.value = true
  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
}

function commitRename(value) {
  if (!renaming.value) return
  renaming.value = false
  emit('rename', value.trim())
}
</script>

<style scoped>
.sb {
  background: #14142a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  margin-bottom: 10px;
  overflow: visible;
}

.sb-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}

.sb-caret {
  font-size: 12px;
  color: #64748b;
  transition: transform 0.15s;
}

.sb-caret.collapsed { transform: rotate(-90deg); }

.sb-icon { font-size: 15px; color: #818cf8; }

.sb-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.sb-title.sb-hidden { opacity: 0.45; text-decoration: line-through; }

.sb-rename {
  flex: 1;
  background: #1c1c38;
  border: 1px solid #6366f1;
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 13px;
  color: #e2e8f0;
  outline: none;
}

.sb-spacer { flex: 1; }

.sb-menu-btn {
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
  font-size: 15px;
}

.sb-menu-btn:hover { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }

.sb-body { padding: 4px 12px 12px; }

/* 菜单内的列数选择行 */
.sb-columns {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
}

.sb-columns-label { font-size: 12px; color: #94a3b8; margin-right: 4px; }

.sb-col-btn {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 11px;
  cursor: pointer;
}

.sb-col-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
</style>
