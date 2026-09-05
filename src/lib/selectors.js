import { currentMonthKey, lastNMonthKeys, monthKey } from "./format"

export function categoryById(categories, id) {
  return categories.find((c) => c.id === id)
}

export function transactionsForMonth(transactions, key = currentMonthKey()) {
  return transactions.filter((t) => monthKey(t.date) === key)
}

export function sumByType(transactions, type) {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0)
}

export function totalBalance(transactions) {
  return transactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
}

export function categoryBreakdown(transactions, categories, type = "expense") {
  const totals = new Map()
  for (const t of transactions) {
    if (t.type !== type) continue
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
  }
  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0)
  return [...totals.entries()]
    .map(([categoryId, value]) => {
      const cat = categoryById(categories, categoryId)
      return {
        categoryId,
        name: cat?.name ?? "غير مصنف",
        color: cat?.color ?? "#94a3b8",
        value,
        percent: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
      }
    })
    .sort((a, b) => b.value - a.value)
}

export function monthlyTrend(transactions, months = 6) {
  const keys = lastNMonthKeys(months)
  return keys.map((key) => {
    const monthTx = transactionsForMonth(transactions, key)
    return {
      key,
      income: sumByType(monthTx, "income"),
      expense: sumByType(monthTx, "expense"),
    }
  })
}

export function budgetUsage(transactions, categories, budgets, key = currentMonthKey()) {
  const monthTx = transactionsForMonth(transactions, key)
  const spentByCategory = new Map()
  for (const t of monthTx) {
    if (t.type !== "expense") continue
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + t.amount)
  }
  return Object.entries(budgets)
    .filter(([, limit]) => limit > 0)
    .map(([categoryId, limit]) => {
      const cat = categoryById(categories, categoryId)
      const spent = spentByCategory.get(categoryId) ?? 0
      return {
        categoryId,
        name: cat?.name ?? "غير مصنف",
        color: cat?.color ?? "#94a3b8",
        limit,
        spent,
        percent: limit > 0 ? Math.min((spent / limit) * 100, 999) : 0,
        remaining: limit - spent,
      }
    })
    .sort((a, b) => b.percent - a.percent)
}
