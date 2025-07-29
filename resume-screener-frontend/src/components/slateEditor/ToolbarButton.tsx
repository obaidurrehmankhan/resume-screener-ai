type ToolbarButtonProps = {
    active: boolean
    onClick: () => void
    label: React.ReactNode
    tooltip?: string
}

export default function ToolbarButton({ active, onClick, label, tooltip }: ToolbarButtonProps) {
    const baseClasses =
        'px-2 py-1 rounded border transition-all flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-1'

    const activeClasses = 'bg-crimson text-white border-crimson'
    const inactiveClasses =
        'text-zinc-800 border-zinc-300 hover:bg-zinc-100 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700'

    return (
        <button
            title={tooltip}
            onMouseDown={(e) => {
                e.preventDefault()
                setTimeout(onClick, 0)
            }}

            className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    )
}
