import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react"
import { useBudget } from "../../context/BudgetContext"
import { formatMoney, formatShortDate } from "../../lib/format"
import { categoryById } from "../../lib/selectors"

export function TransactionRow({ transaction, onEdit, dense = false }) {
  const { state, deleteTransaction } = useBudget()
  const category = categoryById(state.categories, transaction.categoryId)
  const isIncome = transaction.type === "income"

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${category?.color ?? "#94a3b8"}1a`,
          color: category?.color ?? "#94a3b8",
        }}
      >
        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
          {category?.name ?? "غير مصنف"}
        </p>
        <p className="truncate text-xs text-slate-400">
          {transaction.note ? `${transaction.note} · ` : ""}
          {formatShortDate(transaction.date)}
        </p>
      </div>

      <p
        className={`shrink-0 text-sm font-bold ${
          isIncome ? "text-teal-600" : "text-rose-500"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatMoney(transaction.amount, state.settings.currency)}
      </p>

      {!dense && (
        <div className="flex shrink-0 gap-1">
          <button
            aria-label="تعديل"
            onClick={() => onEdit?.(transaction)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <Pencil size={14} />
          </button>
          <button
            aria-label="حذف"
            onClick={() => deleteTransaction(transaction.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
