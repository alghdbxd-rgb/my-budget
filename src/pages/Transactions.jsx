import { ArrowLeftRight, ChevronDown, ChevronUp, Pencil, Plus, Receipt, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TransactionForm } from "../components/transactions/TransactionForm"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { formatMoney, formatShortDate, monthKey as getMonthKey, monthLabel } from "../lib/format"
import { accountById, categoryById, sumByType } from "../lib/selectors"

function SortHeader({ label, active, dir, onClick, align = "right" }) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-4 py-2.5 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 ${
        align === "left" ? "text-left" : "text-right"
      }`}
    >
      <span className={`flex items-center gap-1 ${align === "left" ? "justify-start" : "justify-end"}`}>
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : null}
      </span>
    </th>
  )
}

export default function Transactions() {
  const { state, deleteTransaction } = useBudget()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState("all")
  const [categoryId, setCategoryId] = useState("all")
  const [month, setMonth] = useState("all")
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [sort, setSort] = useState({ key: "date", dir: "desc" })

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }))
  }

  const monthOptions = useMemo(() => {
    const set = new Set(state.transactions.map((t) => getMonthKey(t.date)))
    return [...set].sort().reverse()
  }, [state.transactions])

  const filtered = useMemo(() => {
    const rows = state.transactions.filter((t) => {
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
    const sorted = [...rows].sort((a, b) => {
      const va = sort.key === "amount" ? a.amount : new Date(a.date).getTime()
      const vb = sort.key === "amount" ? b.amount : new Date(b.date).getTime()
      return sort.dir === "asc" ? va - vb : vb - va
    })
    return sorted
  }, [state.transactions, state.categories, type, categoryId, month, search, sort])

  const totalIncome = sumByType(filtered, "income")
  const totalExpense = sumByType(filtered, "expense")

  function handleDelete(id) {
    if (window.confirm("حذف هذه العملية نهائياً؟")) deleteTransaction(id)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">العمليات</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {filtered.length} عملية {search || type !== "all" || categoryId !== "all" || month !== "all" ? "مطابقة" : "مسجّلة"}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700"
        >
          <Plus size={15} />
          عملية جديدة
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <Card className="flex items-center justify-between !p-3.5">
          <span className="text-xs font-semibold text-slate-500">إجمالي الدخل</span>
          <span className="font-bold text-green-600">{formatMoney(totalIncome, state.settings.currency)}</span>
        </Card>
        <Card className="flex items-center justify-between !p-3.5">
          <span className="text-xs font-semibold text-slate-500">إجمالي المصروف</span>
          <span className="font-bold text-rose-500">{formatMoney(totalExpense, state.settings.currency)}</span>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">النوع: الكل</option>
          <option value="income">دخل</option>
          <option value="expense">مصروف</option>
          <option value="transfer">تحويل</option>
        </select>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">التصنيف: الكل</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="all">الشهر: الكل</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <div className="relative w-full sm:w-56">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (searchParams.get("q")) setSearchParams({})
            }}
            placeholder="ابحث بالتصنيف أو الملاحظة..."
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pr-8 pl-2.5 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="لا توجد عمليات مطابقة"
            description="جرّب تغيير الفلاتر أو أضف عملية جديدة"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                  <SortHeader
                    label="التاريخ"
                    active={sort.key === "date"}
                    dir={sort.dir}
                    onClick={() => toggleSort("date")}
                  />
                  <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                    الوصف
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                    التصنيف
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                    الحساب
                  </th>
                  <SortHeader
                    label="المبلغ"
                    active={sort.key === "amount"}
                    dir={sort.dir}
                    onClick={() => toggleSort("amount")}
                    align="left"
                  />
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isTransfer = t.type === "transfer"
                  const isIncome = t.type === "income"
                  const category = !isTransfer ? categoryById(state.categories, t.categoryId) : null
                  const fromAccount = accountById(state.accounts, t.accountId)
                  const toAccount = isTransfer ? accountById(state.accounts, t.toAccountId) : null

                  return (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500 dark:text-slate-400">
                        {formatShortDate(t.date)}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                        {isTransfer ? (
                          <span className="flex items-center gap-1.5">
                            <ArrowLeftRight size={13} className="text-slate-400" />
                            تحويل: {fromAccount?.name ?? "؟"} ← {toAccount?.name ?? "؟"}
                          </span>
                        ) : (
                          (t.note || category?.name || "بدون وصف")
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isTransfer ? (
                          <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: "#64748b1a", color: "#64748b" }}>
                            تحويل
                          </span>
                        ) : (
                          <span
                            className="rounded px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: `${category?.color ?? "#94a3b8"}1a`, color: category?.color ?? "#94a3b8" }}
                          >
                            {category?.name ?? "غير مصنف"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{fromAccount?.name ?? "—"}</td>
                      <td
                        className={`px-4 py-2.5 text-left font-semibold tabular-nums ${
                          isTransfer ? "text-slate-500 dark:text-slate-400" : isIncome ? "text-green-600" : "text-rose-500"
                        }`}
                      >
                        {!isTransfer && (isIncome ? "+" : "-")}
                        {formatMoney(t.amount, state.settings.currency)}
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            aria-label="تعديل"
                            onClick={() => {
                              setEditing(t)
                              setFormOpen(true)
                            }}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            aria-label="حذف"
                            onClick={() => handleDelete(t.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        transaction={editing}
      />
    </div>
  )
}
