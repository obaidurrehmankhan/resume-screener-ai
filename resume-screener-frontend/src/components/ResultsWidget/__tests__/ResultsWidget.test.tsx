import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ResultsWidget } from '../ResultsWidget'
import type { Feedback } from '@/types/feedback'

const baseAnalysis: Feedback = {
    atsScore: 84,
    matchScore: 76,
    missingSkills: ['GraphQL'],
    suggestions: {
        summary: ['Add a concise headline.'],
        header: ['Include a professional email address.'],
        experience: [
            {
                title: 'Senior Engineer',
                suggestions: ['Quantify impact for key achievements.'],
            },
        ],
    },
    panelsAllowed: ['ATS'],
}

describe('ResultsWidget', () => {
    it('renders upgrade overlay when panel is not entitled', () => {
        const html = renderToString(<ResultsWidget analysis={baseAnalysis} isLoading={false} />)

        const normalised = html.replace(/<!--.*?-->/g, '')

        expect(normalised).toContain('pointer-events-none select-none opacity-40 blur-[1px]')
        expect(normalised).toContain('Unlock SUGGESTIONS insights')
    })

    it('shows loading skeleton when analysis is in progress', () => {
        const html = renderToString(<ResultsWidget analysis={null} isLoading />)

        expect(html).toContain('aria-busy="true"')
    })
})
