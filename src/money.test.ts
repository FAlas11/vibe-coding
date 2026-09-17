import { describe, expect, it } from 'vitest'
import { formatCents, parseAmountToCents } from './money.ts'

describe('parseAmountToCents', () => {
  it('解析普通金额', () => {
    expect(parseAmountToCents('12.34')).toBe(1234)
    expect(parseAmountToCents('0.01')).toBe(1)
    expect(parseAmountToCents('1000')).toBe(100000)
    expect(parseAmountToCents('12.3')).toBe(1230)
    expect(parseAmountToCents('12.30')).toBe(1230)
  })

  it('容忍全角数字和全角句点（中文输入法常见）', () => {
    expect(parseAmountToCents('１２．３４')).toBe(1234)
  })

  it('容忍货币符号和空格', () => {
    expect(parseAmountToCents(' ¥12.34 ')).toBe(1234)
    expect(parseAmountToCents('￥12.34')).toBe(1234)
    expect(parseAmountToCents('¥ 12.34')).toBe(1234)
  })

  it('拒绝非法输入', () => {
    const bad = ['', '   ', 'abc', '0', '0.00', '-5', '1.234', '1e5', '.5', '12.', 'NaN', 'Infinity']
    for (const input of bad) {
      expect(parseAmountToCents(input), `应拒绝 ${JSON.stringify(input)}`).toBeNull()
    }
  })

  it('拒绝超过 8 位的整数部分', () => {
    expect(parseAmountToCents('12345678')).toBe(1234567800)
    expect(parseAmountToCents('123456789')).toBeNull()
  })
})

describe('formatCents', () => {
  it('格式化为两位小数', () => {
    expect(formatCents(1234)).toBe('12.34')
    expect(formatCents(1)).toBe('0.01')
    expect(formatCents(0)).toBe('0.00')
    expect(formatCents(100000)).toBe('1000.00')
  })

  it('整数相加不丢分', () => {
    expect(formatCents(1234 + 2)).toBe('12.36')
  })
})
