import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isTokenExpired } from '@/utils/jwt'
import { getMeEndpoint } from './authApi'

/**
 * Define the structure of the user object returned by the backend (/me).
 */
export interface User {
    id: number
    email: string
    name: string
}

/**
 * Define the shape of the Zustand auth store:
 * - Holds JWT token and user
 * - Includes login, logout, setUser, and initializeAuth actions
 */
interface AuthState {
    user: User | null
    token: string | null
    login: (token: string) => void
    setUser: (user: User) => void
    logout: () => void
    initializeAuth?: (store: {
        dispatch: any
        getState: () => unknown
    }) => Promise<void>
}

/**
 * Zustand store using the `persist` middleware:
 * - Automatically saves state to localStorage
 * - Uses `partialize()` to filter what is persisted
 * - Uses `isTokenExpired()` to avoid restoring expired tokens
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            /**
             * Stores the token in the Zustand store.
             * Persist middleware will sync it to localStorage automatically.
             */
            login: (token: string) => {
                set({ token })
            },

            /**
             * Stores the user object after calling /me.
             */
            setUser: (user: User) => {
                set({ user })
            },

            /**
             * Logs the user out:
             * - Clears Zustand state
             * - Persist middleware removes from localStorage
             */
            logout: () => {
                set({ user: null, token: null })
                localStorage.removeItem('auth-storage')
            },

            /**
             * Initializes Zustand state on app load:
             * - Rehydrates token from localStorage
             * - Verifies token is valid
             * - Fetches user via RTK's internal `getMe` call
             */
            initializeAuth: async (store) => {
                const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}')
                const token = stored?.state?.token

                if (!token || isTokenExpired(token)) {
                    get().logout()
                    return
                }

                set({ token })

                try {
                    const result = await getMeEndpoint.initiate(undefined, {
                        forceRefetch: true,
                    })(store.dispatch, store.getState, undefined)

                    if ('data' in result) {
                        set({ user: result.data })
                    } else {
                        get().logout()
                    }
                } catch (err) {
                    console.error('initializeAuth failed:', err)
                    get().logout()
                }
            },
        }),
        {
            name: 'auth-storage', // The key used in localStorage

            /**
             * Filters what is persisted in localStorage:
             * - Only token is saved (not user)
             * - If token is expired, do not restore it
             */
            partialize: (state) => ({
                token: isTokenExpired(state.token ?? '') ? null : state.token,
                user: null, // always refetch user via /me
            }),

            /**
             * Prevents Zustand from immediately hydrating the store on init.
             * This avoids briefly showing stale state (e.g., expired tokens).
             * We will control rehydration manually in layout.
             */
            skipHydration: true,
        }
    )
)
