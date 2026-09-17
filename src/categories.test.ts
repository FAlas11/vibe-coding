import { describe, expect, it } from 'vitest'
import { CATEGORIES, TOP_CATEGORIES, categoryById, categoryPath, subcategoriesOf } from './categories.ts'

describe('分类表完整性', () => {
  it('ID 全局唯一', () => {
    const ids = CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个二级小类的 parentId 都指向一个存在的一级大类', () => {
    const topIds = new Set(TOP_CATEGORIES.map((c) => c.id))
    for (const c of CATEGORIES) {
      if (c.parentId !== null) {
        expect(topIds.has(c.parentId), `${c.id} 的父类 ${c.parentId} 不存在`).toBe(true)
      }
    }
  })

  it('二级小类的 ID 以父类 ID 加点开头', () => {
    for (const c of CATEGORIES) {
      if (c.parentId !== null) expect(c.id.startsWith(`${c.parentId}.`)).toBe(true)
    }
  })

  it('每个一级大类至少有 4 个二级小类', () => {
    for (const t of TOP_CATEGORIES) {
      expect(subcategoriesOf(t.id).length, `${t.name} 的小类太少`).toBeGreaterThanOrEqual(4)
    }
  })

  it('恰好 12 个一级大类', () => {
    expect(TOP_CATEGORIES.length).toBe(12)
  })

  it('恰好 99 个二级小类（改动分类表时同步改这里和产品设计文档）', () => {
    expect(CATEGORIES.filter((c) => c.parentId !== null)).toHaveLength(99)
    expect(CATEGORIES).toHaveLength(111)
  })

  it('没有空名字', () => {
    for (const c of CATEGORIES) expect(c.name.trim().length).toBeGreaterThan(0)
  })

  it('同一父类下的小类 sortOrder 不重复', () => {
    for (const t of TOP_CATEGORIES) {
      const orders = subcategoriesOf(t.id).map((c) => c.sortOrder)
      expect(new Set(orders).size, `${t.name} 下有 sortOrder 撞车`).toBe(orders.length)
    }
  })

  it('categoryPath 输出两级名字', () => {
    expect(categoryPath('food.takeout')).toBe('餐饮 · 外卖')
  })

  it('categoryPath 遇到未知 ID 不崩溃', () => {
    expect(categoryPath('nope.nope')).toBe('未知分类')
  })

  it('categoryById 查得到大类也查得到小类', () => {
    expect(categoryById('food')?.name).toBe('餐饮')
    expect(categoryById('food.lunch')?.name).toBe('午餐')
    expect(categoryById('nope')).toBeUndefined()
  })
})
