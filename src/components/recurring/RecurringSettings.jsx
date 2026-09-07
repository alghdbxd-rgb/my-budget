import { Pencil, Play, Plus, Repeat, Trash2 } from "lucide-react"
import { useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { currentMonthKey, formatMoney } from "../../lib/format"
import { categoryById } from "../../lib/selectors"
import { Button } from "../ui/Button"
import { Card, CardHeader } from "../ui/Card"
import { EmptyState } from "../ui/EmptyState"
import { RecurringForm } from "./RecurringForm"

export function RecurringSettings() {
  const { state, updateRecurring, deleteRecurring, runRecurringNow } = useBudget()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const thisMonthKey = currentMonthKey()
  const todayOfMonth = new Date().getDate()

  return (
    <Card>
      <CardHeader
        title="العمليات المتكررة"
        subtitle="مثل الراتب الشهري — تُضاف تلقائياً كل شهر بدون ما تدخلها يدوي"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            جديدة
          </Button>
        }
      />

      {state.recurring.length === 0 ? (
        <EmptyState icon={<Repeat size={22} />} title="لا توجد عمليات متكررة بعد" />
      ) : (
        <div className="flex flex-col gap-2">
          {state.recurring.map((r) => {
            const category = categoryById(state.categories, r.categoryId)
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 px-3.5 py-2.5 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                    {category?.name ?? "غير مصنف"} · {formatMoney(r.amount, state.settings.currency)}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
                    <span>
                      يوم {r.dayOfMonth} من كل شهر{r.note ? ` · ${r.note}` : ""}
                    </span>
                    {r.active &&
                      (r.lastRunKey === thisMonthKey ? (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-950/30 dark:text-green-400">
                          انسحبت هذا الشهر
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {r.dayOfMonth <= todayOfMonth
                            ? "قيد الانتظار"
                            : r.dayOfMonth - todayOfMonth === 0
                              ? "اليوم"
                              : `بعد ${r.dayOfMonth - todayOfMonth} يوم`}
                        </span>
                      ))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => updateRecurring(r.id, { active: !r.active })}
                    className={`relative h-6 w-10 shrink-0 rounded-full transition ${
                      r.active ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    aria-label="تفعيل/إيقاف"
                  >
                    <span
                      className={`absolute top-1 size-4 rounded-full bg-white transition-all ${
                        r.active ? "right-1" : "right-5"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => runRecurringNow(r.id)}
                    aria-label="تشغيل الآن"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-700"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(r)
                      setFormOpen(true)
                    }}
                    aria-label="تعديل"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("حذف هذه العملية المتكررة؟")) deleteRecurring(r.id)
                    }}
                    aria-label="حذف"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RecurringForm open={formOpen} onClose={() => setFormOpen(false)} rule={editing} />
    </Card>
  )
}
