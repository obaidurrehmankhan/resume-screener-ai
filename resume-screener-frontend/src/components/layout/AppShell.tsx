// 📦 React hooks
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

// 🧠 Redux hooks & store
import { useDispatch, useSelector } from 'react-redux'

// 🧱 Layout components
import { Navbar } from './Navbar'
import { Footer } from './Footer'

// 🔔 Toast notifications
import { Toaster } from 'sonner'

// 🌐 RTK Query: hydrate user
import { useLazyGetMeQuery } from '@/features/auth/authApi'
import { clearSession, setHydrated, setSession } from '@/features/auth/authSlice'
import { selectAuthHydrated } from '@/features/auth/authSelectors'
import type { RootState } from '@/app/store'

// 🧩 AppShell: Global wrapper for all routes
const AppShell = () => {
    const dispatch = useDispatch()
    const location = useLocation()

    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const user = useSelector((state: RootState) => state.auth.user)
    const hydrated = useSelector(selectAuthHydrated)
    const [fetchSession] = useLazyGetMeQuery()

    // 🌍 Determine whether to show full Footer
    const hideFooterFor = ['/dashboard', '/dashboard/', '/admin', '/admin/']
    const isDashboardOrAdmin = hideFooterFor.some(path => location.pathname.startsWith(path))

    useEffect(() => {
        if (hydrated) {
            setIsAuthChecked(true)
            return
        }

        const hydrateAuth = async () => {
            try {
                const session = await fetchSession().unwrap()
                dispatch(
                    setSession({
                        user: {
                            id: session.id,
                            name: session.name,
                            email: session.email,
                            role: session.role,
                        },
                        plan: session.plan,
                        entitlements: session.entitlements,
                    })
                )
            } catch {
                dispatch(clearSession())
            } finally {
                dispatch(setHydrated(true))
            }
        }

        hydrateAuth()
    }, [dispatch, fetchSession, hydrated])

    useEffect(() => {
        if (hydrated) {
            setIsAuthChecked(true)
        }
    }, [hydrated])

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
