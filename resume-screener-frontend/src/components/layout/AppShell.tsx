import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { useGetMeQuery } from '@/features/auth/authApi'
import { Outlet } from 'react-router-dom'
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from 'sonner'

export const AppShell = () => {
    const { token, user, setUser, logout } = useAuthStore()

    // Call /me only if token exists and user is not yet loaded
    const { data, error, isSuccess } = useGetMeQuery(undefined, {
        skip: !token || !!user,
    })

    useEffect(() => {
        if (isSuccess && data) {
            setUser(data)
        }

        if (error && 'status' in error && error.status === 401) {
            logout()
        }
    }, [data, error, isSuccess, setUser, logout])

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
            <Navbar />
            <main className="flex-1">
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </main>
            <Footer />
        </div>
    )
};


export default AppShell
