import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { useJobTracking } from '../useJobTracking'

const triggerMock = vi.fn()
const toastLoading = vi.fn()
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('sonner', () => ({
    toast: {
        loading: (...args: unknown[]) => toastLoading(...args),
        success: (...args: unknown[]) => toastSuccess(...args),
        error: (...args: unknown[]) => toastError(...args),
    },
}))

vi.mock('@/features/jobs/jobsApi', () => ({
    useLazyGetJobQuery: () => [triggerMock],
}))

function createResponse(status: 'queued' | 'running' | 'completed' | 'failed', result?: unknown) {
    return Promise.resolve({
        data: {
            job: {
                id: 'job-1',
                status,
            },
            ...(result ? { result } : {}),
        },
    })
}

describe('useJobTracking', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        localStorage.clear()
        triggerMock.mockReset()
        toastLoading.mockReset()
        toastSuccess.mockReset()
        toastError.mockReset()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('polls job until completion and triggers callbacks', async () => {
        const onComplete = vi.fn()
        const onViewResult = vi.fn()

        const responses = [
            createResponse('running'),
            createResponse('completed', { analysis: { matchScore: 80 } }),
        ]

        triggerMock.mockImplementation(() => ({
            unwrap: () => responses.shift() ?? createResponse('completed'),
        }))

        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        function TestComponent() {
            const { trackJob } = useJobTracking({
                jobId: null,
                onComplete,
                onViewResult,
                pollIntervalMs: 20,
            })

            useEffect(() => {
                trackJob('job-1')
            }, [trackJob])

            return null
        }

        await act(async () => {
            root.render(<TestComponent />)
        })

        expect(toastLoading).toHaveBeenCalled()

        await act(async () => {
            vi.advanceTimersByTime(20)
            await Promise.resolve()
        })

        await act(async () => {
            vi.advanceTimersByTime(20)
            await Promise.resolve()
        })

        expect(onComplete).toHaveBeenCalledWith({
            jobId: 'job-1',
            result: { analysis: { matchScore: 80 } },
        })
        expect(toastSuccess).toHaveBeenCalled()

        // Toast action should be wired
        const action = toastSuccess.mock.calls.at(-1)?.[1]?.action
        expect(action?.label).toBe('View')
        action?.onClick()
        expect(onViewResult).toHaveBeenCalledWith({
            jobId: 'job-1',
            result: { analysis: { matchScore: 80 } },
        })

        expect(localStorage.getItem('trackedJobs')).toBe('{}')

        await act(async () => {
            root.unmount()
        })
    })
})
