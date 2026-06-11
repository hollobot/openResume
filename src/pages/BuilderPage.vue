<template>
  <div v-if="ready" class="bp">
    <BuilderHeader />

    <!-- 三栏：左编辑 / 中画布 / 右样式（splitpanes 可拖拽调宽） -->
    <Splitpanes class="bp-panes" @resized="onResized">
      <Pane :size="builderLayout.leftSize" :min-size="16" :max-size="40">
        <LeftSidebar />
      </Pane>

      <Pane :size="100 - builderLayout.leftSize - builderLayout.rightSize">
        <BuilderArtboard />
      </Pane>

      <Pane :size="builderLayout.rightSize" :min-size="16" :max-size="40">
        <!-- 右栏样式系统在阶段 2 接入 -->
        <div class="bp-right-placeholder">
          <i class="ph ph-paint-brush-broad" />
          <p>样式面板</p>
          <p class="bp-right-tip">模板 / 布局 / 字体 / 颜色 / 页面（阶段 2）</p>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<script setup>
/**
 * builder 页面：加载草稿 + 三栏布局（比例持久化到 rr.builder.layout）
 */
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { loadDraft, unloadDraft } from '../stores/builder.js'
import { builderLayout } from '../stores/viewport.js'
import BuilderHeader from '../components/builder/BuilderHeader.vue'
import LeftSidebar from '../components/builder/left/LeftSidebar.vue'
import BuilderArtboard from '../components/builder/BuilderArtboard.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const ready = ref(false)

// 加载草稿；id 不存在则回仪表盘
if (loadDraft(props.id)) {
  ready.value = true
} else {
  router.replace('/')
}

onBeforeUnmount(unloadDraft)

// 三栏比例持久化
function onResized(panes) {
  if (panes.length === 3) {
    builderLayout.leftSize = panes[0].size
    builderLayout.rightSize = panes[2].size
  }
}
</script>

<style scoped>
.bp {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bp-panes { flex: 1; min-height: 0; }

.bp-right-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #0f0f1e;
  color: #475569;
  font-size: 13px;
}

.bp-right-placeholder i { font-size: 28px; }

.bp-right-tip { font-size: 11px; color: #334155; }
</style>

<style>
/* splitpanes 分隔条深色主题（全局覆盖默认样式） */
.bp-panes.splitpanes--vertical > .splitpanes__splitter {
  width: 4px;
  background: #1c1c38;
  border-left: none;
  transition: background 0.15s;
}

.bp-panes.splitpanes--vertical > .splitpanes__splitter:hover {
  background: #6366f1;
}
</style>
