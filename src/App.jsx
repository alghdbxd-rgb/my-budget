import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { LockScreen } from "./components/lock/LockScreen"
import { BudgetProvider } from "./context/BudgetContext"
import { LockProvider, useLock } from "./context/LockContext"
import { VaultProvider } from "./context/VaultContext"
import Budgets from "./pages/Budgets"
import Dashboard from "./pages/Dashboard"
import Debts from "./pages/Debts"
import Notes from "./pages/Notes"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Transactions from "./pages/Transactions"
import Vault from "./pages/Vault"

function Gate({ children }) {
  const { unlocked } = useLock()
  return unlocked ? children : <LockScreen />
}

export default function App() {
  return (
    <LockProvider>
      <Gate>
        <BudgetProvider>
          <VaultProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="debts" element={<Debts />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notes" element={<Notes />} />
                <Route path="vault" element={<Vault />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </VaultProvider>
        </BudgetProvider>
      </Gate>
    </LockProvider>
  )
}
