import { Button } from '@/components/ui/button'

type UpgradeOverlayProps = {
    panel: string
    onUpgrade?: () => void
    actionLabel?: string
}

export function UpgradeOverlay({ panel, onUpgrade, actionLabel = 'Upgrade' }: UpgradeOverlayProps) {
    return (
        <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/85 backdrop-blur-sm">
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">Unlock {panel} insights</p>
                <p className="text-xs text-muted-foreground">Upgrade your plan to access this panel.</p>
            </div>
            <Button size="sm" onClick={onUpgrade}>
                {actionLabel}
            </Button>
        </div>
    )
}
