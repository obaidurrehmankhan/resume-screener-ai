import type { Feedback } from '@/types/feedback'
import { ResultsWidget } from '@/components/ResultsWidget/ResultsWidget'

type AiFeedbackPanelProps = {
    feedback: Feedback | null
    isLoading: boolean
    error?: string | null
    onRetry?: () => void
    entitlements?: string[]
    onUpgrade?: () => void
}

// Prefer importing ResultsWidget directly. This wrapper remains for legacy usage.
export default function AiFeedbackPanel({
    feedback,
    isLoading,
    error,
    onRetry,
    entitlements,
    onUpgrade,
}: AiFeedbackPanelProps) {
    return (
        <ResultsWidget
            analysis={feedback}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            entitlements={entitlements}
            panelsAllowed={feedback?.panelsAllowed ?? feedback?.panels_allowed}
            onUpgrade={onUpgrade}
        />
    )
}
