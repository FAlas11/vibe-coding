import { describe, expect, it } from 'vitest'
import { backupFileName, buildBackup, mergeExpenses, validateBackup } from './backup.ts'
import type { Expense } from './types.ts'

const good = (over: Partial<Expense> = {}): Expense => ({
  id: 'a1',
  amountCents: 1234,
  categoryId: 'food',
  subcategoryId: 'food.takeout',
  note: '',
  date: '2026-09-17',
  createdAt: '2026-09-17T04:00:00.000Z',
  updatedAt: '2026-09-17T04:00:00.000Z',
  ...over,
})

describe('buildBackup', () => {
  it('带上 App 标识、版本号和完整分类表', () => {
    const b = buildBackup([good()])
    expect(b.app).toBe('pingmian-jizhang')
    expect(b.schemaVersion).toBe(1)
    expect(b.categories.length).toBeGreaterThan(90)
    expect(b.expenses).toHaveLength(1)
  })
})

describe('validateBackup', () => {
  it('接受合法文件', () => {
    expect(validateBackup(buildBackup([good()])).ok).toBe(true)
  })

  it('拒绝不是本 App 的文件', () => {
    expect(validateBackup({ ...buildBackup([]), app: 'other' }).ok).toBe(false)
  })

  it('拒绝 expenses 不是数组', () => {
    expect(validateBackup({ ...buildBackup([]), expenses: 'nope' }).ok).toBe(false)
  })

  it('拒绝未来版本号', () => {
    expect(validateBackup({ ...buildBackup([]), schemaVersion: 999 }).ok).toBe(false)
  })

  it('拒绝金额是非整数', () => {
    expect(validateBackup({ ...buildBackup([]), expenses: [{ ...good(), amountCents: 12.5 }] }).ok).toBe(false)
  })

  it('拒绝金额是字符串', () => {
    expect(validateBackup({ ...buildBackup([]), expenses: [{ ...good(), amountCents: 'abc' }] }).ok).toBe(false)
  })

  it('拒绝金额小于等于 0', () => {
    expect(validateBackup({ ...buildBackup([]), expenses: [{ ...good(), amountCents: -1 }] }).ok).toBe(false)
    expect(validateBackup({ ...buildBackup([]), expenses: [{ ...good(), amountCents: 0 }] }).ok).toBe(false)
  })

  it('拒绝日期格式不符', () => {
    expect(validateBackup({ ...buildBackup([]), expenses: [{ ...good(), date: '2026/09/17' }] }).ok).toBe(false)
  })

  it('报错信息里指出是第几条出错', () => {
    const result = validateBackup({
      ...buildBackup([]),
      expenses: [good({ id: 'x' }), { ...good(), amountCents: -1 }],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('第 2 条')
  })

  it('拒绝非对象输入', () => {
    expect(validateBackup(null).ok).toBe(false)
    expect(validateBackup('{}').ok).toBe(false)
    expect(validateBackup([]).ok).toBe(false)
  })
})

describe('mergeExpenses', () => {
  it('按 id 去重，导出的记录覆盖同 id 的旧记录', () => {
    const merged = mergeExpenses([good({ id: 'a', amountCents: 100 })], [good({ id: 'a', amountCents: 999 }), good({ id: 'b' })])
    expect(merged).toHaveLength(2)
    expect(merged.find((e) => e.id === 'a')?.amountCents).toBe(999)
  })

  it('没有重叠时两边都保留', () => {
    expect(mergeExpenses([good({ id: 'a' })], [good({ id: 'b' })])).toHaveLength(2)
  })
})

describe('backupFileName', () => {
  it('文件名带日期，便于区分', () => {
    expect(backupFileName('2026-09-17')).toBe('平面记账-备份-2026-09-17.json')
  })
})
