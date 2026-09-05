import { useEffect, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { todayIso } from "../../lib/format"
import { toWesternDigits } from "../../lib/numeral"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

const emptyForm = (direction) => ({
  person: "",
  direction,
  amount: "",
  date: todayIso(),
  note: "",
})

export function DebtForm({ open, onClose, defaultDirection = "owed_by_me" }) {
  const { addDebt } = useBudget()
  const [form, setForm] = useState(() => emptyForm(defaultDirection))
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultDirection))
      setError("")
    }
  }, [open, defaultDirection])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.person.trim()) {
      setError("الرجاء إدخال اسم الشخص")
      return
    }
    const amount = Number(form.amount)
    if (!amount || amount <= 0) {
      setError("الرجاء إدخال مبلغ صحيح أكبر من صفر")
      return
    }
    addDebt({
      person: form.person.trim(),
      direction: form.direction,
      amount,
      date: form.date || todayIso(),
      note: form.note.trim(),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="دين جديد">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "owed_by_me", label: "علي (أنا مدين)" },
            { value: "owed_to_me", label: "لي (مدينون لي)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, direction: opt.value }))}
              className={`rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
                form.direction === opt.value
                  ? opt.value === "owed_by_me"
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
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">الشخص</span>
          <input
            type="text"
            autoFocus
            value={form.person}
            onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))}
            placeholder="مثال: أمي، كرار، عمر..."
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">المبلغ</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: toWesternDigits(e.target.value) }))}
            placeholder="0.00"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
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

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            ملاحظة (اختياري)
          </span>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="مثال: سلفة، قسط..."
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Button type="submit" className="flex-1">
            إضافة الدين
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
