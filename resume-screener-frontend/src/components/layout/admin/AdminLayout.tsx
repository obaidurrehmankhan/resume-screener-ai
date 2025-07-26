// 🧱 AdminLayout: Used for all /admin/* routes with sidebar + header

import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { Toaster } from 'sonner'

const AdminLayout = () => {
    // 📌 Sidebar toggle state for mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-muted/20 relative text-foreground">
            {/* 📊 Sidebar (mobile + desktop) */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* 📄 Main content area */}
            <div className="flex flex-col flex-1 p-4 relative">
                <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
