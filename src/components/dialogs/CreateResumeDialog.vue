<template>
  <ModalDialog
    :open="dialog.open && dialog.type === 'resume-create'"
    title="新建简历"
    width="420px"
    @close="closeDialog"
  >
    <div class="crd">
      <TextInput v-model="name" label="简历名称" placeholder="如：Java 后端开发" />
      <SwitchInput v-model="withSample" label="使用示例数据（推荐首次使用）" />
    </div>

    <template #footer>
      <Btn variant="outline" @click="closeDialog">取消</Btn>
      <Btn variant="primary" :disabled="!name.trim()" @click="create">创建</Btn>
    </template>
  </ModalDialog>
</template>

<script setup>
/**
 * 新建简历 dialog（对应 RR CreateResumeDialog：名称 + 示例数据开关）
 * 创建后直接进入 builder
 */
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { dialog, closeDialog } from '../../stores/dialog.js'
import { createResume } from '../../stores/resumes.js'
import ModalDialog from '../ui/ModalDialog.vue'
import TextInput from '../ui/TextInput.vue'
import SwitchInput from '../ui/SwitchInput.vue'
import Btn from '../ui/Btn.vue'

const router = useRouter()

const name = ref('')
const withSample = ref(false)

// 每次打开重置
watch(
  () => dialog.open && dialog.type === 'resume-create',
  (active) => {
    if (active) {
      name.value = ''
      withSample.value = false
    }
  },
)

function create() {
  const record = createResume(name.value.trim(), withSample.value)
  closeDialog()
  router.push(`/builder/${record.id}`)
}
</script>

<style scoped>
.crd {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
