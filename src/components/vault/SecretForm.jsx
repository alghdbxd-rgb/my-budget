import { useEffect, useState } from "react"
import { useVault } from "../../context/VaultContext"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

export function SecretForm({ open, onClose, entry }) {
  const { addEntry, updateEntry } = useVault()
  const isEdit = Boolean(entry)
  const [title, setTitle] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(entry?.title ?? "")
      setUsername(entry?.username ?? "")
      setPassword(entry?.password ?? "")
      setNote(entry?.note ?? "")
      setError("")
    }
  }, [open, entry])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError("الرجاء إدخال اسم الحساب")
      return
    }
    const payload = {
      title: title.trim(),
      username: username.trim(),
      password,
      note: note.trim(),
    }
    setBusy(true)
    if (isEdit) {
      await updateEntry(entry.id, payload)
    } else {
      await addEntry(payload)
    }
    setBusy(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الحساب" : "حساب جديد بالخزنة"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">اسم الحساب</span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: البنك الأهلي، فيسبوك، إيميل..."
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            اسم المستخدم / البريد
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">كلمة المرور</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            ملاحظات / أكواد إضافية (اختياري)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="مثال: رمز التحقق الاحتياطي، رقم الحساب، PIN..."
            className="resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Button type="submit" disabled={busy} className="flex-1">
            {isEdit ? "حفظ التعديلات" : "إضافة الحساب"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}
