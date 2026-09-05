import { HandCoins, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { DebtForm } from "../components/debts/DebtForm"
import { PaymentForm } from "../components/debts/PaymentForm"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { formatDate, formatMoney } from "../lib/format"
import { debtRemaining, debtsSummary } from "../lib/selectors"

function DebtRow({ debt, currency, onPay, onDelete }) {
  const remaining = debtRemaining(debt)
  const settled = remaining <= 0
  const percentPaid = debt.amount > 0 ? Math.min(((debt.amount - remaining) / debt.amount) * 100, 100) : 0

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{debt.person}</p>
          <p className="truncate text-xs text-slate-400">
            {debt.note ? `${debt.note} · ` : ""}
            {formatDate(debt.date)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!settled && (
            <Button variant="secondary" onClick={() => onPay(debt)}>
              تسديد
            </Button>
          )}
          <button
            onClick={() => onDelete(debt.id)}
            aria-label="حذف"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${settled ? "bg-teal-500" : "bg-amber-500"}`}
          style={{ width: `${percentPaid}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-slate-400">
        {settled ? (
          <span className="text-teal-600">تم السداد بالكامل ✅ ({formatMoney(debt.amount, currency)})</span>
        ) : (
          <>
            متبقي {formatMoney(remaining, currency)} من {formatMoney(debt.amount, currency)}
          </>
        )}
      </p>
    </div>
  )
}

export default function Debts() {
  const { state, deleteDebt } = useBudget()
  const [tab, setTab] = useState("owed_by_me")
  const [formOpen, setFormOpen] = useState(false)
  const [payingDebt, setPayingDebt] = useState(null)
  const currency = state.settings.currency

  const summary = useMemo(() => debtsSummary(state.debts), [state.debts])
  const visible = state.debts.filter((d) => d.direction === tab)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">الديون والسلف</h1>
          <p className="mt-1 text-sm text-slate-400">تابع مين مديون لمين ومقدار المتبقي</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          دين جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">مدينون لي (لي)</span>
          <span className="font-bold text-teal-600">{formatMoney(summary.owedToMe, currency)}</span>
        </Card>
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">أنا مدين (علي)</span>
          <span className="font-bold text-rose-500">{formatMoney(summary.owedByMe, currency)}</span>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "owed_by_me", label: "علي (أنا مدين)" },
            { value: "owed_to_me", label: "لي (مدينون لي)" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTab(opt.value)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-bold transition ${
                tab === opt.value
                  ? "bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<HandCoins size={22} />}
            title="لا توجد ديون هنا"
            description="اضغط (دين جديد) لإضافة أول سجل"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((d) => (
              <DebtRow
                key={d.id}
                debt={d}
                currency={currency}
                onPay={setPayingDebt}
                onDelete={(id) => {
                  if (window.confirm("حذف هذا السجل نهائياً؟")) deleteDebt(id)
                }}
              />
            ))}
          </div>
        )}
      </Card>

      <DebtForm open={formOpen} onClose={() => setFormOpen(false)} defaultDirection={tab} />
      <PaymentForm open={Boolean(payingDebt)} onClose={() => setPayingDebt(null)} debt={payingDebt} />
    </div>
  )
}
