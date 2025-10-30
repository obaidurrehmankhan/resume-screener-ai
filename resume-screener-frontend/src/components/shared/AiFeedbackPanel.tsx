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

/**
 * @deprecated Prefer importing ResultsWidget directly. This wrapper is kept
 * temporarily to avoid churn in screens that already reference the panel.
 */
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
