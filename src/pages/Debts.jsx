import { HandCoins, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { DebtForm } from "../components/debts/DebtForm"
import { PaymentForm } from "../components/debts/PaymentForm"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { ListPageHeader, ListView } from "../components/ui/ListView"
import { useBudget } from "../context/BudgetContext"
import { formatDate, formatMoney } from "../lib/format"
import { debtRemaining, debtsSummary } from "../lib/selectors"

export default function Debts() {
  const { state, deleteDebt } = useBudget()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState("owed_by_me")
  const [formOpen, setFormOpen] = useState(false)
  const [payingDebt, setPayingDebt] = useState(null)
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const currency = state.settings.currency

  const summary = useMemo(() => debtsSummary(state.debts), [state.debts])
  const isSearching = search.trim().length > 0
  const visible = isSearching
    ? state.debts.filter((d) => `${d.person} ${d.note ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()))
    : state.debts.filter((d) => d.direction === tab)

  function handleDelete(id) {
    if (window.confirm("حذف هذا السجل نهائياً؟")) deleteDebt(id)
  }

  const columns = [
    {
      key: "person",
      label: "الشخص",
      className: "font-bold text-slate-700 dark:text-slate-200",
      render: (d) => (
        <span className="flex flex-col">
          <span>{d.person}</span>
          {d.note && <span className="text-xs font-normal text-slate-400">{d.note}</span>}
        </span>
      ),
    },
    ...(isSearching
      ? [
          {
            key: "direction",
            label: "الاتجاه",
            render: (d) => <Badge tone={d.direction === "owed_to_me" ? "green" : "rose"}>{d.direction === "owed_to_me" ? "لي" : "علي"}</Badge>,
          },
        ]
      : []),
    {
      key: "date",
      label: "التاريخ",
      className: "whitespace-nowrap text-slate-500 dark:text-slate-400",
      render: (d) => formatDate(d.date),
    },
    {
      key: "amount",
      label: "المبلغ الكلي",
      align: "left",
      className: "font-semibold tabular-nums text-slate-600 dark:text-slate-300",
      render: (d) => formatMoney(d.amount, currency),
    },
    {
      key: "status",
      label: "الحالة",
      render: (d) => {
        const remaining = debtRemaining(d)
        const settled = remaining <= 0
        const percentPaid = d.amount > 0 ? Math.min(((d.amount - remaining) / d.amount) * 100, 100) : 0
        return settled ? (
          <Badge tone="green">تم السداد بالكامل</Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              متبقي {formatMoney(remaining, currency)}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${percentPaid}%` }} />
            </div>
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "",
      align: "center",
      headerClassName: "w-24",
      render: (d) => (
        <div className="flex items-center justify-center gap-1">
          {debtRemaining(d) > 0 && (
            <Button variant="secondary" className="!px-2.5 !py-1 text-xs" onClick={() => setPayingDebt(d)}>
              تسديد
            </Button>
          )}
          <button
            onClick={() => handleDelete(d.id)}
            aria-label="حذف"
            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <ListPageHeader
        title="الديون والسلف"
        subtitle="تابع مين مديون لمين ومقدار المتبقي"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            دين جديد
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center justify-between !p-3.5">
          <span className="text-xs font-semibold text-slate-500">مدينون لي (لي)</span>
          <span className="font-bold text-green-600">{formatMoney(summary.owedToMe, currency)}</span>
        </Card>
        <Card className="flex items-center justify-between !p-3.5">
          <span className="text-xs font-semibold text-slate-500">أنا مدين (علي)</span>
          <span className="font-bold text-rose-500">{formatMoney(summary.owedByMe, currency)}</span>
        </Card>
      </div>

      {state.debts.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (searchParams.get("q")) setSearchParams({})
            }}
            placeholder="ابحث بالاسم أو الملاحظة..."
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {!isSearching && (
        <div className="flex gap-2 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "owed_by_me", label: "علي (أنا مدين)" },
            { value: "owed_to_me", label: "لي (مدينون لي)" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTab(opt.value)}
              className={`flex-1 rounded py-1.5 text-sm font-bold transition ${
                tab === opt.value
                  ? "bg-white text-primary-700 shadow-sm dark:bg-slate-900 dark:text-primary-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <ListView
        columns={columns}
        rows={visible}
        rowKey={(d) => d.id}
        emptyIcon={<HandCoins size={22} />}
        emptyTitle={isSearching ? "لا توجد نتائج مطابقة" : "لا توجد ديون هنا"}
        emptyDescription={isSearching ? undefined : "اضغط (دين جديد) لإضافة أول سجل"}
      />

      <DebtForm open={formOpen} onClose={() => setFormOpen(false)} defaultDirection={tab} />
      <PaymentForm open={Boolean(payingDebt)} onClose={() => setPayingDebt(null)} debt={payingDebt} />
    </div>
  )
}
