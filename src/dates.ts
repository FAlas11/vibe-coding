const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

/**
 * 取本地日期字符串 'YYYY-MM-DD'。
 * 不用 toISOString()：它转成 UTC，东八区晚上 8 点后会算成第二天。
 */
export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** '2026-09-17' → '2026-09'。日期是等宽补零字符串，取前 7 位即可 */
export function monthKeyOf(date: string): string {
  return date.slice(0, 7)
}

/** '2026-09' → '2026 年 9 月' */
export function monthLabel(monthKey: string): string {
  const [year = '', month = '1'] = monthKey.split('-')
  return `${year} 年 ${Number(month)} 月`
}

/** 构造本地零点的 Date。不用 new Date('2026-09-17')，那会被当成 UTC 解析 */
function parseLocalDate(date: string): Date {
  const [y = 1970, m = 1, d = 1] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 在月份键上前后移动。用 Date 做进位，跨年自动处理 */
export function shiftMonth(monthKey: string, delta: number): string {
  const [y = 1970, m = 1] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 列表里的日期标题：今天 / 昨天 / 9 月 15 日 周二 */
export function dayLabel(date: string, today: string): string {
  if (date === today) return '今天'
  if (date === previousDay(today)) return '昨天'
  const d = parseLocalDate(date)
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 ${WEEKDAYS[d.getDay()]}`
}

function previousDay(date: string): string {
  const d = parseLocalDate(date)
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}
