// src/components/shared/ResumeDropzone.tsx
import { useRef, useState } from 'react'
import { CloudUpload, Loader2, XCircle } from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'

interface Props {
    value: string | File
    onChange: (value: string | File) => void
}

export default function ResumeDropzone({ value, onChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [mode, setMode] = useState<'file' | 'text'>(typeof value === 'string' ? 'text' : 'file')
    const [fileName, setFileName] = useState('')

    const MAX_FILE_SIZE_MB = 5

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && validateFile(file)) {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit')
                return
            }
            setIsUploading(true)
            setMode('file')
            setFileName(file.name)
            onChange(file)
            setTimeout(() => setIsUploading(false), 1000)
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (validateText(text)) {
            setMode('text')
        }
        onChange(text)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && validateFile(file)) {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit')
                return
            }
            setIsUploading(true)
            setMode('file')
            setFileName(file.name)
            onChange(file)
            setTimeout(() => setIsUploading(false), 1000)
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
            fileInputRef.current?.click()
        }
    }

    const validateFile = (file: File) => {
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        return allowed.includes(file.type)
    }

    const validateText = (text: string) => {
        return true
    }

    const clearContent = () => {
        onChange('')
        setMode('text')
        setFileName('')
    }

    return (
        <div className="space-y-2 animate-fade-in">
            <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">Upload Resume</h2>
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={clsx(
                    'transition relative rounded-xl p-6 bg-background text-foreground border-2 border-dashed',
                    isDragging ? 'border-crimson/70 bg-muted' : 'border-[2px] border-gray-300 dark:border-gray-600 border-dotted hover:border-crimson'
                )}
            >
                <div className="flex flex-col items-center text-center transition-all duration-300 ease-in-out">
                    {isUploading ? (
                        <Loader2 className="animate-spin text-crimson mb-3" size={32} />
                    ) : (
                        <CloudUpload className="text-crimson mb-3" size={32} />
                    )}
                    <p className="text-sm text-muted-foreground">
                        {mode === 'file' && fileName ? `Uploaded: ${fileName}` : 'Choose file or drag and drop'}
                    </p>
                </div>

                {mode === 'text' && (
                    <textarea
                        rows={6}
                        placeholder="Paste resume text (PDF/DOCX only, max 5MB for files)"
                        value={typeof value === 'string' ? value : ''}
                        onChange={handleTextChange}
                        className="w-full mt-4 border rounded-md p-2 bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson"
                    />
                )}

                {(value && (typeof value === 'string' ? value.length > 0 : fileName)) && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            clearContent()
                        }}
                        className="absolute top-3 right-3 text-crimson hover:opacity-90"
                    >
                        <XCircle size={18} />
                    </button>
                )}

                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <div className="text-xs text-muted-foreground">Only PDF and DOCX files allowed. Max file size: 5MB. You may also paste plain text above.</div>
        </div>
    )
}
