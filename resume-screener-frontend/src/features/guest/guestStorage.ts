import type { Feedback } from '@/types/feedback'

const HOUR_MS = 60 * 60 * 1000
const RETAIN_HOURS = 24
const SOFT_RETAIN_HOURS = 72

const GUEST_DRAFT_KEY = 'guest:lastDraft'
const GUEST_BANNER_DISMISSED_KEY = 'guest:bannerDismissed'

export type GuestDraftSnapshot = {
    resumeText?: string
    jobDescription?: string
    analysis?: Feedback | null
    savedAt: number
    retainUntil: number
    softRetainUntil: number
}

const getWindow = () => (typeof window === 'undefined' ? null : window)

export const storeGuestDraftSnapshot = (payload: {
    resumeText?: string
    jobDescription?: string
    analysis?: Feedback | null
}): GuestDraftSnapshot | null => {
    const win = getWindow()
    if (!win) {
        return null
    }

    const now = Date.now()
    const snapshot: GuestDraftSnapshot = {
        resumeText: payload.resumeText,
        jobDescription: payload.jobDescription,
        analysis: payload.analysis ?? null,
        savedAt: now,
        retainUntil: now + RETAIN_HOURS * HOUR_MS,
        softRetainUntil: now + SOFT_RETAIN_HOURS * HOUR_MS,
    }

    try {
        win.localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(snapshot))
        win.localStorage.removeItem(GUEST_BANNER_DISMISSED_KEY)
    } catch (error) {
        console.warn('[guestStorage] Failed to persist guest draft snapshot', error)
    }

    return snapshot
}

export const loadGuestDraftSnapshot = (): GuestDraftSnapshot | null => {
    const win = getWindow()
    if (!win) {
        return null
    }

    try {
        const raw = win.localStorage.getItem(GUEST_DRAFT_KEY)
        if (!raw) {
            return null
        }

        const parsed = JSON.parse(raw) as GuestDraftSnapshot
        if (!parsed?.softRetainUntil || parsed.softRetainUntil < Date.now()) {
            win.localStorage.removeItem(GUEST_DRAFT_KEY)
            return null
        }

        return parsed
    } catch (error) {
        console.warn('[guestStorage] Failed to read guest draft snapshot', error)
        return null
    }
}

export const clearGuestDraftSnapshot = () => {
    const win = getWindow()
    if (!win) {
        return
    }

    try {
        win.localStorage.removeItem(GUEST_DRAFT_KEY)
    } catch (error) {
        console.warn('[guestStorage] Failed to clear guest draft snapshot', error)
    }
}

export const markGuestBannerDismissed = (softRetainUntil: number) => {
    const win = getWindow()
    if (!win) {
        return
    }

    try {
        win.localStorage.setItem(
            GUEST_BANNER_DISMISSED_KEY,
            JSON.stringify({ dismissedUntil: softRetainUntil }),
        )
    } catch (error) {
        console.warn('[guestStorage] Failed to persist banner dismissal', error)
    }
}

export const isGuestBannerDismissed = (softRetainUntil: number): boolean => {
    const win = getWindow()
    if (!win) {
        return false
    }

    try {
        const raw = win.localStorage.getItem(GUEST_BANNER_DISMISSED_KEY)
        if (!raw) {
            return false
        }

        const { dismissedUntil } = JSON.parse(raw) as { dismissedUntil?: number }
        if (!dismissedUntil) {
            return false
        }

        if (dismissedUntil < Date.now()) {
            win.localStorage.removeItem(GUEST_BANNER_DISMISSED_KEY)
            return false
        }

        return dismissedUntil >= softRetainUntil
    } catch (error) {
        console.warn('[guestStorage] Failed to read banner dismissal state', error)
        return false
    }
}

export const resetGuestBannerDismissal = () => {
    const win = getWindow()
    if (!win) {
        return
    }

    try {
        win.localStorage.removeItem(GUEST_BANNER_DISMISSED_KEY)
    } catch (error) {
        console.warn('[guestStorage] Failed to reset banner dismissal', error)
    }
}

export const GUEST_RETENTION_LINK = 'https://docs.resume-screener.ai/retention'
