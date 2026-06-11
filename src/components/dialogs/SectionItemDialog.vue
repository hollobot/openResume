<template>
  <ModalDialog
    :open="dialog.open && dialog.type === 'section-item'"
    :title="dialogTitle"
    width="620px"
    @close="closeDialog"
  >
    <div v-if="form" class="sid-fields">
      <template v-for="f in def.fields" :key="f.key">
        <!-- 单行文本 -->
        <TextInput
          v-if="f.type === 'text'"
          v-model="form[f.key]"
          :label="f.label + (f.required ? ' *' : '')"
          :placeholder="f.placeholder || ''"
        />

        <!-- 富文本 -->
        <RichTextEditor v-else-if="f.type === 'rich'" v-model="form[f.key]" :label="f.label" />

        <!-- 链接对象 -->
        <div v-else-if="f.type === 'website'" class="sid-website">
          <TextInput v-model="form[f.key].url" :label="f.label" placeholder="https://" />
          <TextInput v-model="form[f.key].label" label="显示文本" placeholder="可选" />
          <SwitchInput v-model="form[f.key].inlineLink" label="标题内嵌链接" />
        </div>

        <!-- 标签数组 -->
        <TextInput
          v-else-if="f.type === 'tags'"
          :model-value="(form[f.key] || []).join(', ')"
          :label="f.label"
          placeholder="用逗号分隔"
          @update:model-value="form[f.key] = splitTags($event)"
        />

        <!-- 等级 0-5 -->
        <SliderInput
          v-else-if="f.type === 'level'"
          v-model="form[f.key]"
          :label="`${f.label}（0 = 不显示）`"
          :min="0"
          :max="5"
        />

        <!-- 图标 + 颜色 -->
        <div v-else-if="f.type === 'icon'" class="sid-icon-row">
          <IconPicker v-model="form[f.key]" :label="f.label" />
          <ColorInput v-if="form[f.key]" v-model="form.iconColor" label="图标颜色（留空用模板默认）" />
        </div>

        <!-- experience 细分角色子列表 -->
        <div v-else-if="f.type === 'roles'" class="sid-roles">
          <div class="sid-roles-head">
            <span>{{ f.label }}（用于一家公司多个职位的晋升经历，可留空）</span>
            <Btn size="sm" variant="outline" @click="form.roles.push(blankRole())">＋ 添加角色</Btn>
          </div>
          <div v-for="(role, ri) in form.roles" :key="role.id" class="sid-role">
            <div class="sid-role-row">
              <TextInput v-model="role.position" label="职位" />
              <TextInput v-model="role.period" label="时间" />
              <button class="sid-role-del" title="删除角色" @click="form.roles.splice(ri, 1)">
                <i class="ph ph-trash" />
              </button>
            </div>
            <RichTextEditor v-model="role.description" label="角色描述" />
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <Btn variant="outline" @click="closeDialog">取消</Btn>
      <Btn variant="primary" :disabled="!valid" @click="save">{{ isEdit ? '保存' : '创建' }}</Btn>
    </template>
  </ModalDialog>
</template>

<script setup>
/**
 * 通用条目创建/编辑 dialog（对应 RR dialogs/resume/sections/*，14 类共用）
 *
 * 由 SECTION_DEFS[type].fields 驱动表单渲染；
 * 编辑的是条目副本，点保存才写回 store（取消不污染数据）。
 * payload: { type, sectionKey, customSectionId?, item? }
 */
import { ref, computed, watch, toRaw } from 'vue'
import { dialog, closeDialog } from '../../stores/dialog.js'
import { draft } from '../../stores/builder.js'
import { SECTION_DEFS, blankItem, blankRole } from '../../schema/index.js'
import ModalDialog from '../ui/ModalDialog.vue'
import TextInput from '../ui/TextInput.vue'
import RichTextEditor from '../ui/RichTextEditor.vue'
import SwitchInput from '../ui/SwitchInput.vue'
import SliderInput from '../ui/SliderInput.vue'
import IconPicker from '../ui/IconPicker.vue'
import ColorInput from '../ui/ColorInput.vue'
import Btn from '../ui/Btn.vue'

const form = ref(null)

const payload = computed(() => dialog.payload || {})
const def = computed(() => SECTION_DEFS[payload.value.type] || { fields: [], label: '' })
const isEdit = computed(() => Boolean(payload.value.item))
const dialogTitle = computed(() => `${isEdit.value ? '编辑' : '添加'}${def.value.label}`)

// 必填字段校验
const valid = computed(() => {
  if (!form.value) return false
  return def.value.fields.every((f) => !f.required || String(form.value[f.key] || '').trim())
})

// dialog 打开时初始化表单副本
watch(
  () => dialog.open && dialog.type === 'section-item',
  (active) => {
    if (!active) return
    const { type, item } = payload.value
    form.value = item ? structuredClone(toRaw(item)) : blankItem(type)
  },
)

/**
 * 目标条目数组（标准区块；customSectionId 支持在阶段 5 接入）
 */
function targetItems() {
  const { sectionKey, customSectionId } = payload.value
  if (customSectionId) {
    return draft.record.data.customSections.find((s) => s.id === customSectionId)?.items
  }
  return draft.record.data.sections[sectionKey]?.items
}

function splitTags(text) {
  return text
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function save() {
  const items = targetItems()
  if (!items) return
  if (isEdit.value) {
    const idx = items.findIndex((it) => it.id === form.value.id)
    if (idx >= 0) items[idx] = form.value
  } else {
    items.push(form.value)
  }
  closeDialog()
}
</script>

<style scoped>
.sid-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sid-website {
  display: grid;
  grid-template-columns: 1.5fr 1fr auto;
  gap: 10px;
  align-items: end;
}

.sid-icon-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sid-roles {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding-top: 12px;
}

.sid-roles-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.sid-role {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sid-role-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: end;
}

.sid-role-del {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 7px;
}

.sid-role-del:hover { color: #f87171; }
</style>
