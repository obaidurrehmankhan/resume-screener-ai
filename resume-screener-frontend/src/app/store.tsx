// 🛠️ Redux Toolkit's helper to create the store with good defaults
import { configureStore } from '@reduxjs/toolkit'

// 🌐 RTK Query API definition — contains login, register, getMe, etc.
import { authApi } from '@/features/auth/authApi'
import { analysisApi } from '@/features/analysis/analysisApi'

// 🔐 Auth slice — handles session user, plan, entitlements
import authReducer from '@/features/auth/authSlice'

// 🔁 Optional helper from RTK Query to enable refetch on reconnect/focus
import { setupListeners } from '@reduxjs/toolkit/query'

// 🧠 Create the Redux store
export const store = configureStore({
    reducer: {
        // 👇 RTK Query's reducer for API caching & state (under 'authApi' key)
        [authApi.reducerPath]: authApi.reducer,
        [analysisApi.reducerPath]: analysisApi.reducer,

        // 👇 Our custom auth reducer (holds session details)
        auth: authReducer,
    } as any,

    // ⚙️ Add RTK Query's middleware to handle API caching, invalidation, etc.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }).concat(authApi.middleware, analysisApi.middleware),
})

// 🔁 Enable automatic re-fetching on window focus or reconnect
setupListeners(store.dispatch)

// 🔤 Types for usage in typed hooks (useSelector, useDispatch)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
