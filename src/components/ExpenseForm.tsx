import { useState } from 'react'
import { categoryById } from '../categories.ts'
import { todayStr } from '../dates.ts'
import { formatCents, parseAmountToCents } from '../money.ts'
import type { Expense } from '../types.ts'
import type { ExpenseInput } from '../useExpenses.ts'
import CategoryPicker from './CategoryPicker.tsx'

interface ExpenseFormProps {
  /** null 表示新增，传入记录表示编辑 */
  initial: Expense | null
  onSubmit: (input: ExpenseInput) => Promise<boolean>
  onDelete: (id: string) => void
  onCancel: () => void
}

function daysAgoStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const QUICK_DATES = [
  { label: '今天', days: 0 },
  { label: '昨天', days: 1 },
  { label: '前天', days: 2 },
]

export default function ExpenseForm({ initial, onSubmit, onDelete, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initial ? formatCents(initial.amountCents) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategoryId ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? todayStr())
  const [saving, setSaving] = useState(false)

  const cents = parseAmountToCents(amount)
  const amountInvalid = amount.trim() !== '' && cents === null
  const canSave = cents !== null && subcategoryId !== '' && !saving

  async function handleSave() {
    if (cents === null || subcategoryId === '') return
    setSaving(true)
    const ok = await onSubmit({ amountCents: cents, categoryId, subcategoryId, note: note.trim(), date })
    setSaving(false)
    // 保存失败时保持表单打开，不让用户白输一遍
    if (ok) onCancel()
  }

  const topName = categoryId ? categoryById(categoryId)?.name : undefined

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={onCancel}>
      <div
        className="safe-bottom flex max-h-[92dvh] flex-col rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-base font-medium text-slate-800">{initial ? '编辑' : '记一笔'}</span>
          <button type="button" onClick={onCancel} aria-label="关闭" className="-mr-1 px-1 text-xl text-slate-400">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div>
            <div className="flex items-baseline gap-2 border-b-2 border-slate-900 pb-2">
              <span className="text-3xl text-slate-400">¥</span>
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-4xl font-semibold tabular-nums text-slate-900 outline-none placeholder:text-slate-200"
              />
            </div>
            {amountInvalid && <p className="mt-1.5 text-xs text-red-600">请输入正确的金额，最多两位小数</p>}
          </div>

          <div>
            <div className="mb-2 text-xs text-slate-500">
              分类{topName && subcategoryId ? `：${topName}` : ''}
            </div>
            <CategoryPicker
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              onChange={({ categoryId: c, subcategoryId: s }) => {
                setCategoryId(c)
                setSubcategoryId(s)
              }}
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs text-slate-500">备注（可不填）</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="例如：公司楼下"
              className="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-slate-50 focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs text-slate-500">日期</div>
            <div className="flex gap-2">
              {QUICK_DATES.map(({ label, days }) => {
                const value = daysAgoStr(days)
                const active = date === value
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDate(value)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      active ? 'bg-slate-900 font-medium text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value || todayStr())}
                className="min-w-0 flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-4 pt-3">
          {initial && (
            <button
              type="button"
              onClick={() => onDelete(initial.id)}
              className="rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-medium text-red-600 active:bg-slate-200"
            >
              删除
            </button>
          )}
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="flex-1 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition disabled:bg-slate-200 disabled:text-slate-400"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
