import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import AiFeedbackPanel from '@/components/shared/AiFeedbackPanel'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { RefreshCcw, Save, ScanSearch } from 'lucide-react'
import RichTextEditor from '@/components/rich-text-editor'
import { selectHasEntitlement } from '@/features/auth/authSelectors'
import type { RootState } from '@/app/store'

const tones = ['Formal', 'Casual', 'Friendly']

export default function RewriteScreen() {
    const navigate = useNavigate()
    const [selectedTone, setSelectedTone] = useState('Formal')

    const canExport = useSelector((state: RootState) => selectHasEntitlement(state, 'EXPORT'))
    const canViewMatch = useSelector((state: RootState) => selectHasEntitlement(state, 'MATCH_VIEW'))
    const canViewSuggestions = useSelector((state: RootState) => selectHasEntitlement(state, 'SUGGESTIONS_VIEW'))

    const panelsAllowed = useMemo(() => {
        const panels = ['ATS']
        if (canViewMatch) panels.push('MATCH')
        if (canViewSuggestions) panels.push('SUGGESTIONS')
        return panels
    }, [canViewMatch, canViewSuggestions])

    const dummySuggestions = useMemo(() => ({
        matchScore: 72,
        missingSkills: ['React', 'Node.js'],
        suggestions: {
            summary: [
                'Use more power verbs and specific achievements.',
                'Highlight your top skills aligned with the job.',
            ],
            header: ['Add LinkedIn profile link.', 'Use a professional email.'],
            experience: [
                {
                    title: 'Frontend Developer at ABC Corp',
                    suggestions: [
                        'Quantify your impact (e.g., improved load time by 30%).',
                        'Mention React/Redux if used.',
                    ],
                },
                {
                    title: 'Intern at XYZ Inc',
                    suggestions: [
                        'Highlight learnings or tech stack exposure.',
                        'Avoid generic statements like "worked on several projects".',
                    ],
                },
            ],
        },
        panelsAllowed,
    }), [panelsAllowed])

    const handleRegenerate = () => {
        console.log(`Regenerating with tone: ${selectedTone}`)
    }

    const handleSaveDraft = () => {
    }

    const handleCheckATS = () => {
        console.log('Sending updated resume for reanalysis...')
        navigate('/dashboard/upload', { state: { fromRewrite: true } })
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <h2 className="text-2xl font-semibold text-foreground dark:text-white">Rewrite Resume</h2>
            <p className="text-sm text-muted-foreground">
                Use the AI-powered editor to refine your resume, adjust the tone, and get suggestions tailored to your target job description.
            </p>
            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Panel */}
                <div className="w-full md:w-3/5 rounded-lg border border-border bg-card shadow-sm p-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                            AI-Rewritten Resume
                        </h3>

                    </div>

                    {/* Tone + Regenerate */}
                    <RichTextEditor />
                    {/* Tone + Regenerate */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Select onValueChange={setSelectedTone} defaultValue={selectedTone}>
                            <SelectTrigger className="w-[140px] border border-zinc-300 dark:border-zinc-700 text-sm">
                                <SelectValue placeholder="Tone" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-800 text-sm">
                                {tones.map((tone) => (
                                    <SelectItem key={tone} value={tone}>
                                        {tone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleRegenerate}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Regenerate
                        </Button>
                    </div>

                    {/* Save + ATS Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button variant="outline" onClick={handleSaveDraft}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={handleCheckATS}>
                            <ScanSearch className="w-4 h-4 mr-2" />
                            Check ATS Again
                        </Button>
                        <Button disabled={!canExport} title={!canExport ? 'Pro feature' : undefined}>
                            Finalize &amp; Download
                        </Button>
                    </div>

                </div>

                {/* Right Panel */}
                <div className="w-full md:w-2/5 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-border bg-card shadow-sm p-6">
                    <AiFeedbackPanel feedback={dummySuggestions} isLoading={false} />
                </div>
            </div>
        </div>
    )
}
