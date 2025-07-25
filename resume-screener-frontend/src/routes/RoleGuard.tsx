// 🔐 RoleGuard: Restricts access based on allowed user roles

import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '@/app/store'

interface RoleGuardProps {
    allowedRoles: string[]
    children: React.ReactNode
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
    const location = useLocation()

    // 🔍 Read user from Redux
    const user = useSelector((state: RootState) => state.auth.user)

    // ⛔ Not logged in
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // 🔐 Logged in but doesn't have required role
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    // ✅ Authorized
    return <>{children}</>
}
