/**
 * 多简历 store（模块级单例）
 *
 * localStorage 设计：
 *   rr.resumes.index   轻量索引数组（dashboard 渲染列表无需解析全部简历）
 *   rr.resume.<id>     单份完整简历记录（独立 key，写入互不影响）
 *
 * 首次初始化时执行旧版单简历数据迁移（schema/migrate.js）。
 */

import { reactive } from 'vue'
import { createResumeRecord, createSampleResumeData, normalizeResumeData, uid } from '../schema/index.js'
import { migrateLegacyResume } from '../schema/migrate.js'

const INDEX_KEY = 'rr.resumes.index'
const RECORD_PREFIX = 'rr.resume.'

// ── 索引状态 ─────────────────────────────────────────────────

export const resumesIndex = reactive([])

function persistIndex() {
  localStorage.setItem(INDEX_KEY, JSON.stringify(resumesIndex))
}

/**
 * 从完整记录提取索引条目
 */
function toIndexEntry(record) {
  return {
    id: record.id,
    name: record.name,
    isLocked: record.isLocked,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    template: record.data.metadata.template,
  }
}

// ── 记录读写 ─────────────────────────────────────────────────

/**
 * 读取一份完整简历记录（含数据规范化兜底）
 */
export function getResumeRecord(id) {
  const raw = localStorage.getItem(RECORD_PREFIX + id)
  if (!raw) return null
  try {
    const record = JSON.parse(raw)
    record.data = normalizeResumeData(record.data)
    return record
  } catch {
    return null
  }
}

/**
 * 持久化记录并同步索引条目（更新 updatedAt）
 */
export function persistResumeRecord(record) {
  record.updatedAt = Date.now()
  localStorage.setItem(RECORD_PREFIX + record.id, JSON.stringify(record))
  const idx = resumesIndex.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    resumesIndex[idx] = toIndexEntry(record)
  } else {
    resumesIndex.push(toIndexEntry(record))
  }
  persistIndex()
}

// ── CRUD 操作 ────────────────────────────────────────────────

/**
 * 新建简历
 * @param {string} name
 * @param {boolean} withSample - 是否填充示例数据
 */
export function createResume(name, withSample = false) {
  const record = createResumeRecord(name, withSample ? createSampleResumeData() : null)
  persistResumeRecord(record)
  return record
}

export function renameResume(id, name) {
  const record = getResumeRecord(id)
  if (!record) return
  record.name = name
  persistResumeRecord(record)
}

/**
 * 复制简历（深拷贝 + 新 id + 名称加「副本」）
 */
export function duplicateResume(id) {
  const record = getResumeRecord(id)
  if (!record) return null
  const copy = {
    ...structuredClone(record),
    id: uid(),
    name: `${record.name}（副本）`,
    isLocked: false,
    createdAt: Date.now(),
  }
  persistResumeRecord(copy)
  return copy
}

export function deleteResume(id) {
  localStorage.removeItem(RECORD_PREFIX + id)
  const idx = resumesIndex.findIndex((r) => r.id === id)
  if (idx >= 0) resumesIndex.splice(idx, 1)
  persistIndex()
}

export function setResumeLocked(id, locked) {
  const record = getResumeRecord(id)
  if (!record) return
  record.isLocked = locked
  persistResumeRecord(record)
}

/**
 * 从 JSON 文本导入（兼容 RR 官方导出格式与本应用导出格式）
 * @returns {object|null} 新建的记录；解析失败返回 null
 */
export function importResumeFromJSON(text, name = '导入的简历') {
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') return null
    // 兼容两种形状：完整记录 { name, data } 或裸 ResumeData { basics, sections, ... }
    const data = parsed.data && parsed.basics === undefined ? parsed.data : parsed
    const record = createResumeRecord(parsed.name || name, data)
    persistResumeRecord(record)
    return record
  } catch {
    return null
  }
}

// ── 初始化 ───────────────────────────────────────────────────

/**
 * 应用启动时调用：载入索引；首次运行时执行旧数据迁移
 */
export function initResumesStore() {
  const raw = localStorage.getItem(INDEX_KEY)
  if (raw) {
    try {
      const list = JSON.parse(raw)
      resumesIndex.splice(0, resumesIndex.length, ...list)
      return
    } catch {
      /* 索引损坏则重建 */
    }
  }
  // 首次运行：尝试迁移旧版单简历
  const migrated = migrateLegacyResume()
  if (migrated) {
    persistResumeRecord(migrated)
    localStorage.setItem('cv-resume-data.migrated', '1')
  }
}
