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
  "#0d9488",
  "#64748b",
]

export function CategoryForm({ open, onClose, category, defaultType = "expense" }) {
  const { addCategory, updateCategory } = useBudget()
  const isEdit = Boolean(category)
  const [name, setName] = useState("")
  const [type, setType] = useState(defaultType)
  const [color, setColor] = useState(PALETTE[0])
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setType(category?.type ?? defaultType)
      setColor(category?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)])
      setError("")
    }
  }, [open, category, defaultType])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError("الرجاء إدخال اسم التصنيف")
      return
    }
    if (isEdit) {
      updateCategory(category.id, { name: name.trim(), type, color })
    } else {
      addCategory({ name: name.trim(), type, color })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل التصنيف" : "تصنيف جديد"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { value: "expense", label: "مصروف" },
            { value: "income", label: "دخل" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`rounded-lg py-2 text-sm font-bold transition ${
                type === opt.value
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">اسم التصنيف</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: صيانة السيارة"
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
                className="size-7 rounded-full ring-offset-2 transition"
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
            {isEdit ? "حفظ التعديلات" : "إضافة التصنيف"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
