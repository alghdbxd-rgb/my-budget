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
  return transactions.reduce((acc, t) => {
    if (t.type === "income") return acc + t.amount
    if (t.type === "expense") return acc - t.amount
    return acc // التحويلات لا تغيّر مجموع الرصيد الكلي، فقط توزيعه بين الحسابات
  }, 0)
}

export function accountById(accounts, id) {
  return accounts.find((a) => a.id === id)
}

export function accountBalances(transactions, accounts) {
  const fallbackId = accounts[0]?.id
  const totals = new Map(accounts.map((a) => [a.id, 0]))
  for (const t of transactions) {
    const accId = t.accountId || fallbackId
    if (totals.has(accId)) {
      if (t.type === "income") totals.set(accId, totals.get(accId) + t.amount)
      else if (t.type === "expense") totals.set(accId, totals.get(accId) - t.amount)
      else if (t.type === "transfer") totals.set(accId, totals.get(accId) - t.amount)
    }
    if (t.type === "transfer" && totals.has(t.toAccountId)) {
      totals.set(t.toAccountId, totals.get(t.toAccountId) + t.amount)
    }
  }
  return accounts.map((a) => ({ ...a, balance: totals.get(a.id) ?? 0 }))
}

export function debtRemaining(debt) {
  const paid = (debt.payments ?? []).reduce((a, p) => a + p.amount, 0)
  return debt.amount - paid
}

export function debtsSummary(debts) {
  let owedToMe = 0
  let owedByMe = 0
  for (const d of debts) {
    const remaining = debtRemaining(d)
    if (remaining <= 0) continue
    if (d.direction === "owed_to_me") owedToMe += remaining
    else owedByMe += remaining
  }
  return { owedToMe, owedByMe }
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
