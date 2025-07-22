/**
 * RTK Query Base API Configuration
 * - This is where we configure the base URL for all API calls
 * - It auto-injects the JWT token from Zustand into every request header
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useAuthStore } from '@/features/auth/authStore'

export const api = createApi({
    reducerPath: 'api', // Mount point in the Redux store
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL, // Reads from .env → VITE_API_BASE_URL
        prepareHeaders: (headers) => {
            // Grab token from Zustand store
            const token = useAuthStore.getState().token
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: () => ({}), // Will be injected by modules like authApi
})
import '@/features/auth/authApi';
