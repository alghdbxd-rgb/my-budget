import { useEffect, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { toWesternDigits } from "../../lib/numeral"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

const emptyForm = (type, accountId) => ({
  type,
  amount: "",
  categoryId: "",
  accountId: accountId ?? "",
  dayOfMonth: "1",
  note: "",
})

export function RecurringForm({ open, onClose, rule }) {
  const { state, addRecurring, updateRecurring } = useBudget()
  const isEdit = Boolean(rule)
  const defaultAccountId = state.accounts[0]?.id
  const [form, setForm] = useState(() => (rule ? { ...rule } : emptyForm("expense", defaultAccountId)))
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setForm(rule ? { ...rule } : emptyForm("expense", defaultAccountId))
      setError("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rule])

  const categories = state.categories.filter((c) => c.type === form.type)

  function handleSubmit(e) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) {
      setError("الرجاء إدخال مبلغ صحيح أكبر من صفر")
      return
    }
    if (!form.categoryId) {
      setError("الرجاء اختيار تصنيف")
      return
    }
    const dayOfMonth = Math.min(Math.max(Number(form.dayOfMonth) || 1, 1), 28)
    const payload = {
      type: form.type,
      amount,
      categoryId: form.categoryId,
      accountId: form.accountId || defaultAccountId,
      dayOfMonth,
      note: form.note.trim(),
    }
    if (isEdit) {
      updateRecurring(rule.id, payload)
    } else {
      addRecurring(payload)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل العملية المتكررة" : "عملية متكررة جديدة"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "expense", label: "مصروف" },
            { value: "income", label: "دخل" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: opt.value, categoryId: "" }))}
              className={`rounded-lg py-2 text-sm font-bold transition ${
                form.type === opt.value
                  ? opt.value === "expense"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-teal-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">المبلغ</span>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: toWesternDigits(e.target.value) }))}
            placeholder="0.00"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التصنيف</span>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">اختر تصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">الحساب</span>
          <select
            value={form.accountId}
            onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            يوم التكرار كل شهر (1-28)
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.dayOfMonth}
            onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: toWesternDigits(e.target.value) }))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            ملاحظة (اختياري)
          </span>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="مثال: الراتب الشهري"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Button type="submit" className="flex-1">
            {isEdit ? "حفظ التعديلات" : "إضافة"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
