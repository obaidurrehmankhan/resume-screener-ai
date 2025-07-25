import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, UploadCloud, Repeat, ShieldCheck } from 'lucide-react'
import type { RootState } from '@/app/store'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} />, exact: true },
    { to: '/dashboard/upload', label: 'Upload Resume', icon: <UploadCloud size={18} /> },
    { to: '/dashboard/rewrite', label: 'AI Rewrite', icon: <Repeat size={18} /> },
]

export const DashboardSidebar = () => {
    const user = useSelector((state: RootState) => state.auth.user)

    return (
        <aside className="w-64 border-r bg-white dark:bg-background p-4 flex flex-col justify-between">
            <div>
                {/* 📂 Main user dashboard nav */}
                <nav className="space-y-2">
                    {navItems.map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${isActive
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

                {/* 🛠 Divider + Admin panel access */}
                {user?.role === 'admin' && (
                    <>
                        <hr className="my-4 border-muted" />

                        <nav className="space-y-2">
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${isActive
                                        ? 'bg-muted text-primary'
                                        : 'text-muted-foreground hover:bg-muted'
                                    }`
                                }
                            >
                                <ShieldCheck size={18} />
                                Back to Admin Panel
                            </NavLink>
                        </nav>
                    </>
                )}
            </div>
        </aside>
    )
}
