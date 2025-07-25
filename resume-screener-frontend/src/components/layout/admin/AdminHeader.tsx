// 📘 AdminHeader: Optional top bar for admin insights

export const AdminHeader = () => {
    return (
        <header className="mb-6 border-b pb-2">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage users, insights, and site-wide settings.</p>
        </header>
    )
}
