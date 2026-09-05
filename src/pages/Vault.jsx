import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { EmptyState } from "../components/ui/EmptyState"
import { SecretForm } from "../components/vault/SecretForm"
import { VaultSetup } from "../components/vault/VaultSetup"
import { VaultUnlock } from "../components/vault/VaultUnlock"
import { useLock } from "../context/LockContext"
import { useVault } from "../context/VaultContext"
import { formatDateTime } from "../lib/format"

function copyToClipboard(text) {
  try {
    navigator.clipboard?.writeText(text)
    return true
  } catch {
    return false
  }
}

function SecretCard({ entry, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState("")

  function handleCopy(field, value) {
    if (!value) return
    copyToClipboard(value)
    setCopied(field)
    setTimeout(() => setCopied(""), 1500)
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate font-bold text-slate-800 dark:text-slate-100">
          {entry.title}
        </h3>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(entry)}
            aria-label="تعديل"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            aria-label="حذف"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {entry.username && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
          <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">
            {entry.username}
          </span>
          <button
            onClick={() => handleCopy("username", entry.username)}
            className="shrink-0 text-slate-400 hover:text-teal-600"
            aria-label="نسخ اسم المستخدم"
          >
            {copied === "username" ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {entry.password && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
          <span className="min-w-0 flex-1 truncate font-mono text-slate-600 dark:text-slate-300">
            {showPassword ? entry.password : "•".repeat(Math.min(entry.password.length, 12))}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "إخفاء" : "إظهار"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => handleCopy("password", entry.password)}
              className="text-slate-400 hover:text-teal-600"
              aria-label="نسخ كلمة المرور"
            >
              {copied === "password" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {entry.note && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          {entry.note}
        </p>
      )}

      <p className="text-[11px] text-slate-300 dark:text-slate-600">
        آخر تحديث: {formatDateTime(entry.updatedAt)}
      </p>
    </div>
  )
}

export default function Vault() {
  const { hasPassword } = useLock()
  const { hasVault, unlocked, entries, lockVault, deleteEntry } = useVault()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const visible = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.trim().toLowerCase()
    return entries.filter(
      (e) => e.title.toLowerCase().includes(q) || e.username.toLowerCase().includes(q),
    )
  }, [entries, search])

  if (!hasPassword) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="flex flex-col items-center gap-3 text-center">
          <Lock size={28} className="text-slate-300" />
          <p className="font-bold text-slate-700 dark:text-slate-200">
            فعّل قفل التطبيق أولاً
          </p>
          <p className="text-sm text-slate-400">
            الخزنة الآمنة تتطلب تفعيل قفل التطبيق بكلمة مرور قبل إنشائها.
          </p>
          <Link to="/settings">
            <Button>الذهاب إلى الإعدادات</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!hasVault) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            حماية وخصوصية
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            خزنة مشفّرة لحفظ يوزرات وباسوردات ومعلومات حساباتك المهمة
          </p>
        </div>
        <VaultSetup />
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            حماية وخصوصية
          </h1>
        </div>
        <VaultUnlock />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            حماية وخصوصية
          </h1>
          <p className="mt-1 text-sm text-slate-400">يوزرات، باسوردات، ورموز حساباتك — مشفّرة بالكامل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={lockVault}>
            <Lock size={16} />
            قفل الخزنة
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            حساب جديد
          </Button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو المستخدم..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<KeyRound size={22} />}
          title={entries.length === 0 ? "لا توجد حسابات محفوظة بعد" : "لا توجد نتائج مطابقة"}
          description={entries.length === 0 ? "اضغط (حساب جديد) لإضافة أول حساب" : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entry) => (
            <SecretCard
              key={entry.id}
              entry={entry}
              onEdit={(e) => {
                setEditing(e)
                setFormOpen(true)
              }}
              onDelete={(id) => {
                if (window.confirm("حذف هذا الحساب نهائياً من الخزنة؟")) deleteEntry(id)
              }}
            />
          ))}
        </div>
      )}

      <SecretForm open={formOpen} onClose={() => setFormOpen(false)} entry={editing} />
    </div>
  )
}
