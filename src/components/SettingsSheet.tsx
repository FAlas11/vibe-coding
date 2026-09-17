import { useEffect, useRef, useState } from 'react'
import { backupFileName, buildBackup, validateBackup } from '../backup.ts'
import { todayStr } from '../dates.ts'
import { estimateUsageBytes, loadSettings, saveSettings } from '../storage.ts'
import type { Expense } from '../types.ts'

interface SettingsSheetProps {
  expenses: Expense[]
  onClose: () => void
  onApply: (mode: 'replace' | 'merge', incoming: Expense[]) => Promise<boolean>
}

const RULES: { case: string; where: string }[] = [
  { case: '点外卖（不论哪一餐）', where: '餐饮 › 外卖' },
  { case: '堂食或打包带走', where: '餐饮 › 早餐 / 午餐 / 晚餐' },
  { case: '和朋友 AA 吃饭', where: '餐饮 › 聚餐下馆子' },
  { case: '我买单请别人吃饭', where: '人情往来 › 请客招待' },
  { case: '超市买菜买肉', where: '餐饮 › 买菜做饭' },
  { case: '超市买纸巾洗衣液', where: '购物 › 日用百货' },
  { case: '网购', where: '按其买的东西归类，网购本身不单列' },
  { case: '打车 / 网约车', where: '交通 › 打车' },
  { case: '手机话费、流量', where: '通讯 › 手机话费' },
  { case: '宽带、网费', where: '通讯 › 宽带 / 网费（不要记到居住）' },
  { case: '房租、水电燃气、物业、取暖', where: '居住' },
  { case: '快递费、寄件费', where: '生活服务 › 快递邮寄' },
  { case: '信用卡还款、花呗还款、自己账户间转账', where: '不记（记了会重复计算）' },
  { case: '借给别人的钱', where: '不记（借钱不是消费）' },
  { case: '买礼物送人', where: '人情往来 › 礼品礼物' },
]

export default function SettingsSheet({ expenses, onClose, onApply }: SettingsSheetProps) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState<Expense[] | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [bytes, setBytes] = useState(0)
  const [showRules, setShowRules] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    estimateUsageBytes().then(setBytes)
  }, [])

  async function handleExport() {
    setError(null)
    const blob = new Blob([JSON.stringify(buildBackup(expenses), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupFileName(todayStr())
    a.click()
    URL.revokeObjectURL(url)

    const settings = await loadSettings()
    await saveSettings({ ...settings, lastBackupAt: new Date().toISOString() })
    setNotice(`已导出 ${expenses.length} 条记录。请把文件存到网盘或微信收藏。`)
  }

  async function handleFile(file: File) {
    setError(null)
    setNotice(null)
    setConfirmReplace(false)

    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      setError('这个文件读不出内容，可能不是备份文件。您现有的数据没有变动。')
      return
    }

    const result = validateBackup(parsed)
    if (!result.ok) {
      setError(`${result.error}。您现有的数据没有变动。`)
      return
    }
    setPending(result.value.expenses)
  }

  async function apply(mode: 'replace' | 'merge') {
    if (!pending) return
    const ok = await onApply(mode, pending)
    setPending(null)
    setConfirmReplace(false)
    if (ok) {
      setNotice(mode === 'replace' ? `已覆盖，现在是 ${pending.length} 条记录。` : '已把备份里的记录合并进来。')
    } else {
      setError('写入失败，数据可能没有完全保存。请先导出备份再重试。')
    }
  }

  const overOneMb = bytes > 1024 * 1024

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="safe-bottom flex max-h-[92dvh] flex-col rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-base font-medium text-slate-800">设置与备份</span>
          <button type="button" onClick={onClose} aria-label="关闭" className="-mr-1 px-1 text-xl text-slate-400">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700">{error}</p>}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-700">{notice}</p>
          )}

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-800">备份</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              账目只存在这台设备上。换手机、清除浏览器数据都会让账目消失，导出的文件是唯一的保险。
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white"
            >
              导出备份（{expenses.length} 条）
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 w-full rounded-lg bg-white py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
            >
              从备份文件恢复
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFile(file)
                e.target.value = ''
              }}
            />
          </div>

          {pending && (
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <div className="text-sm font-medium text-amber-900">
                备份文件里有 {pending.length} 条记录，当前设备有 {expenses.length} 条
              </div>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                换手机恢复请选「完全覆盖」。怕漏了旧记录请选「合并」。
              </p>
              {confirmReplace ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-red-700">
                    覆盖会删掉当前设备上的全部账目，无法撤销。确定吗？
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void apply('replace')}
                      className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white"
                    >
                      确定覆盖
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReplace(false)}
                      className="flex-1 rounded-lg bg-white py-2.5 text-sm text-slate-600 ring-1 ring-slate-200"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReplace(true)}
                    className="flex-1 rounded-lg bg-white py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    完全覆盖
                  </button>
                  <button
                    type="button"
                    onClick={() => void apply('merge')}
                    className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white"
                  >
                    合并进来
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-800">数据体积</div>
            <p className="mt-1 text-xs text-slate-500">
              已用约 {(bytes / 1024).toFixed(0)} KB。浏览器上限约 5MB，按每天 8 笔算可以用 8 年以上。
            </p>
            {overOneMb && (
              <p className="mt-2 text-xs font-medium text-amber-700">数据已超过 1MB，建议现在导出一次备份。</p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <button
              type="button"
              onClick={() => setShowRules((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-medium text-slate-800"
            >
              归类规则（不知道怎么归类时看这里）
              <span className="text-slate-400">{showRules ? '收起' : '展开'}</span>
            </button>
            {showRules && (
              <dl className="mt-3 space-y-2">
                {RULES.map((r) => (
                  <div key={r.case} className="text-xs leading-relaxed">
                    <dt className="text-slate-500">{r.case}</dt>
                    <dd className="font-medium text-slate-800">→ {r.where}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
