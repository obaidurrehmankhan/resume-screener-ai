import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import { CheckScoreButton } from '../CheckScoreButton'

const analyzeMock = vi.fn()
const toastLoading = vi.fn(() => 'toast-id')
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('@/features/analysis/analysisApi', () => ({
    useAnalyzeDraftMutation: () => [
        analyzeMock,
        { isLoading: false },
    ],
}))

vi.mock('sonner', () => ({
    toast: {
        loading: (...args: unknown[]) => toastLoading(...args),
        success: (...args: unknown[]) => toastSuccess(...args),
        error: (...args: unknown[]) => toastError(...args),
    },
}))

describe('CheckScoreButton', () => {
    beforeEach(() => {
        analyzeMock.mockReset()
        toastLoading.mockClear()
        toastSuccess.mockClear()
        toastError.mockClear()
    })

    afterEach(() => {
        const portal = document.querySelector('[data-sonner]')
        if (portal?.parentNode) {
            portal.parentNode.removeChild(portal)
        }
    })

    it('disables when inputs are empty', () => {
        const container = document.createElement('div')
        const root = createRoot(container)

        act(() => {
            root.render(
                <CheckScoreButton draftId="draft-1" resumeText="" jobDescription="" />,
            )
        })

        const button = container.querySelector('button')
        expect(button?.hasAttribute('disabled')).toBe(true)

        act(() => {
            root.unmount()
        })
    })

    it('calls analyze mutation when clicked with data', async () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        analyzeMock.mockReturnValue({
            unwrap: () => Promise.resolve({ jobId: 'job-123' }),
        })

        await act(async () => {
            root.render(
                <CheckScoreButton
                    draftId="draft-1"
                    resumeText="resume text"
                    jobDescription="job text"
                />,
            )
        })

        const button = container.querySelector('button')
        expect(button?.hasAttribute('disabled')).toBe(false)

        await act(async () => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })

        expect(analyzeMock).toHaveBeenCalledWith({
            draftId: 'draft-1',
            resumeText: 'resume text',
            jobDescription: 'job text',
            idempotencyKey: expect.any(String),
        })
        expect(toastLoading).toHaveBeenCalled()
        expect(toastSuccess).toHaveBeenCalled()

        await act(async () => {
            root.unmount()
        })
    })
})
