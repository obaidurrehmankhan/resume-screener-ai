export type ExperienceSuggestion = {
    title: string
    suggestions: string[]
}

export type Feedback = {
    matchScore: number
    missingSkills: string[]
    suggestions: {
        summary: string[]
        header: string[]
        experience: ExperienceSuggestion[]
    }
    panelsAllowed?: string[]
}
