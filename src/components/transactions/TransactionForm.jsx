import { useEffect, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { guessCategoryId } from "../../lib/autoCategorize"
import { todayIso } from "../../lib/format"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

const emptyForm = (type) => ({
  type,
  amount: "",
  categoryId: "",
  date: todayIso(),
  note: "",
})

export function TransactionForm({ open, onClose, transaction }) {
  const { state, addTransaction, updateTransaction } = useBudget()
  const isEdit = Boolean(transaction)
  const [form, setForm] = useState(() => (transaction ? { ...transaction } : emptyForm("expense")))
  const [error, setError] = useState("")
  const [autoPicked, setAutoPicked] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(transaction ? { ...transaction } : emptyForm("expense"))
      setError("")
      setAutoPicked(false)
    }
  }, [open, transaction])

  const categories = state.categories.filter((c) => c.type === form.type)

  function applyNote(note) {
    setForm((f) => {
      const shouldAutoPick = !f.categoryId || autoPicked
      const guess = shouldAutoPick ? guessCategoryId(note, f.type, state.categories) : null
      if (guess) setAutoPicked(true)
      return { ...f, note, categoryId: guess ?? f.categoryId }
    })
  }

  function applyType(type) {
    const guess = guessCategoryId(form.note, type, state.categories)
    setForm((f) => ({ ...f, type, categoryId: guess ?? "" }))
    setAutoPicked(Boolean(guess))
  }

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
    const payload = {
      type: form.type,
      amount,
      categoryId: form.categoryId,
      date: form.date || todayIso(),
      note: form.note.trim(),
    }
    if (isEdit) {
      updateTransaction(transaction.id, payload)
    } else {
      addTransaction(payload)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل العملية" : "عملية جديدة"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "expense", label: "مصروف" },
            { value: "income", label: "دخل" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyType(opt.value)}
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
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoFocus
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
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
            onChange={(e) => applyNote(e.target.value)}
            placeholder="مثال: تكسي، غداء، فاتورة كهرباء..."
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التصنيف</span>
          <select
            value={form.categoryId}
            onChange={(e) => {
              setAutoPicked(false)
              setForm((f) => ({ ...f, categoryId: e.target.value }))
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">اختر تصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {autoPicked && form.categoryId && (
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              🔎 اقترحنا هذا التصنيف تلقائياً من الملاحظة
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التاريخ</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Button type="submit" className="flex-1">
            {isEdit ? "حفظ التعديلات" : "إضافة العملية"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
