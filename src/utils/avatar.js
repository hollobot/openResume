/**
 * 证件照形状/比例预设（共享给预览、裁剪、HTML 导出）。
 * w:h 为宽高比；round 为是否圆形（圆形按 1:1 输出，显示时圆角 50%）。
 */
export const AVATAR_SHAPES = {
  '3:4': { w: 3, h: 4, round: false, label: '竖版 3:4' },
  '2:3': { w: 2, h: 3, round: false, label: '竖版 2:3' },
  '1:1': { w: 1, h: 1, round: false, label: '方形 1:1' },
  circle: { w: 1, h: 1, round: true, label: '圆形' }
}

// 取形状几何；未知值回退 3:4
export function avatarGeom(shape) {
  return AVATAR_SHAPES[shape] || AVATAR_SHAPES['3:4']
}

// 证件照在简历上的基准显示宽度（px）；实际尺寸 = 基准 × 缩放系数
export const AVATAR_BASE_W = 90
