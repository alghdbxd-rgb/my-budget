import { Lock, Wallet } from "lucide-react"
import { useState } from "react"
import { useLock } from "../../context/LockContext"
import { Button } from "../ui/Button"

export function LockScreen() {
  const { tryUnlock } = useLock()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) return
    setBusy(true)
    const ok = await tryUnlock(password)
    setBusy(false)
    if (!ok) {
      setError("كلمة المرور غير صحيحة")
      setPassword("")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5] px-4 dark:bg-[#0b1120]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Wallet size={22} />
          </div>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">مصروفي مقفل</h1>
          <p className="text-sm text-slate-400">أدخل كلمة المرور للمتابعة</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="sr-only">كلمة المرور</span>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="كلمة المرور"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </label>

        {error && <p className="mt-2 text-sm font-semibold text-rose-500">{error}</p>}

        <Button type="submit" disabled={busy || !password} className="mt-4 w-full">
          دخول
        </Button>
      </form>
    </div>
  )
}
