import { formatCents } from '../money.ts'

interface ExpenseItemProps {
  amountCents: number
  label: string
  note: string
  onClick: () => void
}

export default function ExpenseItem({ amountCents, label, note, onClick }: ExpenseItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 text-left active:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] text-slate-800">{label}</div>
        {note && <div className="mt-0.5 truncate text-xs text-slate-400">{note}</div>}
      </div>
      <div className="shrink-0 text-[15px] tabular-nums text-slate-800">
        -¥{formatCents(amountCents)}
      </div>
    </button>
  )
}
