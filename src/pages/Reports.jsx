import { Download } from "lucide-react"
import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "../components/ui/Button"
import { Card, CardHeader } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import {
  currentMonthKey,
  formatCompactNumber,
  formatMoney,
  monthKey as getMonthKey,
  monthLabel,
} from "../lib/format"
import { categoryBreakdown, monthlyTrend, sumByType, transactionsForMonth } from "../lib/selectors"

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { state } = useBudget()
  const [month, setMonth] = useState(currentMonthKey())
  const [reportType, setReportType] = useState("expense")
  const currency = state.settings.currency

  const monthOptions = useMemo(() => {
    const set = new Set([currentMonthKey(), ...state.transactions.map((t) => getMonthKey(t.date))])
    return [...set].sort().reverse()
  }, [state.transactions])

  const monthTx = useMemo(() => transactionsForMonth(state.transactions, month), [
    state.transactions,
    month,
  ])
  const breakdown = useMemo(
    () => categoryBreakdown(monthTx, state.categories, reportType),
    [monthTx, state.categories, reportType],
  )
  const trend = useMemo(() => monthlyTrend(state.transactions, 12), [state.transactions])
  const totalIncome = sumByType(monthTx, "income")
  const totalExpense = sumByType(monthTx, "expense")

  function exportCsv() {
    const header = "التصنيف,النوع,القيمة,النسبة%"
    const rows = breakdown.map((b) => `${b.name},${reportType === "income" ? "دخل" : "مصروف"},${b.value},${b.percent.toFixed(1)}`)
    downloadFile(`تقرير-${month}.csv`, ["﻿" + header, ...rows].join("\n"), "text/csv;charset=utf-8")
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">التقارير</h1>
          <p className="mt-1 text-sm text-slate-400">تحليل تفصيلي لدخلك ومصروفاتك</p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">إجمالي الدخل</span>
          <span className="font-bold text-teal-600">{formatMoney(totalIncome, currency)}</span>
        </Card>
        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">إجمالي المصروف</span>
          <span className="font-bold text-rose-500">{formatMoney(totalExpense, currency)}</span>
        </Card>
      </div>

      <Card>
        <CardHeader title="الاتجاه على مدار 12 شهراً" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="key"
                tickFormatter={(k) => monthLabel(k).split(" ")[0]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={formatCompactNumber}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                labelFormatter={(k) => monthLabel(k)}
                formatter={(value, name) => [formatMoney(value, currency), name === "income" ? "دخل" : "مصروف"]}
                contentStyle={{ direction: "rtl", borderRadius: 12, fontSize: 13 }}
              />
              <Legend formatter={(name) => (name === "income" ? "دخل" : "مصروف")} />
              <Line type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`تفصيل ${monthLabel(month)} حسب التصنيف`}
          action={
            <div className="flex items-center gap-2">
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {[
                  { value: "expense", label: "مصروف" },
                  { value: "income", label: "دخل" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReportType(opt.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      reportType === opt.value
                        ? "bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-400"
                        : "text-slate-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {breakdown.length > 0 && (
                <Button variant="secondary" onClick={exportCsv}>
                  <Download size={14} />
                  CSV
                </Button>
              )}
            </div>
          }
        />
        {breakdown.length === 0 ? (
          <EmptyState title="لا توجد بيانات لهذا الشهر" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" outerRadius={90} strokeWidth={0}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatMoney(value, currency)}
                    contentStyle={{ direction: "rtl", borderRadius: 12, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 self-center">
              {breakdown.map((b) => (
                <div key={b.categoryId} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">{b.name}</span>
                  <span className="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                    {formatMoney(b.value, currency)}
                  </span>
                  <span className="w-12 shrink-0 text-left font-bold text-slate-400">
                    {b.percent.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
