import { Pencil, Pin, PinOff, Plus, Search, StickyNote, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { NoteForm } from "../components/notes/NoteForm"
import { Button } from "../components/ui/Button"
import { EmptyState } from "../components/ui/EmptyState"
import { useBudget } from "../context/BudgetContext"
import { formatDateTime } from "../lib/format"
import { sortedNotes } from "../lib/selectors"

function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border-r-4 bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-900"
      style={{ borderColor: note.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate font-bold text-slate-800 dark:text-slate-100">
          {note.title || "بدون عنوان"}
        </h3>
        <button
          onClick={() => onTogglePin(note.id)}
          aria-label={note.pinned ? "إلغاء التثبيت" : "تثبيت"}
          className={`shrink-0 rounded-lg p-1 ${
            note.pinned
              ? "text-amber-500"
              : "text-slate-300 hover:text-slate-400 dark:text-slate-600"
          }`}
        >
          {note.pinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
        </button>
      </div>

      {note.content && (
        <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {note.content}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-400 dark:border-slate-800">
        <span>{formatDateTime(note.updatedAt)}</span>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(note)}
            aria-label="تعديل"
            className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            aria-label="حذف"
            className="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Notes() {
  const { state, deleteNote, toggleNotePin } = useBudget()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const visible = useMemo(() => {
    const list = sortedNotes(state.notes)
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    )
  }, [state.notes, search])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">الملاحظات</h1>
          <p className="mt-1 text-sm text-slate-400">دوّن أي شي مهم — أفكار، أرقام، مواعيد، تذكيرات</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus size={16} />
          ملاحظة جديدة
        </Button>
      </div>

      {state.notes.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان أو المحتوى..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<StickyNote size={22} />}
          title={state.notes.length === 0 ? "لا توجد ملاحظات بعد" : "لا توجد نتائج مطابقة"}
          description={
            state.notes.length === 0 ? "اضغط (ملاحظة جديدة) لتدوين أول شي مهم" : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onEdit={(note) => {
                setEditing(note)
                setFormOpen(true)
              }}
              onDelete={(id) => {
                if (window.confirm("حذف هذه الملاحظة نهائياً؟")) deleteNote(id)
              }}
              onTogglePin={toggleNotePin}
            />
          ))}
        </div>
      )}

      <NoteForm open={formOpen} onClose={() => setFormOpen(false)} note={editing} />
    </div>
  )
}
