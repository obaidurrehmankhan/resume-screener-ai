// 📦 React hooks
import { useEffect, useState } from 'react'

// 🧭 React Router: handles nested routing
import { Outlet } from 'react-router-dom'

// 🧠 Redux: read from and write to the Redux store
import { useDispatch, useSelector } from 'react-redux'
import { store } from '@/app/store'

// 🧱 Layout components
import { Navbar } from './Navbar'
import { Footer } from './Footer'

// 🔔 Toast notifications
import { Toaster } from 'sonner'

// 🌐 RTK Query endpoint to fetch user details
import { authApi } from '@/features/auth/authApi'

// 🔐 Redux action to set user data
import { setUser } from '@/features/auth/authSlice'

// 🔤 For typed useSelector usage
import type { RootState } from '@/app/store'

// 🧩 AppShell: The layout wrapper for all pages
export const AppShell = () => {
    const dispatch = useDispatch()

    // ✅ Auth check flag to avoid rendering app until token is validated
    const [isAuthChecked, setIsAuthChecked] = useState(false)

    // 🔐 Get token from Redux store to check if user might be logged in
    const token = useSelector((state: RootState) => state.auth.token)

    // 🔁 On app load (or token change), check if session is valid
    useEffect(() => {
        const hydrateAuth = async () => {
            if (token) {
                try {
                    // 🧠 Call the `/auth/me` endpoint manually
                    const result: any = await store.dispatch(
                        authApi.endpoints.getMe.initiate()
                    )

                    // ✅ If successful, store user in Redux
                    if ('data' in result) {
                        dispatch(setUser(result.data))
                    }
                } catch (error) {
                    console.error('Auth hydration failed:', error)
                }
            }

            // 🏁 Mark auth check as complete so app can render
            setIsAuthChecked(true)
        }

        hydrateAuth()
    }, [dispatch, token])

    // ⏳ Don't render anything until auth check is complete
    if (!isAuthChecked) {
        return <div className="p-4">Loading...</div>
    }

    // ✅ Once ready, show the app layout with nav, content, footer
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
