// 🛠 AdminHeader with responsive collapse support

import { Menu } from 'lucide-react'


type AdminHeaderProps = {
    onToggleSidebar: () => void
}

export const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {

    return (
        <header className="mb-6 flex items-center justify-between border-b pb-2">
            {/* 🍔 Hamburger (mobile only) */}
            <button
                className="md:hidden text-muted-foreground hover:text-primary transition"
                onClick={onToggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <Menu size={24} />
            </button>

            {/* 🧑‍💼 Admin Info */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage users, insights, and site-wide settings.
                </p>
            </div>

            {/* 🔒 Future admin actions placeholder */}
            <div className="hidden md:block">{/* e.g. Settings icon, filters, etc. */}</div>
        </header>
    )
}
