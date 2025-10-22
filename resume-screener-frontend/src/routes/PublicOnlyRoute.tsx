// ✅ React Router utility for redirects
import { Navigate } from 'react-router-dom'

// ✅ Redux hook to read global state
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

// ✅ Component to block authenticated users from public pages like login/register
export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    // 👀 Read session data from Redux state
    const { user } = useSelector((state: RootState) => state.auth)

    // 🔒 If user is already logged in → redirect them away from public page
    if (user) return <Navigate to="/dashboard" replace />

    // 🟢 Otherwise show the public screen (e.g., login/register)
    return <>{children}</>
}
