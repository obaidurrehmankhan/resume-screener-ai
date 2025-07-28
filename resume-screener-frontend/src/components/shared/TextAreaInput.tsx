// src/components/shared/TextAreaInput.tsx
type Props = {
    label: string
    value: string
    placeholder?: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function TextAreaInput({ label, value, placeholder, onChange }: Props) {
    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                {label}
            </h2>
            <textarea
                rows={6}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border rounded-md p-2 bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson"
            />
        </div>
    )
}
