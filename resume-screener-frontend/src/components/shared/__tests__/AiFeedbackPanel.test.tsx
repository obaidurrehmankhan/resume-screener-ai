import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import AiFeedbackPanel from '../AiFeedbackPanel';
import type { Feedback } from '@/types/feedback';

const baseFeedback: Feedback = {
  matchScore: 85,
  missingSkills: ['TypeScript'],
  suggestions: {
    summary: ['Keep summary concise'],
    header: ['Add contact details'],
    experience: [
      {
        title: 'Engineer',
        suggestions: ['Quantify accomplishments'],
      },
    ],
  },
  panelsAllowed: ['ATS', 'MATCH', 'SUGGESTIONS'],
};

describe('AiFeedbackPanel', () => {
  it('renders all panels when entitlements allow them', () => {
    const html = renderToString(<AiFeedbackPanel feedback={baseFeedback} isLoading={false} />);
    expect(html).not.toContain('Upgrade to unlock');
  });

  it('shows upgrade overlay when panels are disallowed', () => {
    const limited: Feedback = { ...baseFeedback, panelsAllowed: ['ATS'] };
    const html = renderToString(<AiFeedbackPanel feedback={limited} isLoading={false} />);
    expect(html).toContain('Upgrade to unlock');
  });
});
