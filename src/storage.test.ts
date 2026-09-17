import { beforeEach, describe, expect, it } from 'vitest'
import { buildBackup, mergeExpenses, validateBackup } from './backup.ts'
import * as storage from './storage.ts'
import type { Expense } from './types.ts'

/** 最小的 localStorage 替身。node 环境没有它，而 storage.ts 是唯一碰它的文件 */
class FakeStorage {
  private map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
  clear(): void {
    this.map.clear()
  }
}

beforeEach(() => {
  ;(globalThis as { localStorage?: unknown }).localStorage = new FakeStorage()
})

const record = (over: Partial<Expense> = {}): Expense => ({
  id: 'a1',
  amountCents: 2350,
  categoryId: 'food',
  subcategoryId: 'food.takeout',
  note: '午饭 麻辣烫',
  date: '2026-09-17',
  createdAt: '2026-09-17T04:12:33.000Z',
  updatedAt: '2026-09-17T04:12:33.000Z',
  ...over,
})

describe('存储往返', () => {
  it('没有数据时返回空列表', async () => {
    expect(await storage.loadExpenses()).toEqual([])
  })

  it('存进去再读出来完全一致', async () => {
    const list = [record(), record({ id: 'b2', amountCents: 1 })]
    await storage.saveExpenses(list)
    expect(await storage.loadExpenses()).toEqual(list)
  })

  it('数据损坏时退回空列表而不是让 App 打不开', async () => {
    localStorage.setItem('pmjz:expenses:v1', '{ 这不是 JSON')
    expect(await storage.loadExpenses()).toEqual([])
  })

  it('存成数组以外的结构时也退回空列表', async () => {
    localStorage.setItem('pmjz:expenses:v1', '{"a":1}')
    expect(await storage.loadExpenses()).toEqual([])
  })

  it('设置项默认值是"从未备份过"', async () => {
    expect(await storage.loadSettings()).toEqual({ schemaVersion: 1, lastBackupAt: null })
  })

  it('设置项能存取', async () => {
    await storage.saveSettings({ schemaVersion: 1, lastBackupAt: '2026-09-17T00:00:00.000Z' })
    expect((await storage.loadSettings()).lastBackupAt).toBe('2026-09-17T00:00:00.000Z')
  })

  it('清空后一切归零', async () => {
    await storage.saveExpenses([record()])
    await storage.clearAll()
    expect(await storage.loadExpenses()).toEqual([])
  })
})

describe('备份闭环（产品设计文档验收第 14 条）', () => {
  it('导出 → 清空 → 导入，数据一条不差', async () => {
    const original = [record(), record({ id: 'b2', amountCents: 1, note: '' })]
    await storage.saveExpenses(original)

    const backup = buildBackup(await storage.loadExpenses())
    await storage.clearAll()
    expect(await storage.loadExpenses()).toEqual([])

    const checked = validateBackup(JSON.parse(JSON.stringify(backup)))
    expect(checked.ok).toBe(true)
    if (!checked.ok) return

    await storage.saveExpenses(checked.value.expenses)
    expect(await storage.loadExpenses()).toEqual(original)
  })

  it('导出 → 导入 → 再导出，两个备份文件内容完全一致', async () => {
    await storage.saveExpenses([record(), record({ id: 'b2', amountCents: 99999 })])

    const first = buildBackup(await storage.loadExpenses())
    const roundTripped = validateBackup(JSON.parse(JSON.stringify(first)))
    expect(roundTripped.ok).toBe(true)
    if (!roundTripped.ok) return

    await storage.saveExpenses(roundTripped.value.expenses)
    const second = buildBackup(await storage.loadExpenses())

    // exportedAt 是导出时刻，本来就会不同，把它排除后其余必须逐字一致
    expect({ ...second, exportedAt: '' }).toEqual({ ...first, exportedAt: '' })
  })

  it('合计金额在往返后不丢分', async () => {
    const list = [record({ amountCents: 1234 }), record({ id: 'b', amountCents: 2 })]
    await storage.saveExpenses(list)
    const total = (await storage.loadExpenses()).reduce((s, e) => s + e.amountCents, 0)
    expect(total).toBe(1236)
  })
})

describe('合并导入', () => {
  it('合并后旧记录保留，同 id 的被覆盖', () => {
    const merged = mergeExpenses(
      [record({ id: 'a', amountCents: 100 }), record({ id: 'keep', amountCents: 500 })],
      [record({ id: 'a', amountCents: 999 }), record({ id: 'new', amountCents: 700 })],
    )
    expect(merged).toHaveLength(3)
    expect(merged.find((e) => e.id === 'a')?.amountCents).toBe(999)
    expect(merged.find((e) => e.id === 'keep')?.amountCents).toBe(500)
    expect(merged.find((e) => e.id === 'new')?.amountCents).toBe(700)
  })
})
