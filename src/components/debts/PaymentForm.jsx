import { useEffect, useState } from "react"
import { INPUT_CLASS } from "../../lib/ui"
import { useBudget } from "../../context/BudgetContext"
import { formatMoney, todayIso } from "../../lib/format"
import { toWesternDigits } from "../../lib/numeral"
import { debtRemaining } from "../../lib/selectors"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

export function PaymentForm({ open, onClose, debt }) {
  const { state, addDebtPayment } = useBudget()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  const remaining = debt ? debtRemaining(debt) : 0

  useEffect(() => {
    if (open) {
      setAmount(remaining > 0 ? String(remaining) : "")
      setDate(todayIso())
      setNote("")
      setError("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debt])

  if (!debt) return null

  function handleSubmit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) {
      setError("الرجاء إدخال مبلغ صحيح أكبر من صفر")
      return
    }
    addDebtPayment(debt.id, { amount: value, date: date || todayIso(), note: note.trim() })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`تسديد دفعة — ${debt.person}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          المتبقي حالياً:{" "}
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {formatMoney(remaining, state.settings.currency)}
          </span>
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">مبلغ الدفعة</span>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(toWesternDigits(e.target.value))}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التاريخ</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            ملاحظة (اختياري)
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-2 flex items-center justify-start gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button type="submit">
            تسجيل الدفعة
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
