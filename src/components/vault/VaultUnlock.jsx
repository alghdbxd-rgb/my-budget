import { Lock } from "lucide-react"
import { useState } from "react"
import { useVault } from "../../context/VaultContext"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"

export function VaultUnlock() {
  const { unlockVault } = useVault()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) return
    setBusy(true)
    const ok = await unlockVault(password)
    setBusy(false)
    if (!ok) {
      setError("كلمة مرور الخزنة غير صحيحة")
      setPassword("")
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-700 text-white">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">الخزنة مقفلة</h2>
          <p className="text-sm text-slate-400">أدخل كلمة مرور الخزنة لعرض حساباتك</p>
        </div>

        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError("")
          }}
          placeholder="كلمة مرور الخزنة"
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <Button type="submit" disabled={busy || !password}>
          فتح الخزنة
        </Button>
      </form>
    </Card>
  )
}
