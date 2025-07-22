import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

import LandingScreen from '@/screens/LandingScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import LoginScreen from '@/screens/LoginScreen'

import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import RegisterScreen from '@/screens/RegisterScreen'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingScreen />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />

        {/* Public-only Login Page */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginScreen />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterScreen />
            </PublicOnlyRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
