// يحول الأرقام العربية (٠١٢٣٤٥٦٧٨٩) والفارسية (۰۱۲۳۴۵۶۷۸۹) لأرقام إنجليزية عادية،
// ويوحّد فاصلة الأعشار العربية (٫) لنقطة عادية — حتى لو الكيبورد يكتب أرقام عربية
// بأي حقل إدخال بالتطبيق.
const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩"
const EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹"

export function toWesternDigits(input) {
  if (input == null) return input
  return String(input).replace(/[٠-٩۰-۹٫٬]/g, (ch) => {
    if (ch === "٫") return "."
    if (ch === "٬") return ""
    const arabicIndex = ARABIC_INDIC.indexOf(ch)
    if (arabicIndex !== -1) return String(arabicIndex)
    const easternIndex = EASTERN_ARABIC.indexOf(ch)
    if (easternIndex !== -1) return String(easternIndex)
    return ch
  })
}
