import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function RequirePatient() {
  const { db } = useApp()
  if (!db.session.patientId) return <Navigate to="/p/login" replace />
  return <Outlet />
}
