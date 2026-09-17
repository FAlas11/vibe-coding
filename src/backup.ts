import { CATEGORIES } from './categories.ts'
import type { BackupFile, Expense } from './types.ts'
import { APP_ID, SCHEMA_VERSION } from './types.ts'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function buildBackup(expenses: Expense[]): BackupFile {
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    categories: CATEGORIES,
    expenses,
  }
}

export function backupFileName(dateStr: string): string {
  return `平面记账-备份-${dateStr}.json`
}

export type ValidationResult = { ok: true; value: BackupFile } | { ok: false; error: string }

function checkExpense(value: unknown, index: number): string | null {
  const at = `第 ${index + 1} 条`
  if (typeof value !== 'object' || value === null) return `${at}不是一条有效记录`
  const e = value as Record<string, unknown>
  if (typeof e.id !== 'string' || !e.id) return `${at}缺少编号`
  if (!Number.isInteger(e.amountCents)) return `${at}的金额不是整数分`
  if ((e.amountCents as number) <= 0) return `${at}的金额必须大于 0`
  if (typeof e.categoryId !== 'string' || !e.categoryId) return `${at}缺少一级分类`
  if (typeof e.subcategoryId !== 'string' || !e.subcategoryId) return `${at}缺少二级分类`
  if (typeof e.note !== 'string') return `${at}的备注格式不对`
  if (typeof e.date !== 'string' || !DATE_RE.test(e.date)) return `${at}的日期格式不是 YYYY-MM-DD`
  if (typeof e.createdAt !== 'string') return `${at}缺少录入时间`
  if (typeof e.updatedAt !== 'string') return `${at}缺少修改时间`
  return null
}

/**
 * 导入前的全量校验。任何一条不合格就整体拒绝，绝不半途写入 ——
 * 这是用户数据丢失时唯一的救命通道，不能马虎。
 */
export function validateBackup(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: '这不是一个备份文件' }
  }
  const b = input as Record<string, unknown>
  if (b.app !== APP_ID) return { ok: false, error: '这不是「平面记账」的备份文件' }
  if (!Number.isInteger(b.schemaVersion)) return { ok: false, error: '备份文件缺少版本号' }
  if ((b.schemaVersion as number) > SCHEMA_VERSION) {
    return { ok: false, error: '备份文件来自更新版本的 App，请先升级再导入' }
  }
  if (!Array.isArray(b.expenses)) return { ok: false, error: '备份文件里的账目不是一个列表' }
  for (let i = 0; i < b.expenses.length; i++) {
    const problem = checkExpense(b.expenses[i], i)
    if (problem) return { ok: false, error: problem }
  }
  return { ok: true, value: b as unknown as BackupFile }
}

/** 合并：以 id 为准，导入的记录覆盖同 id 的现有记录 */
export function mergeExpenses(current: Expense[], incoming: Expense[]): Expense[] {
  const map = new Map(current.map((e) => [e.id, e]))
  for (const e of incoming) map.set(e.id, e)
  return [...map.values()]
}
