import {
  BarChart3,
  HandCoins,
  LayoutDashboard,
  Lock,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  StickyNote,
  Sun,
  Wallet,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useBudget } from "../../context/BudgetContext"
import { useLock } from "../../context/LockContext"
import { categoryById } from "../../lib/selectors"
import { TransactionForm } from "../transactions/TransactionForm"
import { Button } from "../ui/Button"

const NAV_ITEMS = [
  { to: "/", label: "الرئيسية", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "العمليات", icon: Receipt },
  { to: "/debts", label: "الديون", icon: HandCoins },
  { to: "/notes", label: "الملاحظات", icon: StickyNote },
  { to: "/vault", label: "الخصوصية", icon: ShieldCheck },
  { to: "/budgets", label: "الميزانيات", icon: PiggyBank },
  { to: "/reports", label: "التقارير", icon: BarChart3 },
  { to: "/settings", label: "الإعدادات", icon: SettingsIcon },
]

function NavItems({ onNavigate }) {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </>
  )
}

function useCurrentNav() {
  const location = useLocation()
  return (
    NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))) ??
    NAV_ITEMS[0]
  )
}

export function AppLayout() {
  const { state, updateSettings } = useBudget()
  const { hasPassword, lockNow } = useLock()
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [resultsOpen, setResultsOpen] = useState(false)
  const isDark = state.settings.theme === "dark"
  const currentNav = useCurrentNav()

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return { transactions: [], notes: [], debts: [] }
    const transactions = state.transactions
      .filter((t) => {
        const cat = categoryById(state.categories, t.categoryId)
        return `${cat?.name ?? ""} ${t.note ?? ""}`.toLowerCase().includes(q)
      })
      .slice(0, 5)
    const notes = state.notes
      .filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(q))
      .slice(0, 5)
    const debts = state.debts
      .filter((d) => `${d.person} ${d.note ?? ""}`.toLowerCase().includes(q))
      .slice(0, 5)
    return { transactions, notes, debts }
  }, [query, state.transactions, state.notes, state.debts, state.categories])

  const hasResults =
    searchResults.transactions.length > 0 || searchResults.notes.length > 0 || searchResults.debts.length > 0

  function goTo(path) {
    navigate(path)
    setQuery("")
    setResultsOpen(false)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    goTo(`/transactions?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="flex min-h-screen bg-[#f7fafc] dark:bg-[#0b1120]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:flex print:hidden">
        <div className="mb-8 flex items-center gap-2 px-1.5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary-600 text-white">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              مصروفي
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItems />
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Button variant="secondary" onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6 print:hidden dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white md:hidden">
              <Wallet size={16} />
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              {currentNav.to !== "/" && (
                <>
                  <Link to="/" className="hidden text-slate-400 hover:text-primary-600 sm:inline">
                    الرئيسية
                  </Link>
                  <span className="hidden text-slate-300 sm:inline">/</span>
                </>
              )}
              <span className="font-bold text-slate-700 dark:text-slate-200">{currentNav.label}</span>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative hidden max-w-sm flex-1 md:block">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-primary-500 dark:border-slate-700 dark:bg-slate-800">
              <Search size={15} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setResultsOpen(true)}
                onBlur={() => setTimeout(() => setResultsOpen(false), 150)}
                placeholder="بحث في العمليات، الملاحظات، والديون..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
            </div>

            {resultsOpen && query.trim().length >= 2 && (
              <div className="absolute top-full z-40 mt-1.5 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {!hasResults ? (
                  <p className="px-3 py-3 text-center text-xs text-slate-400">لا نتائج مطابقة</p>
                ) : (
                  <>
                    {searchResults.transactions.length > 0 && (
                      <div className="border-b border-slate-100 py-1.5 dark:border-slate-700">
                        <p className="px-3 pb-1 text-[10.5px] font-bold text-slate-400">العمليات</p>
                        {searchResults.transactions.map((t) => {
                          const cat = categoryById(state.categories, t.categoryId)
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => goTo(`/transactions?q=${encodeURIComponent(query.trim())}`)}
                              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-right text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">
                                {t.note || cat?.name || "بدون وصف"}
                              </span>
                              <span className="shrink-0 text-xs text-slate-400">{cat?.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {searchResults.notes.length > 0 && (
                      <div className="border-b border-slate-100 py-1.5 dark:border-slate-700">
                        <p className="px-3 pb-1 text-[10.5px] font-bold text-slate-400">الملاحظات</p>
                        {searchResults.notes.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => goTo(`/notes?q=${encodeURIComponent(query.trim())}`)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-right text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">
                              {n.title || "بدون عنوان"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.debts.length > 0 && (
                      <div className="py-1.5">
                        <p className="px-3 pb-1 text-[10.5px] font-bold text-slate-400">الديون والسلف</p>
                        {searchResults.debts.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => goTo(`/debts?q=${encodeURIComponent(query.trim())}`)}
                            className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-right text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{d.person}</span>
                            <span
                              className={`shrink-0 text-xs font-semibold ${
                                d.direction === "owed_to_me" ? "text-green-600" : "text-rose-500"
                              }`}
                            >
                              {d.direction === "owed_to_me" ? "لي" : "علي"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </form>

          <div className="flex shrink-0 items-center gap-1.5">
            {hasPassword && (
              <button
                onClick={lockNow}
                aria-label="قفل الآن"
                className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex dark:hover:bg-slate-800"
              >
                <Lock size={16} />
              </button>
            )}
            <button
              onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
              aria-label="تبديل الوضع الداكن"
              className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex dark:hover:bg-slate-800"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              <span className="hidden sm:inline">عملية جديدة</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-1 overflow-x-auto border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden print:hidden dark:border-slate-800 dark:bg-slate-900/95">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-semibold ${
                isActive ? "text-primary-600" : "text-slate-400"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
