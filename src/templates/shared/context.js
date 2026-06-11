/**
 * 模板渲染上下文（对应 RR 的 TemplateProvider / TemplatePlacementProvider）
 *
 * - provideResumeData / useResumeData：整份 ResumeData 注入模板树
 * - providePlacement / usePlacement：当前区块位于 main 还是 sidebar
 *   （部分模板在 sidebar 中切换前景色 / 堆叠条目头部）
 */

import { provide, inject } from 'vue'

const DATA_KEY = Symbol('rr-data')
const PLACEMENT_KEY = Symbol('rr-placement')

export function provideResumeData(dataRef) {
  provide(DATA_KEY, dataRef)
}

/** @returns {import('vue').ComputedRef|object} ResumeData（响应式） */
export function useResumeData() {
  return inject(DATA_KEY)
}

export function providePlacement(placement) {
  provide(PLACEMENT_KEY, placement)
}

/** @returns {string} 'main' | 'sidebar' */
export function usePlacement() {
  return inject(PLACEMENT_KEY, 'main')
}
