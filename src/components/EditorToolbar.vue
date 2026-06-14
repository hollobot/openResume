<script setup>
/**
 * 编辑器插入工具栏：把常用 Markdown / 简历自定义语法做成按钮，点击即在光标处插入或包裹选区。
 * - 格式按钮：加粗 / 标题 / 列表 / 链接 / 右对齐日期 / 技能标签。
 * - 「插入区块」下拉：一键插入教育/工作/项目/技能等区块骨架。
 * - 「语法」按钮：打开语法速查面板（SyntaxHelp）。
 * 复用 useResume 的 insertAtCursor / wrapSelection。
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useResume } from '../composables/useResume.js'
import SyntaxHelp from './SyntaxHelp.vue'

const { insertAtCursor, wrapSelection } = useResume()

// 预置区块骨架（一键插入）
const SECTIONS = [
  {
    label: '教育经历',
    text: '\n## 教育经历\n\n**学校名称** · 专业（学历） @r{2020.09 - 2024.06}\n\n主修课程：数据结构、操作系统、计算机网络。\n'
  },
  {
    label: '工作经历',
    text: '\n## 工作经历\n\n**公司名称** · 职位 @r{2023.07 - 至今}\n\n- 负责模块的设计与开发。\n- 完成了具体的业务/优化成果。\n'
  },
  {
    label: '项目经历',
    text: '\n## 项目经历\n\n**项目名称** @r{2024.01 - 2024.06}\n\n- 项目简介：一句话说明项目做什么。\n- 我的工作：负责的部分与成果。\n'
  },
  {
    label: '专业技能',
    text: '\n## 专业技能\n\n- **后端**：`Spring Boot` `MySQL` `Redis`\n- **前端**：`Vue3` `Vite` `TypeScript`\n'
  },
  {
    label: '自我评价',
    text: '\n## 自我评价\n\n- 一句话突出你的优势与特质。\n'
  },
  {
    label: '分栏头部（左姓名/右照片）',
    text: '\n:::left\n# 你的名字\n\nicon:phone 13800000000 &nbsp; icon:email you@example.com\n:::\n\n:::right\n![](图片地址)\n:::\n\n'
  }
]

// 格式按钮配置：title 提示 + 执行函数
const FORMATS = [
  { label: '加粗', title: '加粗 **文字**', run: () => wrapSelection('**', '**', '加粗文字') },
  { label: '标题', title: '区块标题 ## 标题', run: () => insertAtCursor('\n## 标题\n') },
  { label: '列表', title: '无序列表 - 项', run: () => insertAtCursor('\n- 列表项\n') },
  { label: '链接', title: '链接 [文字](网址)', run: () => wrapSelection('[', '](https://)', '链接文字') },
  { label: '日期(右)', title: '右对齐日期 @r{...}', run: () => insertAtCursor('@r{2025.01 - 至今}') },
  { label: '技能标签', title: '技能胶囊 `技能`', run: () => wrapSelection('`', '`', '技能') },
  { label: '分页', title: '在此强制换页（导出会从这里另起一页）', run: () => insertAtCursor('\n\n<div class="page-break"></div>\n\n') }
]

// 区块下拉开关
const sectionOpen = ref(false)
function insertSection(text) {
  insertAtCursor(text)
  sectionOpen.value = false
}
function closeSection() {
  sectionOpen.value = false
}
onMounted(() => document.addEventListener('click', closeSection))
onUnmounted(() => document.removeEventListener('click', closeSection))

// 语法助手开关
const helpOpen = ref(false)
</script>

<template>
  <div class="editor-toolbar">
    <button
      v-for="f in FORMATS"
      :key="f.label"
      class="tb-btn"
      :title="f.title"
      @click="f.run"
    >
      {{ f.label }}
    </button>

    <!-- 插入区块下拉 -->
    <div class="tb-dropdown" @click.stop>
      <button class="tb-btn" @click="sectionOpen = !sectionOpen">插入区块 ▾</button>
      <div v-if="sectionOpen" class="tb-menu">
        <button
          v-for="s in SECTIONS"
          :key="s.label"
          class="tb-menu-item"
          @click="insertSection(s.text)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <span class="tb-spacer"></span>
    <button class="tb-btn tb-help" title="查看支持的语法" @click="helpOpen = true">语法 ?</button>

    <SyntaxHelp :open="helpOpen" @close="helpOpen = false" />
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  background: #fafbfc;
  border-bottom: 1px solid #eef0f3;
}
.tb-btn {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #d8dce2;
  border-radius: 5px;
  background: #fff;
  color: #374151;
  font-size: 12.5px;
  cursor: pointer;
  white-space: nowrap;
}
.tb-btn:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
}
.tb-spacer {
  flex: 1;
}
.tb-help {
  color: #2563eb;
}
/* 插入区块下拉 */
.tb-dropdown {
  position: relative;
  display: inline-block;
}
.tb-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 180px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  z-index: 100;
}
.tb-menu-item {
  display: block;
  width: 100%;
  padding: 9px 12px;
  border: none;
  background: #fff;
  color: #374151;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.tb-menu-item:hover {
  background: #f3f4f6;
}
</style>
