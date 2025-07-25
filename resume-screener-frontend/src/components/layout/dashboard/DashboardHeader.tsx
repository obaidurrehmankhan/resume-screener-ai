// 📘 Optional top header inside the dashboard for breadcrumbs or actions

import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

export const DashboardHeader = () => {
    const user = useSelector((state: RootState) => state.auth.user)

    return (
        <header className="mb-4 flex items-center justify-between border-b pb-2">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Welcome, {user?.name || 'User'} 👋</h2>
                <p className="text-sm text-muted-foreground">Here’s your resume dashboard</p>
            </div>
        </header>
    )
}
