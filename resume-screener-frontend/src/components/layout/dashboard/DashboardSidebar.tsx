// 📂 DashboardSidebar.tsx
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, UploadCloud, Repeat, ShieldCheck, X } from 'lucide-react'
import type { RootState } from '@/app/store'
import { useEffect, useRef } from 'react'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} />, exact: true },
    { to: '/dashboard/upload', label: 'Upload Resume', icon: <UploadCloud size={18} /> },
    { to: '/dashboard/rewrite', label: 'AI Rewrite', icon: <Repeat size={18} /> },
]

interface Props {
    isOpen: boolean
    onClose: () => void
}

export const DashboardSidebar = ({ isOpen, onClose }: Props) => {
    const user = useSelector((state: RootState) => state.auth.user)
    const sidebarRef = useRef<HTMLDivElement>(null)

    // 👆 Detect swipe to close
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
            {/* 🌑 Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden"
                    onClick={onClose}
                />
            )}

            {/* 🧭 Sidebar container */}
            <aside
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-background p-4 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* ❌ Close button (mobile only) */}
                <div className="flex items-center justify-end mb-4 md:hidden">
                    <button
                        className="text-muted-foreground hover:text-primary"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 📂 Main user dashboard nav */}
                <nav className="space-y-2">
                    {navItems.map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${isActive
                                    ? 'bg-muted text-primary'
                                    : 'text-muted-foreground hover:bg-muted'
                                }`
                            }
                            onClick={onClose} // ✅ Close sidebar on link click
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* 🛠 Divider + Admin panel access */}
                {user?.role === 'admin' && (
                    <>
                        <hr className="my-4 border-muted" />
                        <nav className="space-y-2">
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${isActive
                                        ? 'bg-muted text-primary'
                                        : 'text-muted-foreground hover:bg-muted'
                                    }`
                                }
                                onClick={onClose}
                            >
                                <ShieldCheck size={18} />
                                Back to Admin Panel
                            </NavLink>
                        </nav>
                    </>
                )}
            </aside>
        </>
    )
}
