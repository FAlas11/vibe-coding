import { useEffect, useMemo, useState } from 'react'
import ExpenseForm from './components/ExpenseForm.tsx'
import ExpenseList from './components/ExpenseList.tsx'
import MonthHeader from './components/MonthHeader.tsx'
import SettingsSheet from './components/SettingsSheet.tsx'
import Toast from './components/Toast.tsx'
import { monthKeyOf, todayStr } from './dates.ts'
import { loadSettings } from './storage.ts'
import type { Expense } from './types.ts'
import { useExpenses } from './useExpenses.ts'

interface ToastState {
  message: string
  tone?: 'info' | 'error' | 'success'
  actionLabel?: string
  onAction?: () => void
}

const UNDO_MS = 5000
const BACKUP_REMIND_DAYS = 30

export default function App() {
  const {
    loading,
    error,
    expenses,
    byMonth,
    addExpense,
    updateExpense,
    removeExpense,
    restoreExpense,
    replaceAll,
    mergeIn,
    monthTotal,
  } = useExpenses()

  const [monthKey, setMonthKey] = useState(() => monthKeyOf(todayStr()))
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  const monthExpenses = useMemo(() => byMonth.get(monthKey) ?? [], [byMonth, monthKey])

  // 删除后 5 秒内可以撤销
  useEffect(() => {
    if (!pendingDelete) return
    const timer = setTimeout(() => setPendingDelete(null), UNDO_MS)
    return () => clearTimeout(timer)
  }, [pendingDelete])

  // 超过 30 天没备份就提醒一次
  useEffect(() => {
    if (loading) return
    void loadSettings().then((settings) => {
      const last = settings.lastBackupAt ? new Date(settings.lastBackupAt).getTime() : 0
      const days = (Date.now() - last) / 86_400_000
      if (last === 0 || days >= BACKUP_REMIND_DAYS) {
        setToast({
          message: last === 0 ? '还没有备份过账目' : '已经很久没备份了',
          tone: 'info',
          actionLabel: '立即备份',
          onAction: () => {
            setToast(null)
            setSettingsOpen(true)
          },
        })
      }
    })
  }, [loading])

  useEffect(() => {
    if (error) setToast({ message: error, tone: 'error' })
  }, [error])

  async function handleDelete(id: string) {
    const target = expenses.find((e) => e.id === id)
    if (!target) return
    if (await removeExpense(id)) {
      setFormOpen(false)
      setEditing(null)
      setPendingDelete(target)
      setToast(null)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      <MonthHeader monthKey={monthKey} totalCents={monthTotal(monthKey)} onChangeMonth={setMonthKey} />

      <main className="mx-auto -mt-4 max-w-md overflow-hidden rounded-t-2xl bg-white">
        {loading ? (
          <p className="px-4 py-20 text-center text-sm text-slate-300">正在读取账目…</p>
        ) : (
          <ExpenseList
            expenses={monthExpenses}
            onSelect={(e) => {
              setEditing(e)
              setFormOpen(true)
            }}
          />
        )}
      </main>

      <button
        type="button"
        aria-label="记一笔"
        onClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-3xl leading-none text-white shadow-lg shadow-slate-900/25 active:bg-slate-700"
      >
        <span className="-mt-1">＋</span>
      </button>

      <button
        type="button"
        aria-label="设置与备份"
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-20 rounded-full bg-white px-4 py-3 text-sm text-slate-600 shadow-lg ring-1 ring-slate-200 active:bg-slate-100"
      >
        备份
      </button>

      {formOpen && (
        <ExpenseForm
          initial={editing}
          onSubmit={(input) => (editing ? updateExpense(editing.id, input) : addExpense(input))}
          onDelete={(id) => void handleDelete(id)}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {settingsOpen && (
        <SettingsSheet
          expenses={expenses}
          onClose={() => setSettingsOpen(false)}
          onApply={(mode, incoming) => (mode === 'replace' ? replaceAll(incoming) : mergeIn(incoming))}
        />
      )}

      {pendingDelete ? (
        <Toast
          message="已删除"
          tone="success"
          actionLabel="撤销"
          onAction={() => {
            void restoreExpense(pendingDelete)
            setPendingDelete(null)
          }}
          onDismiss={() => setPendingDelete(null)}
        />
      ) : (
        toast && (
          <Toast
            message={toast.message}
            tone={toneOf(toast)}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            onDismiss={() => setToast(null)}
          />
        )
      )}
    </div>
  )
}

function toneOf(t: ToastState): 'info' | 'error' | 'success' {
  return t.tone ?? 'info'
}
