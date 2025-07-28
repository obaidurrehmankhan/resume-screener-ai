import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    icon: React.ReactNode
    label: string
    value: string
    openItems: string[]
    setOpenItems: (items: string[]) => void
}

export const SectionHeader = ({
    icon,
    label,
    value,
    openItems,
    setOpenItems,
}: Props) => {
    const isOpen = openItems.includes(value)

    const toggleItem = () => {
        if (isOpen) {
            setOpenItems(openItems.filter((v) => v !== value))
        } else {
            setOpenItems([...openItems, value])
        }
    }

    return (
        <button
            type="button"
            onClick={toggleItem}
            className={cn(
                'flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors w-full',
                isOpen ? 'text-primary font-semibold' : 'text-foreground dark:text-white',
                'hover:bg-muted dark:hover:bg-zinc-800'
            )}
        >
            <span className="flex items-center gap-2">
                <span className="w-5 h-5">{icon}</span>
                <span>{label}</span>
            </span>
            <ChevronDown
                className={cn(
                    'w-4 h-4 transform transition-transform duration-300',
                    isOpen ? 'rotate-180 text-crimson-600' : 'rotate-0 text-muted-foreground'
                )}
            />
        </button>
    )
}
