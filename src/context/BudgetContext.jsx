import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"
import { createInitialState, DEFAULT_ACCOUNTS, DEFAULT_SETTINGS } from "../lib/defaultData"
import { currentMonthKey } from "../lib/format"
import { loadState, saveState } from "../lib/storage"

const BudgetContext = createContext(null)

function migrate(saved) {
  const base = createInitialState()
  if (!saved) return base
  return {
    categories: saved.categories?.length ? saved.categories : base.categories,
    accounts: saved.accounts?.length ? saved.accounts : DEFAULT_ACCOUNTS,
    transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
    budgets: saved.budgets ?? {},
    debts: Array.isArray(saved.debts) ? saved.debts : [],
    recurring: Array.isArray(saved.recurring) ? saved.recurring : [],
    notes: Array.isArray(saved.notes) ? saved.notes : [],
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
  }
}

// يولّد أي عملية متكررة مستحقة (راتب شهري وغيره) لم تُنشأ بعد لهذا الشهر
function runDueRecurring(state) {
  const monthKey = currentMonthKey()
  const today = new Date().getDate()
  let changed = false

  const newTransactions = []
  const updatedRecurring = state.recurring.map((rule) => {
    if (!rule.active) return rule
    if (rule.lastRunKey === monthKey) return rule
    if (today < rule.dayOfMonth) return rule

    changed = true
    newTransactions.push({
      id: uuid(),
      type: rule.type,
      amount: rule.amount,
      categoryId: rule.categoryId,
      accountId: rule.accountId,
      date: new Date().toISOString().slice(0, 10),
      note: rule.note ? `🔁 ${rule.note}` : "🔁 عملية متكررة",
    })
    return { ...rule, lastRunKey: monthKey }
  })

  if (!changed) return state
  return {
    ...state,
    recurring: updatedRecurring,
    transactions: [...newTransactions, ...state.transactions],
  }
}

export function BudgetProvider({ children }) {
  const [state, setState] = useState(() => runDueRecurring(migrate(loadState())))

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [state.settings.theme])

  const actions = useMemo(
    () => ({
      addTransaction(tx) {
        setState((s) => ({
          ...s,
          transactions: [{ id: uuid(), ...tx }, ...s.transactions],
        }))
      },
      updateTransaction(id, patch) {
        setState((s) => ({
          ...s,
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }))
      },
      deleteTransaction(id) {
        setState((s) => ({
          ...s,
          transactions: s.transactions.filter((t) => t.id !== id),
        }))
      },
      addCategory(cat) {
        const id = `cat-${uuid()}`
        setState((s) => ({ ...s, categories: [...s.categories, { id, ...cat }] }))
        return id
      },
      updateCategory(id, patch) {
        setState((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }))
      },
      deleteCategory(id) {
        setState((s) => {
          const { [id]: _removed, ...restBudgets } = s.budgets
          return {
            ...s,
            categories: s.categories.filter((c) => c.id !== id),
            transactions: s.transactions.filter((t) => t.categoryId !== id),
            budgets: restBudgets,
          }
        })
      },
      setBudget(categoryId, limit) {
        setState((s) => ({
          ...s,
          budgets: { ...s.budgets, [categoryId]: limit },
        }))
      },
      removeBudget(categoryId) {
        setState((s) => {
          const { [categoryId]: _removed, ...rest } = s.budgets
          return { ...s, budgets: rest }
        })
      },
      addAccount(account) {
        const id = `acc-${uuid()}`
        setState((s) => ({ ...s, accounts: [...s.accounts, { id, ...account }] }))
        return id
      },
      updateAccount(id, patch) {
        setState((s) => ({
          ...s,
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }))
      },
      deleteAccount(id) {
        setState((s) => {
          if (s.accounts.length <= 1) return s // لازم يبقى حساب واحد على الأقل
          return { ...s, accounts: s.accounts.filter((a) => a.id !== id) }
        })
      },
      addDebt(debt) {
        setState((s) => ({
          ...s,
          debts: [{ id: uuid(), payments: [], ...debt }, ...s.debts],
        }))
      },
      updateDebt(id, patch) {
        setState((s) => ({
          ...s,
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }))
      },
      deleteDebt(id) {
        setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }))
      },
      addDebtPayment(debtId, payment) {
        setState((s) => ({
          ...s,
          debts: s.debts.map((d) =>
            d.id === debtId
              ? { ...d, payments: [...(d.payments ?? []), { id: uuid(), ...payment }] }
              : d,
          ),
        }))
      },
      addRecurring(rule) {
        setState((s) => ({
          ...s,
          recurring: [{ id: uuid(), active: true, lastRunKey: null, ...rule }, ...s.recurring],
        }))
      },
      updateRecurring(id, patch) {
        setState((s) => ({
          ...s,
          recurring: s.recurring.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        }))
      },
      deleteRecurring(id) {
        setState((s) => ({ ...s, recurring: s.recurring.filter((r) => r.id !== id) }))
      },
      runRecurringNow(id) {
        setState((s) => {
          const rule = s.recurring.find((r) => r.id === id)
          if (!rule) return s
          return {
            ...s,
            transactions: [
              {
                id: uuid(),
                type: rule.type,
                amount: rule.amount,
                categoryId: rule.categoryId,
                accountId: rule.accountId,
                date: new Date().toISOString().slice(0, 10),
                note: rule.note ? `🔁 ${rule.note}` : "🔁 عملية متكررة",
              },
              ...s.transactions,
            ],
            recurring: s.recurring.map((r) =>
              r.id === id ? { ...r, lastRunKey: currentMonthKey() } : r,
            ),
          }
        })
      },
      addNote(note) {
        const now = new Date().toISOString()
        setState((s) => ({
          ...s,
          notes: [{ id: uuid(), pinned: false, createdAt: now, updatedAt: now, ...note }, ...s.notes],
        }))
      },
      updateNote(id, patch) {
        setState((s) => ({
          ...s,
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
          ),
        }))
      },
      deleteNote(id) {
        setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }))
      },
      toggleNotePin(id) {
        setState((s) => ({
          ...s,
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }))
      },
      updateSettings(patch) {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
      },
      replaceAll(newState) {
        setState(runDueRecurring(migrate(newState)))
      },
      resetAll() {
        setState(createInitialState())
      },
    }),
    [],
  )

  const value = useMemo(() => ({ state, ...actions }), [state, actions])

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider")
  return ctx
}
