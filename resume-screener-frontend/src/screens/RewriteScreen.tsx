import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import AiFeedbackPanel from '@/components/shared/AiFeedbackPanel'
import SlateEditorInput from '@/components/shared/SlateEditorInput'
import type { Descendant } from 'slate'

const tones = ['Formal', 'Casual', 'Friendly']

export default function RewriteScreen() {
    const navigate = useNavigate()
    const [selectedTone, setSelectedTone] = useState('Formal')
    const [editorValue, setEditorValue] = useState<Descendant[]>([
        {
            type: 'paragraph',
            children: [
                {
                    text: 'Experienced software engineer with a strong background in full-stack development...',
                },
            ],
        },
    ])


    const [dummySuggestions] = useState({
        matchScore: 72,
        missingSkills: ['React', 'Node.js'],
        suggestions: {
            summary: [
                'Use more power verbs and specific achievements.',
                'Highlight your top skills aligned with the job.'
            ],
            header: ['Add LinkedIn profile link.', 'Use a professional email.'],
            experience: [
                {
                    title: 'Frontend Developer at ABC Corp',
                    suggestions: [
                        'Quantify your impact (e.g., improved load time by 30%).',
                        'Mention React/Redux if used.'
                    ]
                },
                {
                    title: 'Intern at XYZ Inc',
                    suggestions: [
                        'Highlight learnings or tech stack exposure.',
                        'Avoid generic statements like "worked on several projects".'
                    ]
                }
            ]
        }
    })

    useEffect(() => {
        setEditorValue([
            {
                type: 'paragraph',
                children: [
                    {
                        text: 'Experienced software engineer with a strong background in full-stack development. Successfully led projects, enhancing system performance by 50%. Proficient in React, Python, and AWS. Adaptable team player with excellent problem-solving abilities and a commitment to continuous improvement.'
                    }
                ]
            }
        ])
    }, [])

    const handleRegenerate = () => {
        console.log(`Regenerating with tone: ${selectedTone}`)
    }

    const handleSaveDraft = () => {
        console.log('Draft saved:', editorValue)
    }

    const handleCheckATS = () => {
        console.log('Sending updated resume for reanalysis...')
        navigate('/dashboard/upload', { state: { fromRewrite: true } })
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Panel */}
            <div className="w-full md:w-3/5 space-y-4">
                <h2 className="text-2xl font-semibold text-foreground dark:text-white">
                    Rewrite Resume
                </h2>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                        AI-Rewritten Resume
                    </h3>
                    <SlateEditorInput
                        value={editorValue}
                        onChange={setEditorValue}
                        placeholder="Start editing your improved resume here..."
                    />
                </div>

                {/* Tone and Regenerate */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <select
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-crimson"
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                    >
                        {tones.map((tone) => (
                            <option key={tone} value={tone}>
                                {tone}
                            </option>
                        ))}
                    </select>

                    <Button onClick={handleRegenerate}>Regenerate</Button>
                </div>

                {/* Save + ATS Check */}
                <div className="flex flex-wrap gap-3 pt-4">
                    <Button variant="outline" onClick={handleSaveDraft}>
                        Save Draft
                    </Button>
                    <Button onClick={handleCheckATS}>Check ATS Again</Button>
                </div>
            </div>

            {/* Right Panel - Suggestions */}
            <div className="w-full md:w-2/5 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <AiFeedbackPanel feedback={dummySuggestions} isLoading={false} />
            </div>
        </div>
    )
}
