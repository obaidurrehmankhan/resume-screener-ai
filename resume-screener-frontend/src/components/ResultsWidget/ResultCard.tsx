import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ResultCardStatus = 'ready' | 'loading' | 'error'

type ResultCardProps = {
    title: string
    icon?: ReactNode
    action?: ReactNode
    status?: ResultCardStatus
    errorMessage?: string
    onRetry?: () => void
    children: ReactNode
    className?: string
}

const loadingSkeleton = (
    <div className="space-y-3" aria-busy="true">
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
    </div>
)

export function ResultCard({
    title,
    icon,
    action,
    status = 'ready',
    errorMessage = 'Something went wrong while loading this panel.',
    onRetry,
    children,
    className,
}: ResultCardProps) {
    const showError = status === 'error'
    const showLoading = status === 'loading'

    return (
        <section
            className={cn(
                'rounded-lg border border-border bg-card p-4 shadow-sm transition',
                className,
            )}
        >
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                </div>
                {action}
            </header>

            <div className="mt-3">
                {showLoading ? (
                    loadingSkeleton
                ) : showError ? (
                    <div className="flex flex-col items-start gap-3 text-sm text-destructive">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" aria-hidden />
                            <span>{errorMessage}</span>
                        </div>
                        {onRetry ? (
                            <Button size="sm" variant="outline" onClick={onRetry}>
                                Try again
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    children
                )}
            </div>
        </section>
    )
}
