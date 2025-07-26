// 📦 React Router: Renders nested dashboard pages
import { Outlet } from 'react-router-dom'

// 🧱 Optional sidebar for dashboard navigation
import { DashboardSidebar } from './DashboardSidebar'

// 🔔 Toasts specific to dashboard context
import { Toaster } from 'sonner'

// 📘 Optional: Page breadcrumb or header
import { DashboardHeader } from './DashboardHeader'
import { useState } from 'react'

// 📦 DashboardLayout: Used inside /dashboard routes (auth-only)
const DashboardLayout = () => {
    // 📌 Track whether sidebar is open (for mobile screens)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-muted/20 relative">
            {/* 🧭 Sidebar Navigation */}
            <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* 🧱 Main Content Area */}
            <div className="flex flex-col flex-1 p-4 relative">
                <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </div>
        </div>
    )
}

export default DashboardLayout
