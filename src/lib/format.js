import { CURRENCIES } from "./defaultData"

export function getCurrencyMeta(code) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

export function formatMoney(amount, currencyCode = "IQD") {
  const meta = getCurrencyMeta(currencyCode)
  const value = Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat("ar-u-nu-latn", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(Math.abs(value))
  const sign = value < 0 ? "-" : ""
  return `${sign}${formatted} ${meta.symbol}`
}

export function formatDate(isoDate) {
  const d = new Date(isoDate)
  return new Intl.DateTimeFormat("ar-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d)
}

export function formatShortDate(isoDate) {
  const d = new Date(isoDate)
  return new Intl.DateTimeFormat("ar-u-nu-latn", {
    month: "short",
    day: "numeric",
  }).format(d)
}

export function monthKey(isoDate) {
  const d = new Date(isoDate)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function monthLabel(key) {
  const [year, month] = key.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return new Intl.DateTimeFormat("ar-u-nu-latn", { year: "numeric", month: "long" }).format(d)
}

export function todayIso() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function currentMonthKey() {
  return monthKey(new Date().toISOString())
}

export function lastNMonthKeys(n) {
  const keys = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return keys
}
