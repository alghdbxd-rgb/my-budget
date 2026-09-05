import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Receipt,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { TransactionForm } from "../components/transactions/TransactionForm"
import { TransactionRow } from "../components/transactions/TransactionRow"
import { Card, CardHeader } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { currentMonthKey, formatMoney, monthLabel } from "../lib/format"
import {
  accountBalances,
  budgetUsage,
  categoryBreakdown,
  debtsSummary,
  monthlyTrend,
  sumByType,
  totalBalance,
  transactionsForMonth,
} from "../lib/selectors"

function StatCard({ icon, label, value, tone }) {
  const tones = {
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
    rose: "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  }
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          {icon}
        </div>
        <p className="text-xs font-semibold leading-tight text-slate-400">{label}</p>
      </div>
      <p className="overflow-x-auto whitespace-nowrap text-base font-extrabold text-slate-800 dark:text-slate-100">
        {value}
      </p>
    </Card>
  )
}

export default function Dashboard() {
  const { state } = useBudget()
  const [editing, setEditing] = useState(null)
  const monthKey = currentMonthKey()
  const currency = state.settings.currency

  const monthTx = useMemo(() => transactionsForMonth(state.transactions, monthKey), [
    state.transactions,
    monthKey,
  ])
  const income = sumByType(monthTx, "income")
  const expense = sumByType(monthTx, "expense")
  const balance = totalBalance(state.transactions)
  const savingsRate = income > 0 ? Math.max(((income - expense) / income) * 100, 0) : 0

  const breakdown = useMemo(
    () => categoryBreakdown(monthTx, state.categories, "expense"),
    [monthTx, state.categories],
  )
  const trend = useMemo(() => monthlyTrend(state.transactions, 6), [state.transactions])
  const usage = useMemo(
    () => budgetUsage(state.transactions, state.categories, state.budgets, monthKey),
    [state.transactions, state.categories, state.budgets, monthKey],
  )
  const overBudget = usage.filter((u) => u.percent >= 90)
  const recent = state.transactions.slice(0, 6)
  const accounts = useMemo(
    () => accountBalances(state.transactions, state.accounts),
    [state.transactions, state.accounts],
  )
  const debts = useMemo(() => debtsSummary(state.debts), [state.debts])
  const hasDebts = debts.owedToMe > 0 || debts.owedByMe > 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          مرحباً بك في مصروفي 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">نظرة عامة على وضعك المالي - {monthLabel(monthKey)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<Wallet size={20} />}
          label="الرصيد الحالي"
          value={formatMoney(balance, currency)}
          tone={balance >= 0 ? "teal" : "rose"}
        />
        <StatCard
          icon={<ArrowDownLeft size={20} />}
          label="دخل هذا الشهر"
          value={formatMoney(income, currency)}
          tone="teal"
        />
        <StatCard
          icon={<ArrowUpRight size={20} />}
          label="مصروف هذا الشهر"
          value={formatMoney(expense, currency)}
          tone="rose"
        />
        <StatCard
          icon={<Receipt size={20} />}
          label="نسبة الادخار"
          value={`${savingsRate.toFixed(0)}%`}
          tone="slate"
        />
      </div>

      {overBudget.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={20} />
            <div className="min-w-0">
              <p className="font-bold text-amber-700 dark:text-amber-400">تنبيه ميزانية</p>
              <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-400/80">
                {overBudget.map((u) => u.name).join("، ")} تجاوزت أو اقتربت من الحد الشهري المحدد.{" "}
                <Link to="/budgets" className="font-semibold underline">
                  عرض الميزانيات
                </Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader
            title="أرصدة الحسابات"
            action={
              <Link to="/settings" className="text-sm font-semibold text-teal-600 hover:underline">
                إدارة
              </Link>
            }
          />
          <div className="flex flex-col gap-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 min-w-0 text-slate-600 dark:text-slate-300">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="truncate">{a.name}</span>
                </span>
                <span
                  className={`shrink-0 font-bold ${a.balance >= 0 ? "text-slate-700 dark:text-slate-200" : "text-rose-500"}`}
                >
                  {formatMoney(a.balance, currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="الديون والسلف"
            action={
              <Link to="/debts" className="text-sm font-semibold text-teal-600 hover:underline">
                عرض الكل
              </Link>
            }
          />
          {!hasDebts ? (
            <EmptyState icon={<HandCoins size={22} />} title="لا توجد ديون مسجلة" />
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">مدينون لي</span>
                <span className="font-bold text-teal-600">{formatMoney(debts.owedToMe, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">أنا مدين</span>
                <span className="font-bold text-rose-500">{formatMoney(debts.owedByMe, currency)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="مصروفات الشهر حسب التصنيف" />
          {breakdown.length === 0 ? (
            <EmptyState title="لا توجد مصروفات مسجلة هذا الشهر" />
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
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
              <div className="mt-2 flex flex-col gap-2">
                {breakdown.slice(0, 5).map((b) => (
                  <div key={b.categoryId} className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">
                      {b.name}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                      {b.percent.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="الدخل مقابل المصروف - آخر 6 أشهر" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="key"
                  tickFormatter={(k) => monthLabel(k).split(" ")[0]}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(k) => monthLabel(k)}
                  formatter={(value, name) => [
                    formatMoney(value, currency),
                    name === "income" ? "دخل" : "مصروف",
                  ]}
                  contentStyle={{ direction: "rtl", borderRadius: 12, fontSize: 13 }}
                />
                <Bar dataKey="income" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={22} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="أحدث العمليات"
          action={
            <Link to="/transactions" className="text-sm font-semibold text-teal-600 hover:underline">
              عرض الكل
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="لا توجد عمليات بعد"
            description="ابدأ بإضافة أول دخل أو مصروف لك"
          />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t) => (
              <TransactionRow key={t.id} transaction={t} onEdit={setEditing} />
            ))}
          </div>
        )}
      </Card>

      <TransactionForm open={Boolean(editing)} onClose={() => setEditing(null)} transaction={editing} />
    </div>
  )
}
