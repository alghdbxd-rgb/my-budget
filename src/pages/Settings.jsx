import { Download, Moon, Sun, Trash2, Upload, Wallet } from "lucide-react"
import { useRef, useState } from "react"
import { AccountsSettings } from "../components/accounts/AccountsSettings"
import { SecuritySettings } from "../components/lock/SecuritySettings"
import { RecurringSettings } from "../components/recurring/RecurringSettings"
import { Button } from "../components/ui/Button"
import { Card, CardHeader } from "../components/ui/Card"
import { useBudget } from "../context/BudgetContext"
import { CURRENCIES } from "../lib/defaultData"

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Settings() {
  const { state, updateSettings, replaceAll, resetAll } = useBudget()
  const fileInputRef = useRef(null)
  const [message, setMessage] = useState("")
  const isDark = state.settings.theme === "dark"

  function handleExport() {
    downloadFile(
      `sueilia-budget-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(state, null, 2),
      "application/json",
    )
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        replaceAll(parsed)
        setMessage("تم استيراد البيانات بنجاح")
      } catch {
        setMessage("تعذر قراءة الملف، تأكد أنه نسخة احتياطية صحيحة")
      }
      setTimeout(() => setMessage(""), 3500)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  function handleReset() {
    if (
      window.confirm(
        "سيتم حذف جميع العمليات والتصنيفات والميزانيات نهائياً والعودة للإعدادات الافتراضية. هل أنت متأكد؟",
      )
    ) {
      resetAll()
      setMessage("تمت إعادة ضبط النظام")
      setTimeout(() => setMessage(""), 3500)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">الإعدادات</h1>
        <p className="mt-1 text-sm text-slate-400">تخصيص مصروفي وإدارة بياناتك</p>
      </div>

      {message && (
        <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 dark:bg-teal-950/30 dark:text-teal-400">
          {message}
        </div>
      )}

      <Card>
        <CardHeader title="المظهر" />
        <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            {isDark ? "الوضع الداكن مفعّل" : "الوضع الفاتح مفعّل"}
          </div>
          <button
            onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
            aria-label="تبديل الوضع الداكن"
            className={`relative h-7 w-12 rounded-full transition ${isDark ? "bg-teal-600" : "bg-slate-200"}`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-white transition-all ${
                isDark ? "right-1" : "right-6"
              }`}
            />
          </button>
        </div>
      </Card>

      <SecuritySettings />

      <AccountsSettings />

      <RecurringSettings />

      <Card>
        <CardHeader title="العملة" subtitle="تُستخدم في عرض جميع المبالغ داخل النظام" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => updateSettings({ currency: c.code })}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                state.settings.currency === c.code
                  ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-500 dark:bg-teal-950/30 dark:text-teal-400"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {c.label}
              <span className="text-slate-400">{c.symbol}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="النسخ الاحتياطي" subtitle="احفظ نسخة من بياناتك أو استعدها لاحقاً" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} />
            تصدير نسخة احتياطية
          </Button>
          <Button variant="secondary" onClick={handleImportClick}>
            <Upload size={16} />
            استيراد نسخة احتياطية
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </Card>

      <Card className="border-rose-200 dark:border-rose-900/50">
        <CardHeader title="منطقة الخطر" />
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          إعادة ضبط النظام تحذف كل بياناتك المخزنة على هذا الجهاز نهائياً.
        </p>
        <Button variant="danger" onClick={handleReset}>
          <Trash2 size={16} />
          إعادة ضبط النظام بالكامل
        </Button>
      </Card>

      <div className="flex items-center gap-2 px-1 py-4 text-sm text-slate-400">
        <Wallet size={14} />
        مصروفي — بياناتك محفوظة محلياً على جهازك فقط
      </div>
    </div>
  )
}
