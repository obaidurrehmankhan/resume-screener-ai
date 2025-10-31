import { describe, expect, it, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import { GuestRestoreBanner } from '../GuestRestoreBanner'

describe('GuestRestoreBanner', () => {
    const baseProps = {
        savedAt: Date.now() - 1000,
        retainUntil: Date.now() + 24 * 60 * 60 * 1000,
        softRetainUntil: Date.now() + 72 * 60 * 60 * 1000,
        onRestore: vi.fn(),
        onDismiss: vi.fn(),
    }

    it('renders retention message and buttons', () => {
        const container = document.createElement('div')
        const root = createRoot(container)
        act(() => {
            root.render(<GuestRestoreBanner {...baseProps} />)
        })

        expect(container.textContent).toContain('Pick up where you left off')
        expect(container.querySelector('button')?.textContent).toContain('Restore')

        act(() => {
            root.unmount()
        })
    })

    it('calls callbacks when actions are clicked', () => {
        const onRestore = vi.fn()
        const onDismiss = vi.fn()

        const container = document.createElement('div')
        const root = createRoot(container)
        act(() => {
            root.render(<GuestRestoreBanner {...baseProps} onRestore={onRestore} onDismiss={onDismiss} />)
        })

        const [restoreButton, dismissButton] = container.querySelectorAll('button')

        act(() => {
            restoreButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })
        expect(onRestore).toHaveBeenCalledTimes(1)

        act(() => {
            dismissButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })
        expect(onDismiss).toHaveBeenCalledTimes(1)

        act(() => {
            root.unmount()
        })
    })
})
