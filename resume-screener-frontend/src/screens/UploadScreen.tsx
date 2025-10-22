// src/screens/UploadScreen.tsx
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import TextAreaInput from '@/components/shared/TextAreaInput'
import AiFeedbackPanel from '@/components/shared/AiFeedbackPanel'
import ResumeDropzone from '@/components/shared/ResumeDropdzone'
import type { Feedback } from '@/types/feedback'
import { selectHasEntitlement } from '@/features/auth/authSelectors'

export default function UploadScreen() {
    const isLoggedIn = useSelector((state: RootState) => Boolean(state.auth.user))
    const canViewMatch = useSelector((state: RootState) => selectHasEntitlement(state, 'MATCH_VIEW'))
    const canViewSuggestions = useSelector((state: RootState) => selectHasEntitlement(state, 'SUGGESTIONS_VIEW'))

    const panelsAllowed = useMemo(() => {
        const panels = ['ATS']
        if (canViewMatch) panels.push('MATCH')
        if (canViewSuggestions) panels.push('SUGGESTIONS')
        return panels
    }, [canViewMatch, canViewSuggestions])

    const [resume, setResume] = useState<File | string>('')
    const [jobDescription, setJobDescription] = useState('')
    const [aiFeedback, setAiFeedback] = useState<null | Feedback>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleDummyFeedback = () => {
        setIsLoading(true)

        setTimeout(() => {
            setAiFeedback({
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
            })
            setIsLoading(false)
        }, 2000)
    }

    return (
        <div className="grid min-h-screen grid-cols-1 gap-6 bg-background p-6 md:grid-cols-2">
            {/* Left Panel */}
            <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-md">
                <ResumeDropzone
                    value={typeof resume === 'string' ? resume : ''}
                    onChange={(val) => setResume(val)}
                />

                <TextAreaInput
                    label="Paste Job Description"
                    placeholder="Paste or upload a job description..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDummyFeedback}
                        disabled={!resume || !jobDescription}
                    >
                        Calculate AI Feedback
                    </Button>

                    {isLoggedIn && (
                        <Button asChild disabled={!resume || !jobDescription}>
                            <Link to="/rewrite" state={{ resume, jobDescription }}>
                                Go to Rewrite Resume
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="h-fit rounded-lg border border-border bg-card p-6 shadow-md">
                <AiFeedbackPanel feedback={aiFeedback} isLoading={isLoading} />
            </div>
        </div>
    )
}
