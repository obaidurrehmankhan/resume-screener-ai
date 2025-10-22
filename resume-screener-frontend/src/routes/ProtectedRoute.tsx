// ✅ React Router redirect helper
import { Navigate } from 'react-router-dom'

// ✅ Access Redux state
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

// ✅ Component to wrap private routes
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useSelector((state: RootState) => state.auth)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
