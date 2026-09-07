import { Routes, Route } from 'react-router-dom'
import DemoSwitcher from './components/DemoSwitcher'

import Landing from './pages/marketing/Landing'
import JoinDoctor from './pages/marketing/JoinDoctor'
import LabsInterest from './pages/marketing/LabsInterest'

import PatientLayout from './layouts/PatientLayout'
import RequirePatient from './layouts/RequirePatient'
import PatientLogin from './pages/patient/Login'
import PatientHome from './pages/patient/Home'
import PatientOrders from './pages/patient/Orders'
import PatientProfile from './pages/patient/Profile'
import QuestionnaireWizard from './pages/patient/questionnaire/Wizard'
import Payment from './pages/patient/Payment'
import StatusPage from './pages/patient/StatusPage'
import Report from './pages/patient/Report'
import DoctorMatches from './pages/patient/DoctorMatches'

import DoctorLayout from './layouts/DoctorLayout'
import DoctorLogin from './pages/doctor/Login'
import DoctorInbox from './pages/doctor/Inbox'
import CaseEditor from './pages/doctor/CaseEditor'
import DoctorSchedule from './pages/doctor/Schedule'
import DoctorFinance from './pages/doctor/Finance'
import DoctorProfile from './pages/doctor/Profile'

import SupervisorLayout from './layouts/SupervisorLayout'
import SupervisorQueue from './pages/supervisor/Queue'
import SupervisorQuality from './pages/supervisor/Quality'

import AdminLayout from './layouts/AdminLayout'
import AdminStats from './pages/admin/Stats'
import AdminDoctors from './pages/admin/Doctors'
import AdminFinance from './pages/admin/Finance'
import AdminContent from './pages/admin/Content'
import AdminSettings from './pages/admin/Settings'
import AdminAudit from './pages/admin/Audit'

import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join-doctor" element={<JoinDoctor />} />
        <Route path="/labs" element={<LabsInterest />} />

        <Route path="/p/login" element={<PatientLogin />} />
        <Route element={<RequirePatient />}>
          <Route path="/p/consult/:step" element={<QuestionnaireWizard />} />
          <Route path="/p/payment/:id" element={<Payment />} />
        </Route>
        <Route path="/p" element={<PatientLayout />}>
          <Route index element={<PatientHome />} />
          <Route path="orders" element={<PatientOrders />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="status/:id" element={<StatusPage />} />
          <Route path="report/:id" element={<Report />} />
          <Route path="doctors/:id" element={<DoctorMatches />} />
        </Route>

        <Route path="/d/login" element={<DoctorLogin />} />
        <Route path="/d" element={<DoctorLayout />}>
          <Route index element={<DoctorInbox />} />
          <Route path="case/:id" element={<CaseEditor />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="finance" element={<DoctorFinance />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        <Route path="/s" element={<SupervisorLayout />}>
          <Route index element={<SupervisorQueue />} />
          <Route path="quality" element={<SupervisorQuality />} />
        </Route>

        <Route path="/a" element={<AdminLayout />}>
          <Route index element={<AdminStats />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <DemoSwitcher />
    </>
  )
}
