// 🧱 AdminLayout: Used for all /admin/* routes with sidebar + header

import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { Toaster } from 'sonner'

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-muted/10 text-foreground">
            {/* 📊 Sidebar with admin nav */}
            <AdminSidebar />

            {/* 📄 Main content area */}
            <div className="flex flex-col flex-1 p-6">
                <AdminHeader />
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
