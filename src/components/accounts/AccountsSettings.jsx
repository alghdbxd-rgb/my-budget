import { Pencil, Plus, Trash2, Wallet } from "lucide-react"
import { useMemo, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { formatMoney } from "../../lib/format"
import { accountBalances } from "../../lib/selectors"
import { Button } from "../ui/Button"
import { Card, CardHeader } from "../ui/Card"
import { AccountForm } from "./AccountForm"

export function AccountsSettings() {
  const { state, deleteAccount } = useBudget()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const balances = useMemo(
    () => accountBalances(state.transactions, state.accounts),
    [state.transactions, state.accounts],
  )

  return (
    <Card>
      <CardHeader
        title="الحسابات"
        subtitle="مثل: نقد، ماستر، بنك — تقدر تحول بينها من (عملية جديدة → تحويل)"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            حساب جديد
          </Button>
        }
      />
      <div className="flex flex-col gap-2">
        {balances.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5 dark:border-slate-800"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${a.color}1a`, color: a.color }}
              >
                <Wallet size={14} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{a.name}</p>
                <p
                  className={`text-xs font-semibold ${a.balance < 0 ? "text-rose-500" : "text-slate-400"}`}
                >
                  {formatMoney(a.balance, state.settings.currency)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => {
                  setEditing(a)
                  setFormOpen(true)
                }}
                aria-label="تعديل"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <Pencil size={14} />
              </button>
              {state.accounts.length > 1 && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `حذف حساب "${a.name}"؟ العمليات المرتبطة به ستبقى لكن بدون حساب محدد.`,
                      )
                    ) {
                      deleteAccount(a.id)
                    }
                  }}
                  aria-label="حذف"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AccountForm open={formOpen} onClose={() => setFormOpen(false)} account={editing} />
    </Card>
  )
}
