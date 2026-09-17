import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { monthKeyOf } from './dates.ts'
import * as storage from './storage.ts'
import type { Expense } from './types.ts'

export interface ExpenseInput {
  amountCents: number
  categoryId: string
  subcategoryId: string
  note: string
  date: string
}

/** 全局排序：日期倒序；同一天内后记的排在上面 */
function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  )
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 用 ref 保存最新列表，避免连续操作时读到过期的 state
  const listRef = useRef<Expense[]>([])

  useEffect(() => {
    storage
      .loadExpenses()
      .then((list) => {
        const sorted = sortExpenses(list)
        listRef.current = sorted
        setExpenses(sorted)
      })
      .finally(() => setLoading(false))
  }, [])

  /** 唯一写入口。写入失败（例如存储空间满）时把错误暴露给界面 */
  const commit = useCallback(async (next: Expense[]): Promise<boolean> => {
    const sorted = sortExpenses(next)
    try {
      await storage.saveExpenses(sorted)
      listRef.current = sorted
      setExpenses(sorted)
      setError(null)
      return true
    } catch {
      setError('保存失败：手机存储空间可能已满。请先导出备份，再清理一些数据。')
      return false
    }
  }, [])

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      const now = new Date().toISOString()
      const record: Expense = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now }
      return commit([...listRef.current, record])
    },
    [commit],
  )

  const updateExpense = useCallback(
    async (id: string, input: ExpenseInput) => {
      const now = new Date().toISOString()
      return commit(listRef.current.map((e) => (e.id === id ? { ...e, ...input, updatedAt: now } : e)))
    },
    [commit],
  )

  const removeExpense = useCallback(
    async (id: string) => commit(listRef.current.filter((e) => e.id !== id)),
    [commit],
  )

  /** 撤销删除：把整条记录原样放回去 */
  const restoreExpense = useCallback(
    async (record: Expense) => {
      if (listRef.current.some((e) => e.id === record.id)) return true
      return commit([...listRef.current, record])
    },
    [commit],
  )

  const replaceAll = useCallback(async (list: Expense[]) => commit(list), [commit])

  const mergeIn = useCallback(
    async (incoming: Expense[]) => {
      const map = new Map(listRef.current.map((e) => [e.id, e]))
      for (const e of incoming) map.set(e.id, e)
      return commit([...map.values()])
    },
    [commit],
  )

  const byMonth = useMemo(() => {
    const groups = new Map<string, Expense[]>()
    for (const e of expenses) {
      const key = monthKeyOf(e.date)
      const bucket = groups.get(key)
      if (bucket) bucket.push(e)
      else groups.set(key, [e])
    }
    return groups
  }, [expenses])

  /** 按月合计。整数分相加，不会丢精度 */
  const monthTotal = useCallback(
    (monthKey: string) =>
      (byMonth.get(monthKey) ?? []).reduce((sum, e) => sum + e.amountCents, 0),
    [byMonth],
  )

  return {
    loading,
    error,
    expenses,
    byMonth,
    addExpense,
    updateExpense,
    removeExpense,
    restoreExpense,
    replaceAll,
    mergeIn,
    monthTotal,
  }
}
