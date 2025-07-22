import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { store } from '@/lib/store' // Your Redux store
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Toaster } from 'sonner'

export const AppShell = () => {
    const initializeAuth = useAuthStore((state) => state.initializeAuth)
    const [isAuthChecked, setIsAuthChecked] = useState(false)

    useEffect(() => {
        const hydrate = async () => {
            if (initializeAuth) {
                await initializeAuth(store)
            }
            setIsAuthChecked(true)
        }

        hydrate()
    }, [initializeAuth])

    if (!isAuthChecked) {
        return <div className="p-4">Loading...</div>
    }

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
}

export default AppShell
