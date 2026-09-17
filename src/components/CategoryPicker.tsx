import { useState } from 'react'
import { TOP_CATEGORIES, subcategoriesOf } from '../categories.ts'

interface CategoryPickerProps {
  categoryId: string
  subcategoryId: string
  onChange: (next: { categoryId: string; subcategoryId: string }) => void
}

/** 首字方块：零成本、风格统一，不用引入图标库 */
export function CategoryBadge({ name, active = false }: { name: string; active?: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {name.slice(0, 1)}
    </span>
  )
}

export default function CategoryPicker({ categoryId, subcategoryId, onChange }: CategoryPickerProps) {
  const [openTop, setOpenTop] = useState(categoryId)
  const subs = openTop ? subcategoriesOf(openTop) : []

  return (
    <div className="space-y-2">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TOP_CATEGORIES.map((top) => {
          const active = top.id === openTop
          return (
            <button
              key={top.id}
              type="button"
              onClick={() => setOpenTop(top.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pr-3 pl-1.5 text-sm whitespace-nowrap transition ${
                active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <CategoryBadge name={top.name} active={active} />
              {top.name}
            </button>
          )
        })}
      </div>

      {subs.length === 0 ? (
        <p className="px-1 py-3 text-sm text-slate-400">先选一个大类</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {subs.map((s) => {
            const active = s.id === subcategoryId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ categoryId: openTop, subcategoryId: s.id })}
                className={`rounded-lg px-2 py-2.5 text-sm transition ${
                  active
                    ? 'bg-slate-900 font-medium text-white'
                    : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                }`}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
