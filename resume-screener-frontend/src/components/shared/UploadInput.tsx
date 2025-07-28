import type { ChangeEvent } from 'react'


type Props = {
    label: string
    onFileUpload: (file: File) => void
    onTextPaste: (text: string) => void
}

export default function UploadInput({ label, onFileUpload, onTextPaste }: Props) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onFileUpload(file)
    }

    const handleTextPaste = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onTextPaste(e.target.value)
    }

    return (
        <div className="space-y-2">
            <label className="font-medium">{label}</label>
            <input type="file" onChange={handleFileChange} className="block" />
            <p className="text-sm text-muted-foreground">or paste resume content below</p>
            <textarea
                rows={6}
                placeholder="Paste resume here..."
                onChange={handleTextPaste}
                className="w-full border rounded-md p-2"
            />
        </div>
    )
}
