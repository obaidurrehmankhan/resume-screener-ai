import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Feedback } from '@/types/feedback'
import { Sparkles, User, Briefcase } from 'lucide-react'
import {
    Accordion,
    AccordionItem,
    AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/shared/SectionHeader'

type Props = {
    feedback: Feedback | null
    isLoading: boolean
}

export default function AiFeedbackPanel({ feedback, isLoading }: Props) {
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleAll = () => {
        if (openItems.length > 0) {
            setOpenItems([])
        } else {
            const all = ['summary', 'header', ...feedback!.suggestions.experience.map((_, i) => `exp-${i}`)]
            setOpenItems(all)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-1/3 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-5/6 bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="text-muted-foreground text-sm text-center italic">
                Upload your resume and job description to get AI-powered feedback here.
            </div>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 90)
            return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700'
        if (score >= 80)
            return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700'
        if (score >= 70)
            return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700'
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700'
    }

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {/* 🎯 ATS Score */}
            <motion.div
                className={`p-4 rounded-lg border ${getScoreColor(feedback.matchScore)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <p className="font-semibold text-lg">ATS Match Score</p>
                <p className="text-3xl font-bold">{feedback.matchScore}%</p>
            </motion.div>

            {/* 🔍 Missing Skills */}
            {feedback.missingSkills.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-base font-semibold text-foreground dark:text-white mb-2">
                        Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {feedback.missingSkills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 text-sm rounded-full bg-muted text-foreground border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 🧠 AI Suggestions */}
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between mt-6 mb-2">
                    <h3 className="text-xl font-semibold text-foreground dark:text-white">
                        AI Suggestions
                    </h3>
                    <Button size="sm" variant="outline" onClick={toggleAll}>
                        {openItems.length > 0 ? 'Collapse All' : 'Expand All'}
                    </Button>
                </div>

                <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
                    {/* Summary */}
                    <AccordionItem value="summary">
                        <SectionHeader
                            icon={<Sparkles className="w-4 h-4 text-primary" />}
                            label="Summary"
                            value="summary"
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                        />
                        <AccordionContent>
                            <ul className="list-decimal list-inside text-foreground dark:text-gray-100">
                                {feedback.suggestions.summary.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Header */}
                    <AccordionItem value="header">
                        <SectionHeader
                            icon={<User className="w-4 h-4 text-primary" />}
                            label="Header"
                            value="header"
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                        />
                        <AccordionContent>
                            <ul className="list-decimal list-inside text-foreground dark:text-gray-100">
                                {feedback.suggestions.header.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Experience */}
                    {feedback.suggestions.experience.map((exp, i) => {
                        const key = `exp-${i}`
                        return (
                            <AccordionItem key={key} value={key}>
                                <SectionHeader
                                    icon={<Briefcase className="w-4 h-4 text-primary" />}
                                    label={exp.title}
                                    value={key}
                                    openItems={openItems}
                                    setOpenItems={setOpenItems}
                                />
                                <AccordionContent>
                                    <ul className="list-decimal list-inside text-foreground dark:text-gray-100">
                                        {exp.suggestions.map((item, j) => (
                                            <li key={j}>{item}</li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </motion.div>
        </motion.div>
    )
}
