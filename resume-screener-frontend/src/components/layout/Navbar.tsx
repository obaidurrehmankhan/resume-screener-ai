// 📦 React Router & Redux hooks
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// 🔐 Logout action
import { logout } from '@/features/auth/authSlice'

// 🎨 UI Components & Radix Dropdown
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// 🔤 Icons
import { LogOut, User, ChevronDown } from 'lucide-react'

// 🧠 Typed Redux access
import type { RootState } from '@/app/store'

export const Navbar = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, token } = useSelector((state: RootState) => state.auth)
    const isAuthenticated = Boolean(token)
    const role = user?.role || 'guest'

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const publicLinks = [
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Contact', path: '/contact' },
        { label: 'Try Now', path: '/try' },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur bg-background/80 supports-[backdrop-filter]:bg-background/60 text-foreground shadow-sm transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* 🔷 Brand Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-primary font-brand tracking-tight"
                >
                    ScanHire AI
                </Link>

                {/* 🔗 Right-side actions */}
                <div className="flex items-center gap-4">
                    {/* 🌐 Guest nav links */}
                    {role === 'guest' && (
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`transition-all hover:text-primary ${pathname === link.path ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* 🌗 Theme toggle */}
                    <ThemeToggle />

                    {/* 👤 Authenticated user dropdown */}
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-accent text-accent-foreground hover:bg-accent/80 transition-all shadow-sm"
                                >
                                    {/* 🧑 Avatar circle */}
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                            {user.name?.[0] ?? 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* 📝 Name */}
                                    <span className="max-w-[100px] truncate text-foreground">
                                        {user.name}
                                    </span>

                                    {/* ⬇️ Down caret */}
                                    <ChevronDown size={16} className="text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-48 z-[9999] bg-background border shadow-lg rounded-md"
                            >
                                {/* 🔖 Header */}
                                <DropdownMenuLabel className="text-xs text-muted-foreground px-3 pt-2">
                                    My Account
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* 👤 Profile link */}
                                <DropdownMenuItem
                                    onClick={() => navigate('/dashboard/profile')}
                                    className="cursor-pointer hover:bg-muted/80 focus:bg-muted/80 focus:outline-none text-foreground"
                                >
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    My Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-destructive hover:text-destructive focus:text-destructive hover:bg-muted/80 focus:bg-muted/80 focus:outline-none"
                                >
                                    <LogOut className="mr-2 h-4 w-4 text-destructive" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // 🚪 Guest auth buttons
                        <>
                            <Link
                                to="/login"
                                className="hidden md:inline-flex px-4 py-2 text-sm rounded-md border border-border hover:bg-muted hover:text-foreground transition-all"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
