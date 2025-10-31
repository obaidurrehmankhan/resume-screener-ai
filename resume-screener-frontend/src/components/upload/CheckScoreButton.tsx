import { useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAnalyzeDraftMutation } from '@/features/analysis/analysisApi'

type CheckScoreButtonProps = {
    draftId?: string | null
    resumeText: string
    jobDescription: string
    onStart?: () => void
    onJobStarted?: (payload: { jobId: string; draftId?: string }) => void
    onDemoComplete?: (jobId: string) => void
    onViewJob?: (jobId: string) => void
    onError?: () => void
}

const DEMO_JOB_ID = 'demo-job'

const generateIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const extractErrorMessage = (error: unknown): string => {
    if (!error) return 'Please try again.'

    if (typeof error === 'string') {
        return error
    }

    if (typeof error === 'object') {
        if ('status' in error && 'data' in error) {
            const data = (error as { data?: unknown }).data
            if (data && typeof data === 'object' && 'error' in data) {
                const errObj = data.error as { message?: string }
                if (errObj?.message) {
                    return errObj.message
                }
            }
        }

        if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
            return (error as { message: string }).message
        }
    }

    return 'Please try again.'
}

export function CheckScoreButton({
    draftId,
    resumeText,
    jobDescription,
    onStart,
    onJobStarted,
    onDemoComplete,
    onViewJob,
    onError,
}: CheckScoreButtonProps) {
    const [analyzeDraft, { isLoading }] = useAnalyzeDraftMutation()

    const trimmedResume = resumeText.trim()
    const trimmedJob = jobDescription.trim()

    const disabled = isLoading || trimmedResume.length === 0 || trimmedJob.length === 0

    const handleDemoFlow = useCallback(() => {
        onStart?.()
        const toastId = toast.loading('Working on your analysis (demo)…')

        setTimeout(() => {
            onJobStarted?.({ jobId: DEMO_JOB_ID })
            onDemoComplete?.(DEMO_JOB_ID)
            toast.success('Result ready', {
                id: toastId,
                action: onViewJob
                    ? {
                        label: 'View',
                        onClick: () => onViewJob(DEMO_JOB_ID),
                    }
                    : undefined,
            })
        }, 800)
    }, [onDemoComplete, onJobStarted, onStart, onViewJob])

    const handleClick = async () => {
        if (disabled) {
            return
        }

        if (!draftId) {
            handleDemoFlow()
            return
        }

        onStart?.()

        try {
            const response = await analyzeDraft({
                draftId,
                resumeText: trimmedResume,
                jobDescription: trimmedJob,
                idempotencyKey: generateIdempotencyKey(),
            }).unwrap()

            onJobStarted?.({ jobId: response.jobId, draftId })
        } catch (error) {
            toast.error('Unable to start analysis', {
                description: extractErrorMessage(error),
            })
            onError?.()
        }
    }

    return (
        <Button variant="outline" onClick={handleClick} disabled={disabled}>
            {isLoading ? 'Analyzing…' : 'Check Score'}
        </Button>
    )
}

export default CheckScoreButton
