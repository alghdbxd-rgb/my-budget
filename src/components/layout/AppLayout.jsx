import {
  BarChart3,
  HandCoins,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Settings as SettingsIcon,
  Sun,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useBudget } from "../../context/BudgetContext"
import { TransactionForm } from "../transactions/TransactionForm"
import { Button } from "../ui/Button"

const NAV_ITEMS = [
  { to: "/", label: "الرئيسية", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "العمليات", icon: Receipt },
  { to: "/debts", label: "الديون", icon: HandCoins },
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
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
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

export function AppLayout() {
  const { state, updateSettings } = useBudget()
  const [formOpen, setFormOpen] = useState(false)
  const isDark = state.settings.theme === "dark"

  return (
    <div className="flex min-h-screen bg-[#f4f6f5] dark:bg-[#0b1120]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8 flex items-center gap-2 px-1.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-white">
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Wallet size={16} />
            </div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              مصروفي
            </p>
          </div>
          <div className="hidden md:block" />
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            عملية جديدة
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-0.5 py-2 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-semibold ${
                isActive ? "text-teal-600" : "text-slate-400"
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
