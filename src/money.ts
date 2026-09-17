/** 单笔金额上限：整数部分 8 位，防止误输入天文数字撑爆统计 */
const MAX_INT_DIGITS = 8

/** 全角数字、全角句点、全角逗号 → 半角。中文输入法下很容易打出来 */
function toHalfWidth(s: string): string {
  return s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/．/g, '.')
    .replace(/，/g, ',')
}

/**
 * 把用户输入解析成整数「分」。非法输入返回 null。
 * 不用 parseFloat：`12.34 * 100` 在浮点数下是 1233.9999999999998。
 */
export function parseAmountToCents(raw: string): number | null {
  const s = toHalfWidth(raw).replace(/[¥￥\s,]/g, '')
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(s)) return null
  const [intPart = '', decPart = ''] = s.split('.')
  if (intPart.length > MAX_INT_DIGITS) return null
  const cents = Number(intPart) * 100 + Number(decPart.padEnd(2, '0') || '0')
  return cents > 0 ? cents : null
}

/** 把「分」格式化成 '12.34'。不加千分位，列表里的数字更紧凑好扫 */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}
