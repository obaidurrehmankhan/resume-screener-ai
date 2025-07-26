// 📊 AdminSidebar: Responsive vertical nav for admin users

import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/features/auth/authSlice'
import type { RootState } from '@/app/store'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
    Users,
    BarChart,
    ShieldCheck,
    LogOut,
    LayoutDashboard,
    X,
} from 'lucide-react'

type AdminSidebarProps = {
    isOpen: boolean
    onClose: () => void
}

// 🧭 Admin-only routes
const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: <ShieldCheck size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/stats', label: 'Stats', icon: <BarChart size={18} /> },
]

// 🔁 Utility links
const utilityNav = [
    { to: '/dashboard', label: 'View as User', icon: <LayoutDashboard size={18} /> },
]

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.auth.user)
    const sidebarRef = useRef<HTMLDivElement>(null)

    // 📱 Swipe gesture to close on mobile
    useEffect(() => {
        const sidebar = sidebarRef.current
        if (!sidebar) return

        let touchStartX = 0
        let touchEndX = 0

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX
        }
        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX
            if (touchEndX - touchStartX > 50) onClose()
        }

        sidebar.addEventListener('touchstart', handleTouchStart)
        sidebar.addEventListener('touchend', handleTouchEnd)
        return () => {
            sidebar.removeEventListener('touchstart', handleTouchStart)
            sidebar.removeEventListener('touchend', handleTouchEnd)
        }
    }, [onClose])

    return (
        <>
            {/* 🌒 Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden"
                    onClick={onClose}
                />
            )}

            {/* 🧭 Admin Sidebar */}
            <aside
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-background p-4 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* ❌ Close Button (mobile) */}
                <div className="flex items-center justify-end mb-4 md:hidden">
                    <button
                        className="text-muted-foreground hover:text-primary"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col justify-between h-full">
                    <div>
                        {/* 🧭 Admin Routes */}
                        <nav className="space-y-2">
                            {adminNav.map(({ to, label, icon }) => (
                                <NavLink
                                    key={label}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'bg-muted text-primary'
                                            : 'text-muted-foreground hover:bg-muted'
                                        }`
                                    }
                                    onClick={onClose}
                                >
                                    {icon}
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <hr className="my-4 border-muted" />

                        {/* 🛠 Utility Routes */}
                        <nav className="space-y-2">
                            {utilityNav.map(({ to, label, icon }) => (
                                <NavLink
                                    key={label}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'bg-muted text-primary'
                                            : 'text-muted-foreground hover:bg-muted'
                                        }`
                                    }
                                    onClick={onClose}
                                >
                                    {icon}
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* 🚪 Logout */}
                    <Button
                        variant="outline"
                        className="mt-6 w-full"
                        onClick={() => {
                            dispatch(logout())
                            onClose()
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    )
}
