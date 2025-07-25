// 📦 React hooks
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

// 🧠 Redux hooks & store
import { useDispatch, useSelector } from 'react-redux'
import { store } from '@/app/store'

// 🧱 Layout components
import { Navbar } from './Navbar'
import { Footer } from './Footer'

// 🔔 Toast notifications
import { Toaster } from 'sonner'

// 🌐 RTK Query: hydrate user
import { authApi } from '@/features/auth/authApi'
import { setUser } from '@/features/auth/authSlice'
import type { RootState } from '@/app/store'

// 🧩 AppShell: Global wrapper for all routes
const AppShell = () => {
    const dispatch = useDispatch()
    const location = useLocation()

    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const token = useSelector((state: RootState) => state.auth.token)

    // 🌍 Determine whether to show full Footer
    const hideFooterFor = ['/dashboard', '/dashboard/', '/admin', '/admin/']
    const isDashboardOrAdmin = hideFooterFor.some(path => location.pathname.startsWith(path))

    useEffect(() => {
        const hydrateAuth = async () => {
            if (token) {
                try {
                    const result: any = await store.dispatch(authApi.endpoints.getMe.initiate())
                    if ('data' in result) {
                        dispatch(setUser(result.data))
                    }
                } catch (err) {
                    console.error('❌ Auth hydration failed', err)
                }
            }
            setIsAuthChecked(true)
        }

        hydrateAuth()
    }, [dispatch, token])

    if (!isAuthChecked) {
        return <div className="p-4 text-muted-foreground">Loading...</div>
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
            <Navbar />
            <main className="flex-1">
                <Toaster position="top-right" theme="system" />
                <Outlet />
            </main>

            {/* 🦶 Conditionally render footer */}
            {!isDashboardOrAdmin && <Footer />}
        </div>
    )
}

export default AppShell
