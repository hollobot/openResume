<template>
  <div
    ref="containerRef"
    class="artboard"
    :class="{ grabbing: vp.state.dragging }"
    @wheel="vp.onWheel"
    @mousedown.self="vp.onMouseDown"
  >
    <!-- 缩放/平移内容层 -->
    <div ref="contentRef" class="artboard-content" :style="vp.transformStyle.value" @mousedown="vp.onMouseDown">
      <!-- 多页：layout.pages 每项渲染一张页面 -->
      <div v-for="(page, i) in pages" :key="i" class="artboard-page">
        <component :is="templateComp" :page="page" :page-index="i" />
        <div class="artboard-page-num">第 {{ i + 1 }} 页</div>
      </div>
    </div>

    <!-- 底部悬浮 dock -->
    <BuilderDock
      :scale="vp.state.scale"
      @zoom-in="vp.zoomBy(1.25)"
      @zoom-out="vp.zoomBy(0.8)"
      @center="vp.center"
    />
  </div>
</template>

<script setup>
/**
 * 中间画布：渲染多页简历 + 缩放平移 + dock
 * provideResumeData 在此注入，模板树内通过 useResumeData 消费
 */
import { ref, computed } from 'vue'
import { draft } from '../../stores/builder.js'
import { provideResumeData } from '../../templates/shared/context.js'
import { getTemplateComponent } from '../../templates/index.js'
import { useArtboardViewport } from '../../composables/useArtboardViewport.js'
import BuilderDock from './BuilderDock.vue'
import '../../styles/artboard.css'

const data = computed(() => draft.record?.data)
provideResumeData(data)

const pages = computed(() => data.value?.metadata.layout.pages || [])
const templateComp = computed(() => getTemplateComponent(data.value?.metadata.template))

const containerRef = ref(null)
const contentRef = ref(null)
const vp = useArtboardViewport(containerRef, contentRef)
</script>

<style scoped>
.artboard {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: #101020;
  /* 点状网格背景（对齐 RR 画布质感） */
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 22px 22px;
  cursor: grab;
}

.artboard.grabbing { cursor: grabbing; }

.artboard-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 36px;
  will-change: transform;
}

.artboard-page { position: relative; }

.artboard-page-num {
  position: absolute;
  top: -22px;
  left: 0;
  font-size: 11px;
  color: #64748b;
  user-select: none;
}
</style>
