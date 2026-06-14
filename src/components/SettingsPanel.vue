<script setup>
/**
 * 设置侧边面板：从右侧滑出，调整简历预览的字体、行距，并支持自定义 CSS。
 * 设置项绑定到共享状态 settings，改动实时生效并自动持久化。
 *
 * 自定义 CSS 说明：内容会被自动限定在简历预览内（见 App.vue 的注入逻辑），
 * 因此直接写元素/类选择器即可，例如 `h2 { color:#c00 }`。
 */
import { ref } from 'vue'
import { useResume } from '../composables/useResume.js'
import AvatarCropper from './AvatarCropper.vue'
import { AVATAR_SHAPES } from '../utils/avatar.js'

// 证件照形状/比例选项
const AVATAR_SHAPE_OPTIONS = Object.entries(AVATAR_SHAPES).map(([value, g]) => ({
  value,
  label: g.label
}))

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const { settings, resetSettings, resetAvatarPos } = useResume()

const avatarInput = ref(null)
function triggerAvatar() {
  avatarInput.value && avatarInput.value.click()
}

// 裁剪弹窗：选好文件后弹出，让用户在固定比例窗口内拖动定位
const cropperOpen = ref(false)
const cropperSrc = ref('')

function onAvatarChange(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = '' // 允许重复选择同一文件
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    cropperSrc.value = String(reader.result) // 原图，交给裁剪弹窗
    cropperOpen.value = true
  }
  reader.readAsDataURL(file)
}
// 裁剪确认：保存高分辨率裁剪结果（92:122 比例，导出清晰不变形）
function onCropConfirm(dataUrl) {
  settings.avatar = dataUrl
  cropperOpen.value = false
  cropperSrc.value = ''
}
function onCropCancel() {
  cropperOpen.value = false
  cropperSrc.value = ''
}
function clearAvatar() {
  settings.avatar = ''
}

// 可选字体：值为 CSS font-family，标签为展示名
const FONT_OPTIONS = [
  { label: '模板默认', value: '' },
  { label: '苹方风格（思源黑体）', value: '"Noto Sans SC", sans-serif' },
  { label: '微软雅黑', value: '"Microsoft YaHei", sans-serif' },
  { label: '宋体', value: 'SimSun, "Songti SC", serif' },
  { label: '黑体', value: 'SimHei, "Heiti SC", sans-serif' },
  { label: '楷体', value: 'KaiTi, "Kaiti SC", serif' },
  { label: '思源黑体 / 系统无衬线', value: '"Source Han Sans SC", system-ui, sans-serif' }
]

// 简历模板
const TEMPLATE_OPTIONS = [
  { label: '经典黑白', value: 'default' },
  { label: '蓝色商务', value: 'blue' },
  { label: '紧凑（省空间）', value: 'compact' }
]
</script>

<template>
  <!-- 遮罩层：点击关闭 -->
  <transition name="fade">
    <div v-if="open" class="settings-overlay" @click="emit('close')"></div>
  </transition>

  <!-- 抽屉面板 -->
  <transition name="slide">
    <aside v-if="open" class="settings-panel">
      <header class="settings-header">
        <span>样式设置</span>
        <button class="close-btn" @click="emit('close')" aria-label="关闭">×</button>
      </header>

      <div class="settings-body">
        <!-- 证件照 -->
        <div class="field">
          <label class="field-label">证件照</label>
          <div class="avatar-row">
            <img v-if="settings.avatar" :src="settings.avatar" class="avatar-preview" alt="证件照" />
            <div v-else class="avatar-empty">未上传</div>
            <div class="avatar-actions">
              <button class="mini-btn" @click="triggerAvatar">上传</button>
              <button v-if="settings.avatar" class="mini-btn" @click="resetAvatarPos">
                重置位置
              </button>
              <button v-if="settings.avatar" class="mini-btn" @click="clearAvatar">
                清除
              </button>
            </div>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onAvatarChange"
          />
          <p class="field-hint">上传后弹出裁剪窗口拖动定位；在右侧预览中点击照片选中后，可拖动移动、拖四角等比缩放，导出 PNG / PDF 会一并贴上</p>
        </div>

        <!-- 证件照裁剪弹窗 -->
        <AvatarCropper
          :open="cropperOpen"
          :src="cropperSrc"
          @confirm="onCropConfirm"
          @cancel="onCropCancel"
        />

        <!-- 证件照样式：形状/比例 + 描边 -->
        <div class="field">
          <label class="field-label">证件照样式</label>
          <select v-model="settings.avatarShape" class="field-control">
            <option v-for="o in AVATAR_SHAPE_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <label class="field-label" style="margin-top: 10px">
            描边：{{ settings.avatarBorderWidth }}px
          </label>
          <div class="border-row">
            <input
              v-model.number="settings.avatarBorderWidth"
              type="range"
              min="0"
              max="8"
              step="1"
              class="field-control"
            />
            <input
              type="color"
              class="border-color"
              title="描边颜色"
              :value="settings.avatarBorderColor"
              @input="settings.avatarBorderColor = $event.target.value"
            />
          </div>
          <p class="field-hint">形状/比例改变后，建议重新上传以获得最佳构图</p>
        </div>

        <!-- 模板 -->
        <div class="field">
          <label class="field-label">模板</label>
          <select v-model="settings.template" class="field-control">
            <option v-for="t in TEMPLATE_OPTIONS" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>

        <!-- 字体 -->
        <div class="field">
          <label class="field-label">字体</label>
          <select v-model="settings.fontFamily" class="field-control">
            <option v-for="f in FONT_OPTIONS" :key="f.label" :value="f.value">
              {{ f.label }}
            </option>
          </select>
        </div>

        <!-- 行距 -->
        <div class="field">
          <label class="field-label">行距：{{ settings.lineHeight.toFixed(2) }}</label>
          <input
            v-model.number="settings.lineHeight"
            type="range"
            min="1.2"
            max="2.4"
            step="0.05"
            class="field-control"
          />
        </div>

        <!-- 页边距·上下 -->
        <div class="field">
          <label class="field-label">页边距·上下：{{ settings.pagePadV }}px</label>
          <input
            v-model.number="settings.pagePadV"
            type="range"
            min="16"
            max="96"
            step="2"
            class="field-control"
          />
        </div>

        <!-- 页边距·左右 -->
        <div class="field">
          <label class="field-label">页边距·左右：{{ settings.pagePadH }}px</label>
          <input
            v-model.number="settings.pagePadH"
            type="range"
            min="16"
            max="96"
            step="2"
            class="field-control"
          />
        </div>

        <!-- 显示选项 -->
        <div class="field">
          <label class="field-label">显示选项</label>
          <label class="check-row">
            <input type="checkbox" v-model="settings.themeColorExtended" />
            <span>主题色也用于姓名 / 圆点 / 图标 / 链接</span>
          </label>
          <label class="check-row">
            <input type="checkbox" v-model="settings.linkUnderline" />
            <span>链接显示下划线</span>
          </label>
        </div>

        <!-- 自定义 CSS -->
        <div class="field">
          <label class="field-label">自定义 CSS（作用于简历预览）</label>
          <textarea
            v-model="settings.customCss"
            class="field-control css-editor"
            spellcheck="false"
            placeholder="例如：&#10;h2 { color: #c0392b; }&#10;p { letter-spacing: 0.5px; }"
          ></textarea>
        </div>

        <button class="reset-btn" @click="resetSettings">恢复默认设置</button>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1500;
}
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 340px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 16px rgba(0, 0, 0, 0.12);
  z-index: 1600;
  display: flex;
  flex-direction: column;
}
.settings-header {
  flex: 0 0 52px;
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
.settings-body {
  flex: 1;
  overflow: auto;
  padding: 18px;
}
.field {
  margin-bottom: 20px;
}
.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.field-control {
  width: 100%;
  box-sizing: border-box;
}
select.field-control {
  height: 34px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}
.css-editor {
  height: 180px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  resize: vertical;
}
/* 证件照上传 */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-preview,
.avatar-empty {
  width: 60px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
  flex: 0 0 auto;
}
.avatar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #9aa0a6;
  background: #f7f8fa;
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mini-btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.mini-btn:hover {
  background: #f3f4f6;
}
/* 证件照描边行 */
.border-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.border-color {
  width: 36px;
  height: 28px;
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
/* 复选项 */
.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.check-row input {
  cursor: pointer;
}
.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9aa0a6;
}
.field-hint code {
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11.5px;
}

.reset-btn {
  width: 100%;
  height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}
.reset-btn:hover {
  background: #f3f4f6;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
