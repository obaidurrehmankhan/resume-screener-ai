// ✅ Import core Redux Toolkit functions
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// ✅ Define the shape of our authentication state
interface AuthState {
    token: string | null
    user: {
        id: number
        name: string
        email: string,
        role: string
    } | null
}

// ✅ Initialize state on app start
const initialState: AuthState = {
    // 🔐 Grab token from localStorage if available (persists login on refresh)
    token: localStorage.getItem('token'),
    user: null, // ⛔ We'll fetch user later via `/auth/me`
}

// ✅ Create the auth slice using Redux Toolkit
const authSlice = createSlice({
    name: 'auth',        // Slice name (used under the hood in Redux store)
    initialState,        // 🔄 Initial state
    reducers: {
        // ✅ Set token and save to localStorage
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
            localStorage.setItem('token', action.payload) // 💾 Persist token on client
        },

        // ✅ Set authenticated user details
        setUser: (state, action: PayloadAction<AuthState['user']>) => {
            state.user = action.payload
        },

        // 🔓 Log out user → clear both Redux state and localStorage
        logout: (state) => {
            state.token = null
            state.user = null
            localStorage.removeItem('token') // ❌ Clear token from storage
            // Clear any cached data
            localStorage.clear() // Clear all localStorage data
            sessionStorage.clear() // Clear all sessionStorage data
            // Import and use resetAuthState
            import('./authUtils').then(module => {
                module.resetAuthState()
            })
        },
    },
})

// ✅ Export actions to be used throughout the app (e.g., dispatch(setToken(...)))
export const { setToken, setUser, logout } = authSlice.actions

// ✅ Export the reducer to be injected into the store
export default authSlice.reducer
