import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = useAuthStore()

    if (!token) return <Navigate to="/login" replace />
    if (token && !user) return <div className="p-6">Loading...</div>

    return <>{children}</>
}
