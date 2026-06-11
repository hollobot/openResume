<template>
  <SectionBase
    anchor-id="picture"
    title="头像"
    icon="image"
    :hidden="picture.hidden"
    :columns-enabled="false"
    :menu="false"
  >
    <template #actions>
      <button
        class="ps-eye"
        :title="picture.hidden ? '显示头像' : '隐藏头像'"
        @click.stop="picture.hidden = !picture.hidden"
      >
        <i :class="picture.hidden ? 'ph ph-eye-slash' : 'ph ph-eye'" />
      </button>
    </template>

    <div class="ps-top">
      <!-- 预览/上传 -->
      <label class="ps-preview" :title="picture.url ? '点击更换图片' : '点击上传图片'">
        <input type="file" accept="image/*" class="ps-file" @change="onUpload" />
        <img v-if="picture.url" :src="picture.url" alt="" />
        <i v-else class="ph ph-upload-simple" />
      </label>

      <div class="ps-url">
        <TextInput v-model="picture.url" label="图片地址" placeholder="https:// 或上传转 base64" />
        <button v-if="picture.url" class="ps-clear" @click="picture.url = ''">
          <i class="ph ph-trash" /> 移除图片
        </button>
      </div>
    </div>

    <!-- 几何参数 -->
    <div class="ps-grid">
      <SliderInput v-model="picture.size" label="尺寸 (pt)" :min="32" :max="512" />
      <SliderInput v-model="picture.rotation" label="旋转 (°)" :min="0" :max="360" />
      <SliderInput v-model="picture.aspectRatio" label="宽高比" :min="0.5" :max="2.5" :step="0.05" />
      <SliderInput v-model="picture.borderRadius" label="圆角 (pt)" :min="0" :max="100" />
      <SliderInput v-model="picture.borderWidth" label="边框宽 (pt)" :min="0" :max="12" :step="0.5" />
      <SliderInput v-model="picture.shadowWidth" label="阴影宽 (pt)" :min="0" :max="24" :step="0.5" />
    </div>

    <!-- 宽高比快捷预设（对齐 RR） -->
    <div class="ps-ratios">
      <span class="ps-ratios-label">快捷比例</span>
      <button class="ps-ratio" @click="picture.aspectRatio = 1">1:1</button>
      <button class="ps-ratio" @click="picture.aspectRatio = 1.5">3:2</button>
      <button class="ps-ratio" @click="picture.aspectRatio = 0.75">3:4</button>
    </div>

    <div class="ps-colors">
      <ColorInput v-model="picture.borderColor" label="边框色" />
      <ColorInput v-model="picture.shadowColor" label="阴影色" />
    </div>
  </SectionBase>
</template>

<script setup>
/**
 * 头像编辑（对应 RR sections/picture.tsx，覆盖 picture 全部 10 字段）
 * 上传图片转 base64 存入 url（纯前端无后端的存储方式）
 */
import { computed } from 'vue'
import { draft } from '../../../stores/builder.js'
import SectionBase from './SectionBase.vue'
import TextInput from '../../ui/TextInput.vue'
import SliderInput from '../../ui/SliderInput.vue'
import ColorInput from '../../ui/ColorInput.vue'

const picture = computed(() => draft.record.data.picture)

function onUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => {
    picture.value.url = evt.target.result // base64 data URL
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
</script>

<style scoped>
.ps-eye {
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
}

.ps-eye:hover { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }

.ps-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.ps-preview {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #15152c;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  color: #64748b;
  font-size: 20px;
}

.ps-preview:hover { border-color: #6366f1; }

.ps-preview img { width: 100%; height: 100%; object-fit: cover; }

.ps-file { display: none; }

.ps-url { flex: 1; display: flex; flex-direction: column; gap: 6px; }

.ps-clear {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #f87171;
  font-size: 11.5px;
  cursor: pointer;
  padding: 0;
}

.ps-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  margin-bottom: 10px;
}

.ps-ratios {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.ps-ratios-label { font-size: 12px; color: #94a3b8; }

.ps-ratio {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  border-radius: 5px;
  color: #cbd5e1;
  font-size: 11px;
  padding: 3px 9px;
  cursor: pointer;
}

.ps-ratio:hover { border-color: #6366f1; color: #fff; }

.ps-colors { display: flex; flex-direction: column; gap: 10px; }
</style>
