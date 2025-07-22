import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = useAuthStore()
    if (token && user) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}
