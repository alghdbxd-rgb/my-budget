import { useEffect, useState } from "react"
import { INPUT_CLASS } from "../../lib/ui"
import { useBudget } from "../../context/BudgetContext"
import { Button } from "../ui/Button"
import { ModalFooter } from "../ui/FormSection"
import { Modal } from "../ui/Modal"

const PALETTE = [
  "#0f766e",
  "#0891b2",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#e11d48",
  "#ea580c",
  "#ca8a04",
  "#65a30d",
]

export function AccountForm({ open, onClose, account }) {
  const { addAccount, updateAccount } = useBudget()
  const isEdit = Boolean(account)
  const [name, setName] = useState("")
  const [color, setColor] = useState(PALETTE[0])
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "")
      setColor(account?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)])
      setError("")
    }
  }, [open, account])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError("الرجاء إدخال اسم الحساب")
      return
    }
    if (isEdit) {
      updateAccount(account.id, { name: name.trim(), color })
    } else {
      addAccount({ name: name.trim(), color })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الحساب" : "حساب جديد"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">اسم الحساب</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: نقد، ماستر، بنك..."
            className={INPUT_CLASS}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">اللون</span>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className="size-7 rounded-full transition"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <ModalFooter>
          <Button type="submit">
            {isEdit ? "حفظ التعديلات" : "إضافة الحساب"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
