import { useEffect, useState } from "react"
import { useBudget } from "../../context/BudgetContext"
import { NOTE_COLORS } from "../../lib/defaultData"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

export function NoteForm({ open, onClose, note }) {
  const { addNote, updateNote } = useBudget()
  const isEdit = Boolean(note)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState(NOTE_COLORS[0])
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "")
      setContent(note?.content ?? "")
      setColor(note?.color ?? NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)])
      setError("")
    }
  }, [open, note])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) {
      setError("اكتب عنوان أو محتوى على الأقل")
      return
    }
    const payload = { title: title.trim(), content: content.trim(), color }
    if (isEdit) {
      updateNote(note.id, payload)
    } else {
      addNote(payload)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الملاحظة" : "ملاحظة جديدة"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">العنوان</span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: أرقام مهمة، أفكار، مواعيد..."
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">المحتوى</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب تفاصيل الملاحظة هنا..."
            rows={7}
            className="resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">اللون</span>
          <div className="flex flex-wrap gap-2">
            {NOTE_COLORS.map((c) => (
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

        <div className="mt-1 flex gap-2">
          <Button type="submit" className="flex-1">
            {isEdit ? "حفظ التعديلات" : "إضافة الملاحظة"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
