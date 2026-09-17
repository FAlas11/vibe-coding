import type { Expense, Settings } from './types.ts'
import { EXPENSES_KEY, SCHEMA_VERSION, SETTINGS_KEY } from './types.ts'

/**
 * 所有函数写成 async 是刻意的：将来数据超过 1.5MB / 10000 条，或要做多设备同步时，
 * 只需把本文件换成 IndexedDB 实现，调用方一行都不用改。见 CLAUDE.md 5.6。
 *
 * 本文件是唯一允许直接接触 localStorage 的地方。
 */

const DEFAULT_SETTINGS: Settings = { schemaVersion: SCHEMA_VERSION, lastBackupAt: null }

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export async function loadExpenses(): Promise<Expense[]> {
  const raw = readRaw(EXPENSES_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Expense[]) : []
  } catch {
    // 数据损坏时退回空列表，绝不能让整个 App 打不开
    console.error('账目数据解析失败，已按空列表处理')
    return []
  }
}

/** 写入失败（例如存储空间满）会抛错，由调用方提示用户，绝不静默失败 */
export async function saveExpenses(list: Expense[]): Promise<void> {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(list))
}

export async function loadSettings(): Promise<Settings> {
  const raw = readRaw(SETTINGS_KEY)
  if (!raw) return { ...DEFAULT_SETTINGS }
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

/** 估算已用体积，用于"数据快满了"的提醒 */
export async function estimateUsageBytes(): Promise<number> {
  return new Blob([readRaw(EXPENSES_KEY) ?? '']).size
}

export async function clearAll(): Promise<void> {
  localStorage.removeItem(EXPENSES_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
