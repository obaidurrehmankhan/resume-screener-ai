// ✅ React Router redirect helper
import { Navigate } from 'react-router-dom'

// ✅ Access Redux state
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

// ✅ Component to wrap private routes
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // 🔐 Get token and user from Redux auth slice
    const { token, user } = useSelector((state: RootState) => state.auth)

    // ✅ Convert token to a boolean to check if user is logged in
    const isAuthenticated = Boolean(token)

    // 🔁 If there's no token → user is not logged in → redirect to login page
    if (!isAuthenticated) return <Navigate to="/login" replace />

    // ⏳ If token exists but user data hasn't loaded yet → show a loading fallback
    if (isAuthenticated && !user) return <div className="p-6">Loading...</div>

    // ✅ If token & user exist → user is authenticated → render the private component
    return <>{children}</>
}
