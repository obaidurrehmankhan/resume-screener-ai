import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLazyGetJobQuery } from '@/features/jobs/jobsApi'
import { toast } from 'sonner'

const STORAGE_KEY = 'trackedJobs'
const DEFAULT_POLL_INTERVAL = 3000

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface JobTrackingState {
    jobId: string
    draftId?: string
    status: JobStatus
    result?: unknown
}

export interface UseJobTrackingOptions {
    jobId?: string | null
    onComplete?: (payload: { jobId: string; result?: unknown }) => void
    onFailed?: (payload: { jobId: string }) => void
    onViewResult?: (payload: { jobId: string; result?: unknown }) => void
    toastMessages?: {
        working?: string
        completed?: string
        failed?: string
    }
    pollIntervalMs?: number
}

const loadTrackedJobs = (): Record<string, { jobId: string; draftId?: string }> => {
    if (typeof window === 'undefined') {
        return {}
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return {}
        }

        const parsed = JSON.parse(raw)
        if (typeof parsed !== 'object' || !parsed) {
            return {}
        }

        return parsed as Record<string, { jobId: string; draftId?: string }>
    } catch (error) {
        console.warn('[useJobTracking] Unable to read tracked jobs from storage', error)
        return {}
    }
}

const persistTrackedJobs = (jobs: Record<string, { jobId: string; draftId?: string }>) => {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
    } catch (error) {
        console.warn('[useJobTracking] Unable to persist tracked jobs', error)
    }
}

export const useTrackedJobs = () => {
    return useMemo(() => loadTrackedJobs(), [])
}

export function useJobTracking({
    jobId,
    onComplete,
    onFailed,
    onViewResult,
    toastMessages,
    pollIntervalMs = DEFAULT_POLL_INTERVAL,
}: UseJobTrackingOptions) {
    const [triggerJobQuery] = useLazyGetJobQuery()
    const jobIdRef = useRef<string | null>(jobId ?? null)
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const cleanupPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }, [])

    const removeTrackedJob = useCallback((id: string) => {
        const stored = loadTrackedJobs()
        if (stored[id]) {
            delete stored[id]
            persistTrackedJobs(stored)
        }
    }, [])

    const trackJob = useCallback((id: string, draftId?: string) => {
        jobIdRef.current = id

        const existing = loadTrackedJobs()
        existing[id] = { jobId: id, draftId }
        persistTrackedJobs(existing)

        if (pollingRef.current) {
            clearInterval(pollingRef.current)
        }

        const toastId = `job-${id}`

        pollingRef.current = setInterval(async () => {
            try {
                const response = await triggerJobQuery(id, true).unwrap()
                const status = response.data?.job?.status as JobStatus | undefined

                if (!status) {
                    return
                }

                if (status === 'completed') {
                    cleanupPolling()
                    removeTrackedJob(id)
                    onComplete?.({ jobId: id, result: response.data?.result })
                    toast.success(toastMessages?.completed ?? 'Result ready', {
                        id: toastId,
                        action: onViewResult
                            ? {
                                label: 'View',
                                onClick: () => onViewResult({ jobId: id, result: response.data?.result }),
                            }
                            : undefined,
                    })
                } else if (status === 'failed') {
                    cleanupPolling()
                    removeTrackedJob(id)
                    toast.error(toastMessages?.failed ?? 'Analysis failed', {
                        id: toastId,
                        description: 'Please try again.',
                    })
                    onFailed?.({ jobId: id })
                }
            } catch (error) {
                console.debug('[useJobTracking] Unable to fetch job status', error)
            }
        }, pollIntervalMs)

        toast.loading(toastMessages?.working ?? 'Working on your analysis…', {
            id: toastId,
            duration: Math.max(pollIntervalMs - 500, 1000),
        })
    }, [cleanupPolling, onComplete, onFailed, onViewResult, pollIntervalMs, removeTrackedJob, toastMessages?.completed, toastMessages?.failed, toastMessages?.working, triggerJobQuery])

    useEffect(() => {
        const storedJobs = loadTrackedJobs()
        const jobIds = Object.keys(storedJobs)

        if (jobId && !storedJobs[jobId]) {
            storedJobs[jobId] = { jobId, draftId: undefined }
            persistTrackedJobs(storedJobs)
        }

        const idsToTrack = jobId ? [jobId, ...jobIds.filter((id) => id !== jobId)] : jobIds

        const firstId = idsToTrack[0]
        if (firstId) {
            trackJob(firstId, storedJobs[firstId]?.draftId)
        }

        return () => {
            cleanupPolling()
        }
    }, [cleanupPolling, jobId, trackJob])

    return {
        trackJob,
        stopTracking: cleanupPolling,
    }
}
