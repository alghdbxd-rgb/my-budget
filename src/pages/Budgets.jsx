import { Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { CategoryForm } from "../components/categories/CategoryForm"
import { Button } from "../components/ui/Button"
import { Card, CardHeader } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { currentMonthKey, formatMoney } from "../lib/format"
import { budgetUsage } from "../lib/selectors"

function BudgetRow({ category, limit, currency, onChangeLimit, onRemove }) {
  const { state } = useBudget()
  const usage = useMemo(
    () => budgetUsage(state.transactions, state.categories, { [category.id]: limit }, currentMonthKey()),
    [state.transactions, state.categories, category.id, limit],
  )[0]
  const spent = usage?.spent ?? 0
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const over = limit > 0 && spent > limit

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={limit || ""}
            onChange={(e) => onChangeLimit(Number(e.target.value) || 0)}
            placeholder="بلا حد"
            className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {limit > 0 && (
            <button
              onClick={onRemove}
              aria-label="إزالة الحد"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {limit > 0 && (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${over ? "bg-rose-500" : "bg-teal-500"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-slate-400">
            {formatMoney(spent, currency)} من {formatMoney(limit, currency)}{" "}
            {over && <span className="text-rose-500">(تم تجاوز الحد)</span>}
          </p>
        </>
      )}
    </div>
  )
}

export default function Budgets() {
  const { state, setBudget, removeBudget, deleteCategory } = useBudget()
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [tab, setTab] = useState("expense")

  const expenseCategories = state.categories.filter((c) => c.type === "expense")
  const visibleCategories = state.categories.filter((c) => c.type === tab)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">الميزانيات والتصنيفات</h1>
        <p className="mt-1 text-sm text-slate-400">حدد سقفاً شهرياً لكل تصنيف وتابع إنفاقك</p>
      </div>

      <Card>
        <CardHeader title="الحدود الشهرية للمصروفات" subtitle="اترك الحقل فارغاً لعدم وضع حد" />
        {expenseCategories.length === 0 ? (
          <EmptyState title="أضف تصنيف مصروف أولاً" />
        ) : (
          <div className="flex flex-col gap-3">
            {expenseCategories.map((cat) => (
              <BudgetRow
                key={cat.id}
                category={cat}
                limit={state.budgets[cat.id] ?? 0}
                currency={state.settings.currency}
                onChangeLimit={(value) => (value > 0 ? setBudget(cat.id, value) : removeBudget(cat.id))}
                onRemove={() => removeBudget(cat.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="التصنيفات"
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setEditingCategory(null)
                setCategoryFormOpen(true)
              }}
            >
              <Plus size={16} />
              تصنيف جديد
            </Button>
          }
        />
        <div className="mb-3 flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "expense", label: "مصروفات" },
            { value: "income", label: "دخل" },
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
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {cat.name}
                </span>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => {
                    setEditingCategory(cat)
                    setCategoryFormOpen(true)
                  }}
                  aria-label="تعديل"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`هل تريد حذف تصنيف "${cat.name}"؟ سيتم حذف كل العمليات المرتبطة به.`)) {
                      deleteCategory(cat.id)
                    }
                  }}
                  aria-label="حذف"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <CategoryForm
        open={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        category={editingCategory}
        defaultType={tab}
      />
    </div>
  )
}
