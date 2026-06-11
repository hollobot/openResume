/**
 * 生成唯一 id（前端单机场景）
 * 优先用原生 crypto.randomUUID，与 RR 的 UUID 习惯一致
 */
export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  // 极老浏览器兜底
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
