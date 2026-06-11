/**
 * 模板组件注册表
 * 新模板：建 <name>/<Name>Page.vue（接收 { page, pageIndex } props，
 * 数据经 useResumeData 注入），在此登记并把 schema/templates.js 中
 * 对应条目的 implemented 置 true。
 */

import OnyxPage from './onyx/OnyxPage.vue'

const TEMPLATE_COMPONENTS = {
  onyx: OnyxPage,
}

/**
 * 按模板 id 取页面组件；未实现的模板回退 onyx
 */
export function getTemplateComponent(id) {
  return TEMPLATE_COMPONENTS[id] || OnyxPage
}
