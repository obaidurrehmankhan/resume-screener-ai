// src/screens/UploadScreen.tsx
import { useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import TextAreaInput from '@/components/shared/TextAreaInput'
import AiFeedbackPanel from '@/components/shared/AiFeedbackPanel'
import ResumeDropzone from '@/components/shared/ResumeDropdzone'
import type { Feedback } from '@/types/feedback'
import { selectEntitlements, selectHasEntitlement } from '@/features/auth/authSelectors'
import CheckScoreButton from '@/components/upload/CheckScoreButton'

export default function UploadScreen() {
    const navigate = useNavigate()
    const location = useLocation()
    const currentDraftId =
        (location.state as { draftId?: string } | undefined)?.draftId ?? null
    const isLoggedIn = useSelector((state: RootState) => Boolean(state.auth.user))
    const canViewMatch = useSelector((state: RootState) => selectHasEntitlement(state, 'MATCH_VIEW'))
    const canViewSuggestions = useSelector((state: RootState) => selectHasEntitlement(state, 'SUGGESTIONS_VIEW'))
    const entitlements = useSelector(selectEntitlements)

    const panelsAllowed = useMemo(() => {
        const panels = ['ATS']
        if (canViewMatch) panels.push('MATCH')
        if (canViewSuggestions) panels.push('SUGGESTIONS')
        return panels
    }, [canViewMatch, canViewSuggestions])

    const [resume, setResume] = useState<File | string>('')
    const [jobDescription, setJobDescription] = useState('')
    const [aiFeedback, setAiFeedback] = useState<null | Feedback>(null)
    const [isPanelLoading, setIsPanelLoading] = useState(false)
    const [lastJobId, setLastJobId] = useState<string | null>(null)

    const buildDemoFeedback = useCallback((): Feedback => ({
        atsScore: 82,
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

    const handleAnalysisStart = () => {
        setIsPanelLoading(true)
        setAiFeedback(null)
    }

    const handleAnalysisSettled = () => {
        setIsPanelLoading(false)
    }

    const handleJobStarted = (jobId: string) => {
        setLastJobId(jobId)
    }

    const handleDemoComplete = () => {
        setAiFeedback(buildDemoFeedback())
    }

    const handleViewJob = (jobId: string) => {
        setLastJobId(jobId)
        navigate('/rewrite', { state: { jobId } })
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
                    <CheckScoreButton
                        draftId={currentDraftId}
                        resumeText={typeof resume === 'string' ? resume : ''}
                        jobDescription={jobDescription}
                        onStart={handleAnalysisStart}
                        onSettled={handleAnalysisSettled}
                        onJobStarted={handleJobStarted}
                        onDemoComplete={handleDemoComplete}
                        onViewJob={handleViewJob}
                    />

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
                <AiFeedbackPanel
                    feedback={aiFeedback}
                    isLoading={isPanelLoading}
                    entitlements={entitlements}
                />
                {lastJobId ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                        Tracking job <span className="font-mono text-foreground">{lastJobId}</span>
                    </p>
                ) : null}
            </div>
        </div>
    )
}
