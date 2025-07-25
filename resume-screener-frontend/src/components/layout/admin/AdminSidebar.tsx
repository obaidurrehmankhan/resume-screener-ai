// 📊 AdminSidebar: Vertical nav for admin users only

import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/features/auth/authSlice'
import type { RootState } from '@/app/store'

import { Button } from '@/components/ui/button'
import {
    Users,
    BarChart,
    ShieldCheck,
    LogOut,
    LayoutDashboard,
} from 'lucide-react'

// 🧭 Admin-only routes
const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: <ShieldCheck size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/stats', label: 'Stats', icon: <BarChart size={18} /> },
]

// 🔁 Utility links (can be role-gated or context-sensitive)
const utilityNav = [
    { to: '/dashboard', label: 'View as User', icon: <LayoutDashboard size={18} /> },
]

export const AdminSidebar = () => {
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.auth.user)

    return (
        <aside className="w-64 border-r bg-white dark:bg-background p-4 flex flex-col justify-between">
            <div>
                {/* 🧭 Admin Navigation Section */}
                <nav className="space-y-2">
                    {adminNav.map(({ to, label, icon }) => (
                        <NavLink
                            key={label}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${isActive
                                    ? 'bg-muted text-primary'
                                    : 'text-muted-foreground hover:bg-muted'
                                }`
                            }
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* ───────────── Divider ───────────── */}
                <hr className="my-4 border-muted" />

                {/* 🧰 Utility Actions (e.g., switch view, settings) */}
                <nav className="space-y-2">
                    {utilityNav.map(({ to, label, icon }) => (
                        <NavLink
                            key={label}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${isActive
                                    ? 'bg-muted text-primary'
                                    : 'text-muted-foreground hover:bg-muted'
                                }`
                            }
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* 🚪 Logout Button (bottom) */}
            <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => dispatch(logout())}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </aside>
    )
}
