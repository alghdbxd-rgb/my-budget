import { createContext, useContext, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"
import { deriveVaultKey, randomSaltB64, vaultDecrypt, vaultEncrypt } from "../lib/vaultCrypto"
import { deleteVaultRecord, loadVaultRecord, saveVaultRecord } from "../lib/vaultStorage"

const VaultContext = createContext(null)

export function VaultProvider({ children }) {
  const [record, setRecord] = useState(() => loadVaultRecord())
  const [cryptoKey, setCryptoKey] = useState(null) // في الذاكرة فقط، لا يُخزّن أبداً
  const [entries, setEntries] = useState([])

  async function persist(key, newEntries) {
    const encrypted = await vaultEncrypt(key, newEntries)
    const newRecord = { salt: record.salt, ...encrypted }
    saveVaultRecord(newRecord)
    setRecord(newRecord)
    setEntries(newEntries)
  }

  const value = useMemo(
    () => ({
      hasVault: Boolean(record),
      unlocked: Boolean(cryptoKey),
      entries,

      async setupVault(passphrase) {
        const salt = randomSaltB64()
        const key = await deriveVaultKey(passphrase, salt)
        const encrypted = await vaultEncrypt(key, [])
        const newRecord = { salt, ...encrypted }
        saveVaultRecord(newRecord)
        setRecord(newRecord)
        setCryptoKey(key)
        setEntries([])
      },

      async unlockVault(passphrase) {
        if (!record) return false
        const key = await deriveVaultKey(passphrase, record.salt)
        const decrypted = await vaultDecrypt(key, record)
        if (decrypted === null) return false
        setCryptoKey(key)
        setEntries(decrypted)
        return true
      },

      lockVault() {
        setCryptoKey(null)
        setEntries([])
      },

      async addEntry(entry) {
        const next = [{ id: uuid(), updatedAt: new Date().toISOString(), ...entry }, ...entries]
        await persist(cryptoKey, next)
      },

      async updateEntry(id, patch) {
        const next = entries.map((e) =>
          e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
        )
        await persist(cryptoKey, next)
      },

      async deleteEntry(id) {
        const next = entries.filter((e) => e.id !== id)
        await persist(cryptoKey, next)
      },

      async changePassphrase(currentPassphrase, newPassphrase) {
        const currentKey = await deriveVaultKey(currentPassphrase, record.salt)
        const decrypted = await vaultDecrypt(currentKey, record)
        if (decrypted === null) return false
        const newSalt = randomSaltB64()
        const newKey = await deriveVaultKey(newPassphrase, newSalt)
        const encrypted = await vaultEncrypt(newKey, decrypted)
        const newRecord = { salt: newSalt, ...encrypted }
        saveVaultRecord(newRecord)
        setRecord(newRecord)
        setCryptoKey(newKey)
        setEntries(decrypted)
        return true
      },

      destroyVault() {
        deleteVaultRecord()
        setRecord(null)
        setCryptoKey(null)
        setEntries([])
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [record, cryptoKey, entries],
  )

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error("useVault must be used within VaultProvider")
  return ctx
}
