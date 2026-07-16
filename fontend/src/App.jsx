import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import PatientLayout from './components/PatientLayout.jsx'
import TherapistLayout from './components/TherapistLayout.jsx'

// Patient pages
import Login from './pages/patient/Login.jsx'
import Register from './pages/patient/Register.jsx'
import OnboardingSelectTherapist from './pages/patient/OnboardingSelectTherapist.jsx'
import OnboardingEmergency from './pages/patient/OnboardingEmergency.jsx'
import Home from './pages/patient/Home.jsx'
import TrainingBig from './pages/patient/TrainingBig.jsx'
import TrainingLoud from './pages/patient/TrainingLoud.jsx'
import SessionBig from './pages/patient/SessionBig.jsx'
import SessionWeightShift from './pages/patient/SessionWeightShift.jsx'
import SessionLoud from './pages/patient/SessionLoud.jsx'
import Dashboard from './pages/patient/Dashboard.jsx'
import Profile from './pages/patient/Profile.jsx'
import NotificationSettings from './pages/patient/NotificationSettings.jsx'
import EmergencySettings from './pages/patient/EmergencySettings.jsx'
import EmergencyAlert from './pages/patient/EmergencyAlert.jsx'
import Chat from './pages/patient/Chat.jsx'

// Therapist pages
import TherapistLogin from './pages/therapist/TherapistLogin.jsx'
import TherapistRegister from './pages/therapist/TherapistRegister.jsx'
import Patients from './pages/therapist/Patients.jsx'
import PatientDetail from './pages/therapist/PatientDetail.jsx'
import Messages from './pages/therapist/Messages.jsx'

function RequireAuth({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to={role === 'therapist' ? '/therapist/login' : '/login'} replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Patient auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding/select-therapist" element={<OnboardingSelectTherapist />} />
      <Route path="/onboarding/emergency-contact" element={<OnboardingEmergency />} />

      {/* Patient app (full-screen session routes live outside the sidebar layout) */}
      <Route
        element={
          <RequireAuth role="patient">
            <PatientLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/training/big" element={<TrainingBig />} />
        <Route path="/training/loud" element={<TrainingLoud />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/emergency" element={<EmergencySettings />} />
        <Route path="/chat" element={<Chat />} />
      </Route>

      {/* Live sessions — full-screen, still auth-guarded */}
      <Route path="/training/big/session" element={<RequireAuth role="patient"><SessionBig /></RequireAuth>} />
      <Route path="/training/big/session-weightshift" element={<RequireAuth role="patient"><SessionWeightShift /></RequireAuth>} />
      <Route path="/training/loud/session" element={<RequireAuth role="patient"><SessionLoud /></RequireAuth>} />
      <Route path="/emergency-alert" element={<RequireAuth role="patient"><EmergencyAlert /></RequireAuth>} />

      {/* Therapist portal */}
      <Route path="/therapist/login" element={<TherapistLogin />} />
      <Route path="/therapist/register" element={<TherapistRegister />} />
      <Route
        element={
          <RequireAuth role="therapist">
            <TherapistLayout />
          </RequireAuth>
        }
      >
        <Route path="/therapist/patients" element={<Patients />} />
        <Route path="/therapist/patients/:id" element={<PatientDetail />} />
        <Route path="/therapist/messages" element={<Messages />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? (user.role === 'therapist' ? '/therapist/patients' : '/home') : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}
