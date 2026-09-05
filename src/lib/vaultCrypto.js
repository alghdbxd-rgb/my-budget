// تشفير حقيقي (AES-256-GCM) لخزنة كلمات المرور — كل شي يتشفر بمفتاح مشتق
// من كلمة مرور الخزنة (PBKDF2)، ولا يوجد أي نسخة نص صريح تُخزّن أو تُرسل لأي سيرفر.
const PBKDF2_ITERATIONS = 150000

function bytesToB64(bytes) {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function b64ToBytes(b64) {
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

export function randomSaltB64() {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function deriveVaultKey(passphrase, saltB64) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64ToBytes(saltB64), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function vaultEncrypt(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plainBytes = new TextEncoder().encode(JSON.stringify(value))
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBytes)
  return { iv: bytesToB64(iv), data: bytesToB64(new Uint8Array(cipherBuf)) }
}

// ترجع null إذا كانت كلمة المرور غلط (فشل التحقق من AES-GCM) بدل ما ترمي خطأ
export async function vaultDecrypt(key, { iv, data }) {
  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBytes(iv) },
      key,
      b64ToBytes(data),
    )
    return JSON.parse(new TextDecoder().decode(plainBuf))
  } catch {
    return null
  }
}
