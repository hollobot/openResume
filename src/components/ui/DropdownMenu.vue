<template>
  <div ref="rootRef" class="dd">
    <!-- 触发器 -->
    <div class="dd-trigger" @click.stop="toggle">
      <slot name="trigger" />
    </div>

    <!-- 菜单面板 -->
    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="dd-menu"
        :style="menuStyle"
        @click="open = false"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * 轻量下拉菜单：Teleport 到 body 避免被滚动容器裁剪，
 * 点击外部 / 菜单项后自动关闭。
 * 菜单项用 .dd-item class（全局样式见下）。
 */
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  align: { type: String, default: 'end' }, // start | end（相对触发器水平对齐）
})

const rootRef = ref(null)
const menuRef = ref(null)
const open = ref(false)
const menuStyle = ref({})

async function toggle() {
  if (open.value) {
    open.value = false
    return
  }
  open.value = true
  await nextTick()
  position()
  document.addEventListener('click', onOutside, { capture: true })
}

function position() {
  const trigger = rootRef.value?.firstElementChild
  const menu = menuRef.value
  if (!trigger || !menu) return
  const r = trigger.getBoundingClientRect()
  const mw = menu.offsetWidth
  const mh = menu.offsetHeight
  let left = props.align === 'end' ? r.right - mw : r.left
  let top = r.bottom + 4
  // 视口边界保护
  left = Math.max(4, Math.min(left, window.innerWidth - mw - 4))
  if (top + mh > window.innerHeight - 4) top = r.top - mh - 4
  menuStyle.value = { left: `${left}px`, top: `${top}px` }
}

function onOutside(e) {
  if (menuRef.value?.contains(e.target)) return
  if (rootRef.value?.contains(e.target)) return
  open.value = false
}

// open 变化时清理监听
watch(open, (val) => {
  if (!val) document.removeEventListener('click', onOutside, { capture: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onOutside, { capture: true })
})
</script>

<style scoped>
.dd { display: inline-flex; }
.dd-trigger { display: inline-flex; }
</style>

<style>
/* 菜单面板与菜单项（非 scoped：Teleport 到 body + 供使用方写 .dd-item） */
.dd-menu {
  position: fixed;
  z-index: 1000;
  min-width: 150px;
  background: #1c1c38;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  background: transparent;
  border-radius: 5px;
  font-size: 12.5px;
  color: #cbd5e1;
  cursor: pointer;
  text-align: left;
}

.dd-item:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }

.dd-item.dd-danger { color: #f87171; }
.dd-item.dd-danger:hover { background: rgba(248, 113, 113, 0.12); }

.dd-sep {
  height: 1px;
  margin: 4px 6px;
  background: rgba(255, 255, 255, 0.08);
}
</style>
