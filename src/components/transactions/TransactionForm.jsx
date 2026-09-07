import { useEffect, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { guessCategoryId } from "../../lib/autoCategorize"
import { todayIso } from "../../lib/format"
import { toWesternDigits } from "../../lib/numeral"
import { INPUT_CLASS } from "../../lib/ui"
import { Button } from "../ui/Button"
import { FormDivider, FormSection, ModalFooter } from "../ui/FormSection"
import { Modal } from "../ui/Modal"

const TYPE_OPTIONS = [
  { value: "expense", label: "مصروف" },
  { value: "income", label: "دخل" },
  { value: "transfer", label: "تحويل" },
]

const emptyForm = (type, accountId) => ({
  type,
  amount: "",
  categoryId: "",
  accountId: accountId ?? "",
  toAccountId: "",
  date: todayIso(),
  note: "",
})

export function TransactionForm({ open, onClose, transaction }) {
  const { state, addTransaction, updateTransaction } = useBudget()
  const isEdit = Boolean(transaction)
  const defaultAccountId = state.accounts[0]?.id
  const [form, setForm] = useState(() =>
    transaction ? { ...transaction } : emptyForm("expense", defaultAccountId),
  )
  const [error, setError] = useState("")
  const [autoPicked, setAutoPicked] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(transaction ? { ...transaction } : emptyForm("expense", defaultAccountId))
      setError("")
      setAutoPicked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  const categories = state.categories.filter((c) => c.type === form.type)
  const isTransfer = form.type === "transfer"

  function applyNote(note) {
    setForm((f) => {
      const shouldAutoPick = !f.categoryId || autoPicked
      const guess = shouldAutoPick ? guessCategoryId(note, f.type, state.categories) : null
      if (guess) setAutoPicked(true)
      return { ...f, note, categoryId: guess ?? f.categoryId }
    })
  }

  function applyType(type) {
    if (type === "transfer") {
      setForm((f) => ({ ...f, type, categoryId: "" }))
      setAutoPicked(false)
      return
    }
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

    if (isTransfer) {
      if (!form.accountId || !form.toAccountId) {
        setError("الرجاء اختيار الحساب المرسل والمستقبل")
        return
      }
      if (form.accountId === form.toAccountId) {
        setError("لازم يكون الحساب المستقبل مختلف عن المرسل")
        return
      }
      const transferPayload = {
        type: "transfer",
        amount,
        accountId: form.accountId,
        toAccountId: form.toAccountId,
        date: form.date || todayIso(),
        note: form.note.trim(),
      }
      if (isEdit) {
        updateTransaction(transaction.id, transferPayload)
      } else {
        addTransaction(transferPayload)
      }
      onClose()
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
      accountId: form.accountId || defaultAccountId,
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormSection title="معلومات العملية">
          <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => applyType(opt.value)}
                className={`rounded py-2 text-sm font-bold transition ${
                  form.type === opt.value
                    ? opt.value === "expense"
                      ? "bg-rose-500 text-white shadow-sm"
                      : opt.value === "income"
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-slate-700 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">المبلغ</span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: toWesternDigits(e.target.value) }))}
                placeholder="0.00"
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التاريخ</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </FormSection>

        <FormDivider />

        <FormSection title={isTransfer ? "الحسابات" : "التصنيف والحساب"}>
          {isTransfer ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">من حساب</span>
                <select
                  value={form.accountId}
                  onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="">اختر حساب</option>
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">إلى حساب</span>
                <select
                  value={form.toAccountId}
                  onChange={(e) => setForm((f) => ({ ...f, toAccountId: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="">اختر حساب</option>
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">التصنيف</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    setAutoPicked(false)
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }}
                  className={INPUT_CLASS}
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
                  className={INPUT_CLASS}
                >
                  {state.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {!isTransfer && autoPicked && form.categoryId && (
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              🔎 اقترحنا هذا التصنيف تلقائياً من الملاحظة
            </span>
          )}
        </FormSection>

        <FormDivider />

        <FormSection title="تفاصيل إضافية">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              ملاحظة (اختياري)
            </span>
            <input
              type="text"
              value={form.note}
              onChange={(e) => (isTransfer ? setForm((f) => ({ ...f, note: e.target.value })) : applyNote(e.target.value))}
              placeholder={isTransfer ? "مثال: سحب من الماستر" : "مثال: تكسي، غداء، فاتورة كهرباء..."}
              className={INPUT_CLASS}
            />
          </label>
        </FormSection>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <ModalFooter>
          <Button type="submit">{isEdit ? "حفظ التعديلات" : "إضافة العملية"}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
