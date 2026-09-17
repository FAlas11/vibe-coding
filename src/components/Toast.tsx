interface ToastProps {
  message: string
  /** info 用于备份提醒，error 用于保存失败，success 用于操作确认 */
  tone?: 'info' | 'error' | 'success'
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
}

const TONE = {
  info: 'bg-slate-800',
  error: 'bg-red-600',
  success: 'bg-emerald-600',
} as const

export default function Toast({ message, tone = 'info', actionLabel, onAction, onDismiss }: ToastProps) {
  return (
    <div className="safe-top pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3">
      <div
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${TONE[tone]}`}
      >
        <span className="flex-1 leading-snug">{message}</span>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="shrink-0 font-semibold underline">
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="关闭"
          className="-mr-1 shrink-0 px-1 text-lg leading-none text-white/70"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
