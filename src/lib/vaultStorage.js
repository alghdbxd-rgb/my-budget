// تخزين الخزنة المشفّرة بمفتاح منفصل عن بيانات الميزانية — بهذا الشكل:
// "إعادة ضبط النظام" بالإعدادات لا تمسح الخزنة بالخطأ.
const VAULT_KEY = "masrofi-vault-v1"

export function loadVaultRecord() {
  try {
    const raw = window.localStorage.getItem(VAULT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveVaultRecord(record) {
  try {
    window.localStorage.setItem(VAULT_KEY, JSON.stringify(record))
  } catch {
    /* ignore */
  }
}

export function deleteVaultRecord() {
  try {
    window.localStorage.removeItem(VAULT_KEY)
  } catch {
    /* ignore */
  }
}
