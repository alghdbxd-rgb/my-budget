import { KeyRound, Lock, ShieldCheck, ShieldOff } from "lucide-react"
import { useState } from "react"
import { useLock } from "../../context/LockContext"
import { Button } from "../ui/Button"
import { Card, CardHeader } from "../ui/Card"
import { Modal } from "../ui/Modal"

function PasswordModal({ open, onClose, mode, onSubmit }) {
  const isChange = mode === "change"
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  function reset() {
    setCurrent("")
    setNext("")
    setConfirm("")
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (next.length < 4) {
      setError("لازم تكون كلمة المرور 4 أحرف/أرقام على الأقل")
      return
    }
    if (next !== confirm) {
      setError("كلمة المرور وتأكيدها غير متطابقين")
      return
    }
    setBusy(true)
    const ok = await onSubmit(isChange ? current : next, next)
    setBusy(false)
    if (ok === false) {
      setError("كلمة المرور الحالية غير صحيحة")
      return
    }
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={isChange ? "تغيير كلمة المرور" : "تفعيل القفل بكلمة مرور"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isChange && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              كلمة المرور الحالية
            </span>
            <input
              type="password"
              autoFocus
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {isChange ? "كلمة المرور الجديدة" : "كلمة المرور"}
          </span>
          <input
            type="password"
            autoFocus={!isChange}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            تأكيد كلمة المرور
          </span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Button type="submit" disabled={busy} className="flex-1">
            {isChange ? "حفظ كلمة المرور الجديدة" : "تفعيل القفل"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function SecuritySettings() {
  const { hasPassword, enablePassword, changePassword, disablePassword, lockNow } = useLock()
  const [modal, setModal] = useState(null) // "enable" | "change" | null

  return (
    <Card>
      <CardHeader title="الأمان" subtitle="حماية التطبيق بكلمة مرور على هذا الجهاز" />

      {!hasPassword ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <ShieldOff size={16} className="text-slate-400" />
            القفل غير مفعّل
          </div>
          <Button variant="secondary" onClick={() => setModal("enable")}>
            <Lock size={16} />
            تفعيل القفل
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-600">
              <ShieldCheck size={16} />
              القفل مفعّل
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setModal("change")}>
                <KeyRound size={16} />
                تغيير كلمة المرور
              </Button>
              <Button variant="secondary" onClick={lockNow}>
                <Lock size={16} />
                قفل الآن
              </Button>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("هل تريد إلغاء القفل بكلمة المرور نهائياً من هذا الجهاز؟")) {
                disablePassword()
              }
            }}
          >
            إلغاء القفل نهائياً
          </Button>
        </div>
      )}

      <PasswordModal
        open={modal === "enable"}
        mode="enable"
        onClose={() => setModal(null)}
        onSubmit={async (_current, next) => {
          await enablePassword(next)
          return true
        }}
      />
      <PasswordModal
        open={modal === "change"}
        mode="change"
        onClose={() => setModal(null)}
        onSubmit={async (current, next) => changePassword(current, next)}
      />
    </Card>
  )
}
