// التصنيفات الافتراضية عند أول تشغيل للنظام
export const DEFAULT_CATEGORIES = [
  { id: "cat-salary", name: "راتب", type: "income", color: "#0f766e" },
  { id: "cat-freelance", name: "عمل حر", type: "income", color: "#0891b2" },
  { id: "cat-gift", name: "هدايا ومساعدات", type: "income", color: "#7c3aed" },
  { id: "cat-other-income", name: "دخل آخر", type: "income", color: "#64748b" },

  { id: "cat-food", name: "طعام وشراب", type: "expense", color: "#ea580c" },
  { id: "cat-transport", name: "مواصلات ووقود", type: "expense", color: "#2563eb" },
  { id: "cat-housing", name: "سكن وإيجار", type: "expense", color: "#b45309" },
  { id: "cat-bills", name: "فواتير وخدمات", type: "expense", color: "#0d9488" },
  { id: "cat-health", name: "صحة وعلاج", type: "expense", color: "#e11d48" },
  { id: "cat-education", name: "تعليم", type: "expense", color: "#4f46e5" },
  { id: "cat-shopping", name: "تسوق وملابس", type: "expense", color: "#db2777" },
  { id: "cat-entertainment", name: "ترفيه وخروجات", type: "expense", color: "#ca8a04" },
  { id: "cat-communication", name: "اتصالات وانترنت", type: "expense", color: "#0284c7" },
  { id: "cat-other-expense", name: "مصاريف أخرى", type: "expense", color: "#71717a" },
]

export const DEFAULT_SETTINGS = {
  currency: "IQD",
  theme: "light",
  monthlyIncomeTarget: 0,
}

export const CURRENCIES = [
  { code: "IQD", label: "دينار عراقي", symbol: "د.ع" },
  { code: "USD", label: "دولار أمريكي", symbol: "$" },
  { code: "SAR", label: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", label: "درهم إماراتي", symbol: "د.إ" },
  { code: "EGP", label: "جنيه مصري", symbol: "ج.م" },
  { code: "EUR", label: "يورو", symbol: "€" },
]

export function createInitialState() {
  return {
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: {},
    settings: DEFAULT_SETTINGS,
  }
}
