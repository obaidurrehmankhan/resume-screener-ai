// ✅ React Router redirect helper
import { Navigate } from 'react-router-dom'

// ✅ Access Redux state
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { selectAuthHydrated } from '@/features/auth/authSelectors'

// ✅ Component to wrap private routes
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useSelector((state: RootState) => state.auth)
    const hydrated = useSelector(selectAuthHydrated)

    if (!hydrated) {
        return <div className="p-4 text-muted-foreground">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
