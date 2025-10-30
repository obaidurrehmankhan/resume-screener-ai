import { useMemo, useState } from 'react'
import {
    Gauge,
    Target,
    ListChecks,
    Sparkles,
    User,
    Briefcase,
} from 'lucide-react'
import type { Feedback } from '@/types/feedback'
import { ResultCard } from './ResultCard'
import { UpgradeOverlay } from './UpgradeOverlay'
import { Button } from '@/components/ui/button'
import {
    Accordion,
    AccordionItem,
    AccordionContent,
} from '@/components/ui/accordion'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { cn } from '@/lib/utils'

type ResultsWidgetProps = {
    analysis: Feedback | null
    isLoading: boolean
    error?: string | null
    onRetry?: () => void
    panelsAllowed?: string[]
    entitlements?: string[]
    onUpgrade?: () => void
}

const entitlementPanelMap: Record<string, string> = {
    ATS_VIEW: 'ATS',
    MATCH_VIEW: 'MATCH',
    SUGGESTIONS_VIEW: 'SUGGESTIONS',
}

function normalisePanels(values: string[] | undefined | null): string[] {
    if (!values) return []
    return values.map((value) => value.toUpperCase())
}

export function ResultsWidget({
    analysis,
    isLoading,
    error,
    onRetry,
    panelsAllowed,
    entitlements,
    onUpgrade,
}: ResultsWidgetProps) {
    const [openItems, setOpenItems] = useState<string[]>([])

    const derivedPanels = useMemo(() => {
        const allowed = new Set<string>()

        const analysisPanels = [
            ...normalisePanels(analysis?.panelsAllowed),
            ...normalisePanels(analysis?.panels_allowed),
        ]
        for (const panel of analysisPanels) {
            allowed.add(panel)
        }

        for (const panel of normalisePanels(panelsAllowed)) {
            allowed.add(panel)
        }

        if (entitlements && entitlements.length > 0) {
            entitlements.forEach((entitlement) => {
                const panel = entitlementPanelMap[entitlement]
                if (panel) {
                    allowed.add(panel)
                }
            })
        }

        if (allowed.size === 0) {
            allowed.add('ATS')
        }

        return allowed
    }, [analysis, panelsAllowed, entitlements])

    const cardStatus = error ? 'error' : isLoading ? 'loading' : 'ready'
    const atsScore = analysis?.atsScore ?? analysis?.matchScore ?? null
    const matchScore = analysis?.matchScore ?? null
    const missingSkills = analysis?.missingSkills ?? []
    const suggestions = analysis?.suggestions ?? {
        summary: [],
        header: [],
        experience: [],
    }
    const hasAnalysis = Boolean(analysis)

    const toggleAllSuggestions = () => {
        if (!hasAnalysis) return

        if (openItems.length > 0) {
            setOpenItems([])
            return
        }

        const keys = ['summary', 'header', ...(suggestions.experience?.map((_, index) => `exp-${index}`) ?? [])]
        setOpenItems(keys)
    }

    const renderPanel = (
        panel: string,
        component: JSX.Element,
    ) => {
        const isAllowed = derivedPanels.has(panel)

        return (
            <div className="relative">
                {component}
                {!isAllowed ? (
                    <UpgradeOverlay panel={panel} onUpgrade={onUpgrade} />
                ) : null}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {renderPanel(
                'ATS',
                <ResultCard
                    title="ATS Score"
                    icon={<Gauge className="h-4 w-4 text-primary" aria-hidden />}
                    status={cardStatus}
                    onRetry={cardStatus === 'error' ? onRetry : undefined}
                    errorMessage="Unable to load ATS score."
                    className={cn(!derivedPanels.has('ATS') && 'pointer-events-none select-none opacity-40 blur-[1px]')}
                >
                    {atsScore !== null && cardStatus === 'ready' ? (
                        <div>
                            <p className="text-4xl font-semibold text-foreground">{atsScore}%</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Higher scores mean your resume is well optimised for ATS parsing.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {hasAnalysis
                                ? 'No ATS score available for this draft.'
                                : 'Run an analysis to see how your resume performs with ATS systems.'}
                        </p>
                    )}
                </ResultCard>,
            )}

            {renderPanel(
                'MATCH',
                <ResultCard
                    title="Role Match"
                    icon={<Target className="h-4 w-4 text-primary" aria-hidden />}
                    status={cardStatus}
                    onRetry={cardStatus === 'error' ? onRetry : undefined}
                    errorMessage="Unable to load match insights."
                    className={cn(!derivedPanels.has('MATCH') && 'pointer-events-none select-none opacity-40 blur-[1px]')}
                >
                    {matchScore !== null && cardStatus === 'ready' ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-3xl font-semibold text-foreground">{matchScore}%</p>
                            <p className="text-sm text-muted-foreground">
                                This score reflects how closely your resume aligns with the job description.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {hasAnalysis
                                ? 'Match insights are not available for this analysis.'
                                : 'Kick off an analysis to understand how well you align to the role.'}
                        </p>
                    )}
                </ResultCard>,
            )}

            {renderPanel(
                'MATCH',
                <ResultCard
                    title="Missing Skills"
                    icon={<ListChecks className="h-4 w-4 text-primary" aria-hidden />}
                    status={cardStatus}
                    onRetry={cardStatus === 'error' ? onRetry : undefined}
                    errorMessage="Unable to load missing skills."
                    className={cn(!derivedPanels.has('MATCH') && 'pointer-events-none select-none opacity-40 blur-[1px]')}
                >
                    {cardStatus === 'ready' ? (
                        missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {missingSkills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {hasAnalysis
                                    ? 'Great news—no missing skills were detected for this job description.'
                                    : 'Run an analysis to highlight gaps between your resume and the job posting.'}
                            </p>
                        )
                    ) : null}
                </ResultCard>,
            )}

            {renderPanel(
                'SUGGESTIONS',
                <ResultCard
                    title="AI Suggestions"
                    icon={<Sparkles className="h-4 w-4 text-primary" aria-hidden />}
                    status={cardStatus}
                    onRetry={cardStatus === 'error' ? onRetry : undefined}
                    errorMessage="Unable to load AI suggestions."
                    action={
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={toggleAllSuggestions}
                            disabled={!hasAnalysis || cardStatus !== 'ready'}
                        >
                            {openItems.length > 0 ? 'Collapse All' : 'Expand All'}
                        </Button>
                    }
                    className={cn(
                        'space-y-4',
                        !derivedPanels.has('SUGGESTIONS') && 'pointer-events-none select-none opacity-40 blur-[1px]',
                    )}
                >
                    {cardStatus === 'ready' && hasAnalysis ? (
                        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
                            <AccordionItem value="summary">
                                <SectionHeader
                                    icon={<Sparkles className="h-4 w-4 text-primary" />}
                                    label="Summary"
                                    value="summary"
                                    openItems={openItems}
                                    setOpenItems={setOpenItems}
                                />
                                <AccordionContent>
                                    <ul className="list-decimal list-inside text-sm text-foreground">
                                        {suggestions.summary.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="header">
                                <SectionHeader
                                    icon={<User className="h-4 w-4 text-primary" />}
                                    label="Header"
                                    value="header"
                                    openItems={openItems}
                                    setOpenItems={setOpenItems}
                                />
                                <AccordionContent>
                                    <ul className="list-decimal list-inside text-sm text-foreground">
                                        {suggestions.header.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {suggestions.experience.map((exp, index) => {
                                const key = `exp-${index}`
                                return (
                                    <AccordionItem key={key} value={key}>
                                        <SectionHeader
                                            icon={<Briefcase className="h-4 w-4 text-primary" />}
                                            label={exp.title}
                                            value={key}
                                            openItems={openItems}
                                            setOpenItems={setOpenItems}
                                        />
                                        <AccordionContent>
                                            <ul className="list-decimal list-inside text-sm text-foreground">
                                                {exp.suggestions.map((item, subIndex) => (
                                                    <li key={subIndex}>{item}</li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {hasAnalysis
                                ? 'No suggestions are available for this draft.'
                                : 'Run an analysis to receive tailored improvements for your resume.'}
                        </p>
                    )}
                </ResultCard>,
            )}
        </div>
    )
}

export default ResultsWidget
