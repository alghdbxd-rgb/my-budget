import { createContext, useContext, useMemo, useState } from "react"
import {
  clearLockHash,
  getLockHash,
  isSessionUnlocked,
  setLockHash,
  setSessionUnlocked,
  sha256Hex,
} from "../lib/lock"

const LockContext = createContext(null)

export function LockProvider({ children }) {
  const [hash, setHash] = useState(() => getLockHash())
  const [unlocked, setUnlocked] = useState(() => (getLockHash() ? isSessionUnlocked() : true))

  const value = useMemo(
    () => ({
      hasPassword: Boolean(hash),
      unlocked,
      async enablePassword(newPassword) {
        const h = await sha256Hex(newPassword)
        setLockHash(h)
        setHash(h)
        setSessionUnlocked(true)
        setUnlocked(true)
      },
      async tryUnlock(password) {
        const h = await sha256Hex(password)
        if (h === hash) {
          setSessionUnlocked(true)
          setUnlocked(true)
          return true
        }
        return false
      },
      async changePassword(currentPassword, newPassword) {
        const h = await sha256Hex(currentPassword)
        if (h !== hash) return false
        const newHash = await sha256Hex(newPassword)
        setLockHash(newHash)
        setHash(newHash)
        return true
      },
      disablePassword() {
        clearLockHash()
        setSessionUnlocked(false)
        setHash(null)
        setUnlocked(true)
      },
      lockNow() {
        setSessionUnlocked(false)
        setUnlocked(false)
      },
    }),
    [hash, unlocked],
  )

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export function useLock() {
  const ctx = useContext(LockContext)
  if (!ctx) throw new Error("useLock must be used within LockProvider")
  return ctx
}
