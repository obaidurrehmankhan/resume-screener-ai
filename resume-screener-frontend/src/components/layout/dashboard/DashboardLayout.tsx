// 📦 React Router: Renders nested dashboard pages
import { Outlet } from 'react-router-dom'

// 🧱 Optional sidebar for dashboard navigation
import { DashboardSidebar } from './DashboardSidebar'

// 🔔 Toasts specific to dashboard context
import { Toaster } from 'sonner'

// 📘 Optional: Page breadcrumb or header
import { DashboardHeader } from './DashboardHeader'

// 📦 DashboardLayout: Used inside /dashboard routes (auth-only)
const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* 🧭 Sidebar Navigation */}
            <DashboardSidebar />

            {/* 🧱 Main Content Area */}
            <div className="flex flex-col flex-1 p-4">
                <DashboardHeader /> {/* Optional breadcrumb/header */}
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </div>
        </div>
    )
}

export default DashboardLayout
