/**
 * 页面度量与 CSS 变量注入（对应 RR shared/metrics.ts + 各模板的 StyleSheet 基础部分）
 *
 * react-pdf 的样式工厂在 HTML 中转化为：metadata → CSS 变量（pt 单位），
 * 共享语义类（artboard.css 的 rr-*）与模板私有样式都从变量取值。
 */

/**
 * rgba 字符串直接可用于 CSS，无需转换（RR 因 react-pdf 才转 hex）
 * @returns {object} 注入 .rr-page 的 style 对象
 */
export function pageVars(metadata) {
  const { page, design, typography } = metadata
  return {
    '--rr-primary': design.colors.primary,
    '--rr-text': design.colors.text,
    '--rr-bg': design.colors.background,
    '--rr-body-font': typography.body.fontFamily || 'var(--rr-default-font)',
    '--rr-body-size': `${typography.body.fontSize}pt`,
    '--rr-body-weight': typography.body.fontWeights[0] || '400',
    '--rr-bold-weight': typography.body.fontWeights.at(-1) || '600',
    '--rr-body-lh': typography.body.lineHeight,
    '--rr-heading-font': typography.heading.fontFamily || 'var(--rr-default-font)',
    '--rr-heading-size': `${typography.heading.fontSize}pt`,
    '--rr-heading-weight': typography.heading.fontWeights.at(-1) || '600',
    '--rr-heading-lh': typography.heading.lineHeight,
    '--rr-margin-x': `${page.marginX}pt`,
    '--rr-margin-y': `${page.marginY}pt`,
    '--rr-gap-x': `${page.gapX}pt`,
    '--rr-gap-y': `${page.gapY}pt`,
    // 派生量（对齐 RR metrics：sectionGap=marginY）
    '--rr-section-gap': `${page.marginY}pt`,
  }
}

/**
 * 页面级修饰 class（格式 / 选项开关）
 */
export function pageClasses(metadata) {
  const { page } = metadata
  return [
    `rr-fmt-${page.format}`,
    page.hideIcons ? 'rr-hide-icons' : '',
    page.hideLinkUnderline ? 'rr-hide-underline' : '',
  ].filter(Boolean)
}
