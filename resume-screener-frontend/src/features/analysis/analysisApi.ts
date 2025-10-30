import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/features/auth/authApi'

export type AnalyzeDraftRequest = {
    draftId: string
    resumeText?: string
    jobDescription?: string
    idempotencyKey?: string
}

export type AnalyzeDraftResponse = {
    jobId: string
}

export const analysisApi = createApi({
    reducerPath: 'analysisApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        analyzeDraft: builder.mutation<AnalyzeDraftResponse, AnalyzeDraftRequest>({
            query: ({ draftId, resumeText, jobDescription, idempotencyKey }) => ({
                url: `/drafts/${draftId}/analysis`,
                method: 'POST',
                headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
                body: {
                    ...(resumeText ? { resumeText } : {}),
                    ...(jobDescription ? { jobDescription } : {}),
                },
            }),
            transformResponse: (response: { data?: { jobId: string } }) => {
                const jobId = response?.data?.jobId
                if (!jobId) {
                    throw new Error('Missing jobId in analysis response')
                }
                return { jobId }
            },
        }),
    }),
})

export const { useAnalyzeDraftMutation } = analysisApi
