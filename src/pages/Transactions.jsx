import { Receipt, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { TransactionForm } from "../components/transactions/TransactionForm"
import { TransactionRow } from "../components/transactions/TransactionRow"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { formatMoney, monthKey as getMonthKey, monthLabel } from "../lib/format"
import { categoryById, sumByType } from "../lib/selectors"

export default function Transactions() {
  const { state } = useBudget()
  const [editing, setEditing] = useState(null)
  const [type, setType] = useState("all")
  const [categoryId, setCategoryId] = useState("all")
  const [month, setMonth] = useState("all")
  const [search, setSearch] = useState("")

  const monthOptions = useMemo(() => {
    const set = new Set(state.transactions.map((t) => getMonthKey(t.date)))
    return [...set].sort().reverse()
  }, [state.transactions])

  const filtered = useMemo(() => {
    return state.transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false
      if (categoryId !== "all" && t.categoryId !== categoryId) return false
      if (month !== "all" && getMonthKey(t.date) !== month) return false
      if (search) {
        const cat = categoryById(state.categories, t.categoryId)
        const haystack = `${cat?.name ?? ""} ${t.note ?? ""}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [state.transactions, state.categories, type, categoryId, month, search])

  const totalIncome = sumByType(filtered, "income")
  const totalExpense = sumByType(filtered, "expense")

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">العمليات</h1>
        <p className="mt-1 text-sm text-slate-400">جميع عمليات الدخل والمصروف الخاصة بك</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالتصنيف أو الملاحظة..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">كل الأنواع</option>
              <option value="income">دخل</option>
              <option value="expense">مصروف</option>
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">كل التصنيفات</option>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">كل الأشهر</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">إجمالي الدخل</span>
          <span className="font-bold text-teal-600">{formatMoney(totalIncome, state.settings.currency)}</span>
        </Card>
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">إجمالي المصروف</span>
          <span className="font-bold text-rose-500">{formatMoney(totalExpense, state.settings.currency)}</span>
        </Card>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="لا توجد عمليات مطابقة"
            description="جرّب تغيير الفلاتر أو أضف عملية جديدة"
          />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t) => (
              <TransactionRow key={t.id} transaction={t} onEdit={setEditing} />
            ))}
          </div>
        )}
      </Card>

      <TransactionForm open={Boolean(editing)} onClose={() => setEditing(null)} transaction={editing} />
    </div>
  )
}
