import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Props = {
    onChange: (value: string) => void
}

export default function FontFamilySelect({ onChange }: Props) {
    return (
        <Select onValueChange={onChange}>
            <SelectTrigger
                className="w-[150px] text-sm px-3 py-1.5 rounded-md border shadow-sm
                   bg-white text-zinc-800 border-zinc-300
                   focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson
                   dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600"
            >
                <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-800 text-sm">
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
            </SelectContent>
        </Select>
    )
}
