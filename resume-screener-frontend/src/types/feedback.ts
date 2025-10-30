export type ExperienceSuggestion = {
    title: string
    suggestions: string[]
}

export type Feedback = {
    atsScore?: number
    matchScore: number
    missingSkills: string[]
    suggestions: {
        summary: string[]
        header: string[]
        experience: ExperienceSuggestion[]
    }
    panelsAllowed?: string[]
    panels_allowed?: string[]
}
