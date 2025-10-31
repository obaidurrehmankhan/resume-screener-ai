import { Clock, RefreshCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GUEST_RETENTION_LINK } from '@/features/guest/guestStorage'

type GuestRestoreBannerProps = {
    savedAt: number
    retainUntil: number
    softRetainUntil: number
    onRestore: () => void
    onDismiss: () => void
}

const formatDateTime = (timestamp: number) => {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(timestamp))
    } catch {
        return new Date(timestamp).toLocaleString()
    }
}

export function GuestRestoreBanner({
    savedAt,
    retainUntil,
    softRetainUntil,
    onRestore,
    onDismiss,
}: GuestRestoreBannerProps) {
    return (
        <div className="mb-4 flex flex-col gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-400/70 dark:bg-amber-900/20 dark:text-amber-100">
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-200 p-2 text-amber-800 dark:bg-amber-800/60 dark:text-amber-100">
                    <Clock className="h-4 w-4" aria-hidden />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        Pick up where you left off
                    </p>
                    <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
                        We saved your last guest draft for 24 hours (soft retention for 72 hours). You can
                        restore it now or dismiss this reminder.
                    </p>
                    <p className="text-xs text-amber-900/70 dark:text-amber-100/70">
                        Saved on {formatDateTime(savedAt)} &middot; Guaranteed retention until {formatDateTime(retainUntil)} (soft until {formatDateTime(softRetainUntil)})
                    </p>
                    <a
                        className="text-xs font-medium text-amber-800 underline underline-offset-2 transition hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
                        href={GUEST_RETENTION_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Learn about our retention policy
                    </a>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={onRestore} className="gap-2">
                    <RefreshCcw className="h-4 w-4" aria-hidden />
                    Restore draft
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="gap-2 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-800/40"
                >
                    <XCircle className="h-4 w-4" aria-hidden />
                    Dismiss
                </Button>
            </div>
        </div>
    )
}

export default GuestRestoreBanner
