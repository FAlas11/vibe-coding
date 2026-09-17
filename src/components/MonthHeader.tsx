import { monthLabel, shiftMonth } from '../dates.ts'
import { formatCents } from '../money.ts'

interface MonthHeaderProps {
  monthKey: string
  totalCents: number
  onChangeMonth: (monthKey: string) => void
}

export default function MonthHeader({ monthKey, totalCents, onChangeMonth }: MonthHeaderProps) {
  return (
    <header className="safe-top bg-slate-900 px-4 pt-3 pb-7 text-white">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <button
          type="button"
          aria-label="上个月"
          onClick={() => onChangeMonth(shiftMonth(monthKey, -1))}
          className="-ml-2 px-3 py-2 text-2xl leading-none text-white/70 active:text-white"
        >
          ‹
        </button>
        <span className="text-base font-medium">{monthLabel(monthKey)}</span>
        <button
          type="button"
          aria-label="下个月"
          onClick={() => onChangeMonth(shiftMonth(monthKey, 1))}
          className="-mr-2 px-3 py-2 text-2xl leading-none text-white/70 active:text-white"
        >
          ›
        </button>
      </div>

      <div className="mx-auto mt-4 max-w-md">
        <div className="text-xs tracking-wide text-white/55">本月支出</div>
        <div className="mt-1 flex items-baseline gap-1.5 font-semibold">
          <span className="text-2xl text-white/70">¥</span>
          <span className="text-4xl tabular-nums">{formatCents(totalCents)}</span>
        </div>
      </div>
    </header>
  )
}
