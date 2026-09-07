import { ShieldCheck } from "lucide-react"
import { INPUT_CLASS } from "../../lib/ui"
import { useState } from "react"
import { useVault } from "../../context/VaultContext"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"

export function VaultSetup() {
  const { setupVault } = useVault()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError("لازم تكون كلمة مرور الخزنة 6 أحرف/أرقام على الأقل")
      return
    }
    if (password !== confirm) {
      setError("كلمة المرور وتأكيدها غير متطابقين")
      return
    }
    setBusy(true)
    await setupVault(password)
    setBusy(false)
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-primary-600 text-white">
            <ShieldCheck size={22} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
            إنشاء خزنة آمنة
          </h2>
          <p className="text-sm text-slate-400">
            حدد كلمة مرور خاصة بالخزنة (منفصلة عن قفل التطبيق) — كل بياناتك هنا تنشفّر فعلياً
            بهذه الكلمة، وما نقدر نساعدك تسترجعها لو نسيتها.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            كلمة مرور الخزنة
          </span>
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
          />
        </label>

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <Button type="submit" disabled={busy}>
          إنشاء الخزنة
        </Button>
      </form>
    </Card>
  )
}
