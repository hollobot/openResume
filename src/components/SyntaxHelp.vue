<script setup>
/**
 * 语法速查面板：列出本编辑器支持的 Markdown 与简历专属自定义语法及示例。
 * 纯展示，点击遮罩或关闭按钮收起。
 */
defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

// 语法条目：name 名称 / code 写法 / desc 说明
const ITEMS = [
  { name: '标题', code: '## 区块标题', desc: '二级标题，带底部分隔线（区块）；# 为姓名，### 为小标题' },
  { name: '加粗', code: '**重点**', desc: '加粗，常用于公司/学校/项目名' },
  { name: '列表', code: '- 列表项', desc: '无序列表，自动小圆点' },
  { name: '链接', code: '[文字](https://网址)', desc: '链接；纯网址/邮箱也会自动识别' },
  { name: '技能标签', code: '`Spring Boot`', desc: '反引号包裹，渲染为胶囊标签，适合罗列技术栈' },
  { name: '右对齐日期', code: '@r{2025.01 - 至今}', desc: '把内容浮到行末右侧，常用于条目右侧的时间/地点' },
  { name: '图标', code: 'icon:phone / icon:email', desc: '行内图标（Tabler）；也可用工具栏「图标」搜索插入' },
  { name: '居中', code: '## 标题 {.center}', desc: '给元素加 .center 使其居中；还支持 .right / .muted' },
  { name: '分栏', code: ':::left ... :::\n:::right ... :::', desc: '左右分栏，常用于「左姓名+联系方式 / 右照片」的头部' },
  { name: '强制分页', code: '<div class="page-break"></div>', desc: '在此处强制换页，导出从这里另起一页；建议用工具栏「分页」按钮插入' }
]
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="help-overlay" @click="emit('close')">
      <div class="help-dialog" @click.stop>
        <header class="help-header">
          <span>语法速查</span>
          <button class="close-btn" @click="emit('close')" aria-label="关闭">×</button>
        </header>
        <div class="help-body">
          <div v-for="item in ITEMS" :key="item.name" class="help-row">
            <div class="help-name">{{ item.name }}</div>
            <pre class="help-code">{{ item.code }}</pre>
            <div class="help-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-dialog {
  width: 560px;
  max-width: calc(100vw - 32px);
  max-height: 80vh;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.help-header {
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid #eef0f3;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.close-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
}
.close-btn:hover {
  color: #111827;
}
.help-body {
  overflow: auto;
  padding: 8px 18px 16px;
}
.help-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 4px 12px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f4;
}
.help-row:last-child {
  border-bottom: none;
}
.help-name {
  grid-row: span 2;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  padding-top: 2px;
}
.help-code {
  margin: 0;
  padding: 6px 8px;
  background: #f6f8fa;
  border-radius: 5px;
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 12px;
  color: #b9216e;
  white-space: pre-wrap;
}
.help-desc {
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
