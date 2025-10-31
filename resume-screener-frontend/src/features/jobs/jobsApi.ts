import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/features/auth/authApi'

export type JobResponse = {
    data?: {
        job: {
            id: string
            status: 'queued' | 'running' | 'completed' | 'failed'
            draftId?: string
            type: string
            meta?: Record<string, unknown> | null
            error?: Record<string, unknown> | null
        }
        result?: unknown
    }
}

export const jobsApi = createApi({
    reducerPath: 'jobsApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getJob: builder.query<JobResponse, string>({
            query: (jobId: string) => `/jobs/${jobId}`,
        }),
    }),
})

export const { useGetJobQuery, useLazyGetJobQuery } = jobsApi
