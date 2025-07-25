import './App.css'
import { Routes, Route } from 'react-router-dom'

// 🧱 Layouts
import AppShell from "@/components/layout/AppShell"
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout"

// 📄 Screens
import LandingScreen from '@/screens/LandingScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import LoginScreen from '@/screens/LoginScreen'
import RegisterScreen from '@/screens/RegisterScreen'
import UploadScreen from '@/screens/UploadScreen'
import RewriteScreen from '@/screens/RewriteScreen'

// 🔐 Route guards
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { RoleGuard } from '@/routes/RoleGuard'

// ⚙️ Admin Screens
import AdminLayout from '@/components/layout/admin/AdminLayout'
import AdminHomeScreen from '@/screens/admin/AdminHomeScreen'
import AdminUsersScreen from '@/screens/admin/AdminUsersScreen'
import AdminStatsScreen from '@/screens/admin/AdminStatsScreen'

// ❌ Unauthorized screen
import UnauthorizedScreen from '@/screens/UnauthorisedScreen'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* 🌐 Public Landing */}
        <Route path="/" element={<LandingScreen />} />

        {/* 🔐 Public-only Routes */}
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

        {/* 🔒 Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardScreen />} />
          <Route path="upload" element={<UploadScreen />} />
          <Route path="rewrite" element={<RewriteScreen />} />
        </Route>

        {/* 🛡 Admin-only Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHomeScreen />} />
          <Route path="users" element={<AdminUsersScreen />} />
          <Route path="stats" element={<AdminStatsScreen />} />
        </Route>

        {/* ❌ Unauthorized Fallback */}
        <Route path="/unauthorized" element={<UnauthorizedScreen />} />
      </Route>
    </Routes>
  )
}

export default App
