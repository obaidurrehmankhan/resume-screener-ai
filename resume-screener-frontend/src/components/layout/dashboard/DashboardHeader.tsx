// 📘 Optional top header inside the dashboard for breadcrumbs or actions

import { Menu } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

type DashboardHeaderProps = {
    onToggleSidebar: () => void
}

export const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
    const user = useSelector((state: RootState) => state.auth.user)

    return (
        <header className="mb-4 flex items-center justify-between border-b pb-2">
            {/* 🍔 Hamburger for mobile (visible only on small screens) */}
            <button
                className="md:hidden text-muted-foreground hover:text-primary transition"
                onClick={onToggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <Menu size={24} />
            </button>

            {/* 👋 Welcome Text */}
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                    Welcome, {user?.name || 'User'} 👋
                </h2>
                <p className="text-sm text-muted-foreground">Here’s your resume dashboard</p>
            </div>

            {/* 🔒 You can add action buttons (e.g., settings) here in the future */}
        </header>
    )
}
