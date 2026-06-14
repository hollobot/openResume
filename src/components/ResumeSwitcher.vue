<script setup>
/**
 * 简历切换器（工具栏左侧下拉）：管理多份简历。
 * - 显示当前简历名，点击展开列表切换。
 * - 每项可重命名 / 删除；底部可新建、复制当前。
 * 重命名/新建用 prompt 取名，删除用 confirm 确认（与项目现有交互一致）。
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useResume } from '../composables/useResume.js'

const {
  resumes,
  currentId,
  currentName,
  switchResume,
  createResume,
  duplicateResume,
  renameResume,
  deleteResume
} = useResume()

const open = ref(false)
function close() {
  open.value = false
}
onMounted(() => document.addEventListener('click', close))
onUnmounted(() => document.removeEventListener('click', close))

function onSwitch(id) {
  switchResume(id)
  open.value = false
}
function onCreate() {
  const name = prompt('新建简历名称：', '未命名简历')
  if (name !== null) {
    createResume(name.trim() || '未命名简历')
    open.value = false
  }
}
function onDuplicate() {
  duplicateResume(currentId.value)
  open.value = false
}
function onRename(id, curName) {
  const name = prompt('重命名简历：', curName)
  if (name !== null && name.trim()) renameResume(id, name.trim())
}
function onDelete(id, name) {
  if (resumes.length <= 1) {
    alert('至少保留一份简历，无法删除最后一份。')
    return
  }
  if (confirm(`确定删除简历「${name}」吗？该操作不可恢复。`)) deleteResume(id)
}
</script>

<template>
  <div class="resume-switcher" @click.stop>
    <button class="rs-current" :title="currentName" @click="open = !open">
      <span class="rs-name">{{ currentName }}</span>
      <span class="rs-caret">▾</span>
    </button>

    <div v-if="open" class="rs-menu">
      <div class="rs-list">
        <div
          v-for="r in resumes"
          :key="r.id"
          class="rs-item"
          :class="{ active: r.id === currentId }"
          @click="onSwitch(r.id)"
        >
          <span class="rs-item-name">{{ r.name }}</span>
          <span class="rs-item-actions" @click.stop>
            <button class="rs-mini" title="重命名" @click="onRename(r.id, r.name)">改名</button>
            <button class="rs-mini rs-del" title="删除" @click="onDelete(r.id, r.name)">删除</button>
          </span>
        </div>
      </div>
      <div class="rs-footer">
        <button class="rs-action" @click="onCreate">+ 新建简历</button>
        <button class="rs-action" @click="onDuplicate">复制当前</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resume-switcher {
  position: relative;
}
.rs-current {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 180px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.rs-current:hover {
  background: rgba(255, 255, 255, 0.16);
}
.rs-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rs-caret {
  font-size: 10px;
  opacity: 0.8;
}
.rs-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  width: 248px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  z-index: 1000;
}
.rs-list {
  max-height: 320px;
  overflow: auto;
  padding: 4px;
}
.rs-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
}
.rs-item:hover {
  background: #f3f4f6;
}
.rs-item.active {
  background: #eef2ff;
  color: #1d4ed8;
}
.rs-item-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rs-item-actions {
  display: flex;
  gap: 4px;
  flex: 0 0 auto;
}
.rs-mini {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}
.rs-mini:hover {
  background: #e5e7eb;
  color: #111827;
}
.rs-del:hover {
  background: #fee2e2;
  color: #b91c1c;
}
.rs-footer {
  display: flex;
  border-top: 1px solid #eef0f3;
}
.rs-action {
  flex: 1;
  padding: 10px;
  border: none;
  background: #fff;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
}
.rs-action:hover {
  background: #f3f4f6;
}
.rs-action + .rs-action {
  border-left: 1px solid #eef0f3;
}
</style>
