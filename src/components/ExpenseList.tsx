import { categoryPath } from '../categories.ts'
import { dayLabel, todayStr } from '../dates.ts'
import { formatCents } from '../money.ts'
import type { Expense } from '../types.ts'
import ExpenseItem from './ExpenseItem.tsx'

interface ExpenseListProps {
  expenses: Expense[]
  onSelect: (expense: Expense) => void
}

/** 输入已按日期倒序排好，顺序遍历即可完成分组 */
function groupByDate(expenses: Expense[]): { date: string; items: Expense[] }[] {
  const groups: { date: string; items: Expense[] }[] = []
  for (const e of expenses) {
    const last = groups.at(-1)
    if (last && last.date === e.date) last.items.push(e)
    else groups.push({ date: e.date, items: [e] })
  }
  return groups
}

export default function ExpenseList({ expenses, onSelect }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
        <p className="text-sm text-slate-400">这个月还没有记账</p>
        <p className="text-xs text-slate-300">点右下角的 ＋ 记第一笔</p>
      </div>
    )
  }

  const today = todayStr()

  return (
    <div>
      {groupByDate(expenses).map(({ date, items }) => {
        const dayTotal = items.reduce((sum, e) => sum + e.amountCents, 0)
        return (
          <section key={date}>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50/95 px-4 py-2 text-xs text-slate-500 backdrop-blur">
              <span className="font-medium text-slate-600">{dayLabel(date, today)}</span>
              <span className="tabular-nums">¥{formatCents(dayTotal)}</span>
            </div>
            {items.map((e) => (
              <ExpenseItem
                key={e.id}
                amountCents={e.amountCents}
                label={categoryPath(e.subcategoryId)}
                note={e.note}
                onClick={() => onSelect(e)}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
