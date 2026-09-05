import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"
import { createInitialState, DEFAULT_SETTINGS } from "../lib/defaultData"
import { loadState, saveState } from "../lib/storage"

const BudgetContext = createContext(null)

function migrate(saved) {
  const base = createInitialState()
  if (!saved) return base
  return {
    categories: saved.categories?.length ? saved.categories : base.categories,
    transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
    budgets: saved.budgets ?? {},
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
  }
}

export function BudgetProvider({ children }) {
  const [state, setState] = useState(() => migrate(loadState()))

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
      updateSettings(patch) {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
      },
      replaceAll(newState) {
        setState(migrate(newState))
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
