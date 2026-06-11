/**
 * builder 界面布局状态（三栏比例 / 折叠态），持久化到 localStorage
 * （对应 RR 用 cookie 存 BUILDER_LAYOUT 的做法）
 */

import { reactive, watch } from 'vue'

const KEY = 'rr.builder.layout'

const DEFAULTS = {
  leftSize: 22, // 左栏宽度（百分比）
  rightSize: 22, // 右栏宽度（百分比）
  leftCollapsed: false,
  rightCollapsed: false,
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export const builderLayout = reactive(load())

watch(builderLayout, (val) => {
  localStorage.setItem(KEY, JSON.stringify(val))
})
