// قفل بسيط بكلمة مرور للتطبيق (من جهة المتصفح فقط، بدون سيرفر).
// ملاحظة أمنية: هذا يمنع فتح عرضي/سريع للتطبيق، وليس حماية حقيقية ضد شخص
// تقني يفتح أدوات المطور بالمتصفح — لأنه ما فيه سيرفر يتحقق من كلمة المرور.
const LOCK_KEY = "masrofi-lock-v1"
const SESSION_KEY = "masrofi-unlocked"

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function getLockHash() {
  try {
    return window.localStorage.getItem(LOCK_KEY)
  } catch {
    return null
  }
}

export function setLockHash(hash) {
  try {
    window.localStorage.setItem(LOCK_KEY, hash)
  } catch {
    /* ignore */
  }
}

export function clearLockHash() {
  try {
    window.localStorage.removeItem(LOCK_KEY)
  } catch {
    /* ignore */
  }
}

export function isSessionUnlocked() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    return false
  }
}

export function setSessionUnlocked(value) {
  try {
    if (value) window.sessionStorage.setItem(SESSION_KEY, "1")
    else window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
