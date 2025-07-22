/**
 * RTK Query Auth API Slice
 * - Handles authentication-related endpoints
 * - Injected into the base API in lib/api.ts
 */

import { api } from '@/lib/api'
import type { User } from './authStore'

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Login API
         * - POST /auth/login
         * - Expects: { email, password }
         * - Returns: { token }
         */
        login: builder.mutation<
            { token: string },
            { email: string; password: string }
        >({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
        }),

        /**
         * Register API
         * - POST /auth/register
         * - Expects: { name, profession, email, password }
         * - Returns: { token }
         */
        register: builder.mutation<
            { token: string },
            {
                name: string
                profession: string
                email: string
                password: string
            }
        >({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
        }),

        /**
         * Get current user (/me)
         * - GET /auth/me
         * - Requires Authorization header
         * - Returns: User object
         */
        getMe: builder.query<User, void>({
            query: () => '/auth/me',
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
} = authApi

export const getMeEndpoint = authApi.endpoints.getMe
