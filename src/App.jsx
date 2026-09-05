import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { BudgetProvider } from "./context/BudgetContext"
import Budgets from "./pages/Budgets"
import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Transactions from "./pages/Transactions"

export default function App() {
  return (
    <BudgetProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BudgetProvider>
  )
}
