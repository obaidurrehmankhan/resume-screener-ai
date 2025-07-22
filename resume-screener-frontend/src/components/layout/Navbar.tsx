import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/authStore"
import { Button } from "@/components/ui/button"

export const Navbar = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur bg-background/80 supports-[backdrop-filter]:bg-background/60 text-foreground shadow-sm dark:shadow-[0_1px_6px_rgba(255,255,255,0.06)] transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-primary font-brand tracking-tight transition-all duration-300">
                    ScanHire AI
                </Link>

                {/* Nav and actions */}
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        {[
                            { label: "How It Works", path: "/how-it-works" },
                            { label: "Pricing", path: "/pricing" },
                            { label: "Contact", path: "/contact" },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`transition-all duration-300 hover:text-primary ${pathname === link.path
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Actions */}
                    {user ? (
                        <>
                            {/* Elegant User Pill */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm font-medium text-foreground/80 dark:bg-white/5 transition-all duration-300">
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                                    {user.name?.[0] || "U"}
                                </div>
                                <span className="truncate max-w-[100px]">{user.name}</span>
                            </div>

                            {/* Logout */}
                            <Button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-muted/40 text-foreground hover:bg-muted/60 dark:hover:bg-white/10 transition-all duration-300"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Login / Register */}
                            <Link
                                to="/login"
                                className="hidden md:inline-flex px-4 py-2 text-sm rounded-md border border-border dark:border-white hover:bg-muted hover:text-foreground transition-all duration-300"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all duration-300"
                            >
                                Get Started
                            </Link>
                        </>
                    )}


                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
