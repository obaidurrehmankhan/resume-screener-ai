/**
 * Redux Store Setup
 * - Integrates RTK Query's API reducer and middleware
 * - Ready for future reducers (if needed)
 */



import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer, // Add RTK Query API reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware), // Add RTK Query middleware
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch