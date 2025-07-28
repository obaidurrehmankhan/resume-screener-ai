// src/screens/UploadScreen.tsx
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import TextAreaInput from '@/components/shared/TextAreaInput'
import AiFeedbackPanel from '@/components/shared/AiFeedbackPanel'
import ResumeDropzone from '@/components/shared/ResumeDropdzone'
import type { Feedback } from '@/types/feedback'

export default function UploadScreen() {
    const isLoggedIn = useSelector((state: RootState) => Boolean(state.auth.token && state.auth.user))

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
            })
            setIsLoading(false)
        }, 2000)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 min-h-screen bg-background">
            {/* Left Panel */}
            <div className="space-y-6 border border-border rounded-lg p-6 bg-card shadow-md">
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
                    {/* Always show: AI Feedback button */}
                    <Button
                        variant="outline"
                        onClick={handleDummyFeedback}
                        disabled={!resume || !jobDescription}
                    >
                        Calculate AI Feedback
                    </Button>

                    {/* Show Rewrite button only if logged in */}
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
            <div className="border border-border rounded-lg p-6 bg-card shadow-md h-fit">
                <AiFeedbackPanel feedback={aiFeedback} isLoading={isLoading} />
            </div>
        </div>
    )
}