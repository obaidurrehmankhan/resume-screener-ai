import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur bg-background/80 supports-[backdrop-filter]:bg-background/60 text-foreground shadow-md transition-colors">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-primary">
                    ScanHire AI
                </Link>

                {/* Navigation + Actions */}
                <div className="flex items-center gap-4">
                    {/* Nav Links */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        {[
                            { label: "How It Works", path: "/how-it-works" },
                            { label: "Pricing", path: "/pricing" },
                            { label: "Contact", path: "/contact" },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`transition hover:text-primary ${pathname === link.path
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Login Button */}
                    <Link
                        to="/login"
                        className="hidden md:inline-flex px-4 py-2 text-sm rounded-md border border-border dark:border-white hover:bg-muted hover:text-foreground transition-colors"
                    >
                        Login
                    </Link>


                    {/* Register Button */}
                    <Link
                        to="/register"
                        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90 transition"
                    >
                        Get Started
                    </Link>

                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};
