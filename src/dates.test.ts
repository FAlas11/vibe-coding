import { describe, expect, it } from 'vitest'
import { dayLabel, monthKeyOf, monthLabel, shiftMonth } from './dates.ts'

describe('monthKeyOf', () => {
  it('取前 7 位作为月份键', () => {
    expect(monthKeyOf('2026-09-17')).toBe('2026-09')
  })
})

describe('shiftMonth', () => {
  it('普通前后移动', () => {
    expect(shiftMonth('2026-09', 1)).toBe('2026-10')
    expect(shiftMonth('2026-09', -1)).toBe('2026-08')
  })

  it('跨年前后移动', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('跨多年', () => {
    expect(shiftMonth('2026-03', 25)).toBe('2028-04')
    expect(shiftMonth('2026-03', -25)).toBe('2024-02')
  })

  it('移动 0 个月不变', () => {
    expect(shiftMonth('2026-09', 0)).toBe('2026-09')
  })
})

describe('monthLabel', () => {
  it('输出中文年月', () => {
    expect(monthLabel('2026-09')).toBe('2026 年 9 月')
    expect(monthLabel('2026-12')).toBe('2026 年 12 月')
  })
})

describe('dayLabel', () => {
  const today = '2026-09-17'

  it('今天和昨天用友好文案', () => {
    expect(dayLabel('2026-09-17', today)).toBe('今天')
    expect(dayLabel('2026-09-16', today)).toBe('昨天')
  })

  it('更早的日期显示月日和星期', () => {
    expect(dayLabel('2026-09-15', today)).toBe('9 月 15 日 周二')
  })

  it('跨月的昨天也能正确识别', () => {
    expect(dayLabel('2026-08-31', '2026-09-01')).toBe('昨天')
  })

  it('跨年的昨天也能正确识别', () => {
    expect(dayLabel('2025-12-31', '2026-01-01')).toBe('昨天')
  })
})
