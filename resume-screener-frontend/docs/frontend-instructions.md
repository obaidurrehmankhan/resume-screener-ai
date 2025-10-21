# frontend-instructions.md — AI Resume Screener 

> **Audience:** Front-end devs + GitHub Copilot (React, RTK, RTK Query, Tailwind, shadcn/ui)
> **Scope:** UX flow, screens, components, state, background job tracking, quotas/entitlements, resilience, acceptance criteria
> **Rule for Copilot:** **Follow this spec exactly.** Don’t invent features. Keep code lean and accessible.

---

## 0- One-liner (what we’re building)

**Upload → Score → Rewrite with AI → Finalize to PDF/DOCX.**
Plans gate features: **Visitor** (ATS only), **Free** (ATS + limited rewrites, no export), **Pro** (full features + General Resume Builder).

Long tasks (**analysis**, **rewrite**, **export**) run as **background jobs** with **job IDs** so the UI stays responsive and results arrive even if the user navigates away.

---

## 1- Personas & Plan Rules (Entitlements + Quotas)

* **Visitor (`/try`)**

  * Entitlements: `ATS_VIEW`
  * Quota: **1 analysis/session**
  * Retention: guest draft kept **24h** (soft-retain **72h**) via `guest_draft_id` cookie
  * Save/Export triggers **Login/Upgrade**

* **Free (`/app/new`)**

  * Entitlements: `ATS_VIEW`, `REWRITE_LIMITED` (e.g., **2/day**)
  * **Blocked:** `EXPORT`, `GENERAL_RESUME` (optional **Watermarked Export** via feature flag)
  * Quotas: uploads/day, rewrites/day, max drafts

* **Pro (`/app/new`, `/app/general`)**

  * Entitlements: `ATS_VIEW`, `MATCH_VIEW`, `SUGGESTIONS_VIEW`, `REWRITE`, `SAVE_DRAFT`, `EXPORT`, `GENERAL_RESUME`
  * Quotas: higher ceilings; reasonable upper bounds

* **Admin (`/admin`)**

  * Admin can use **User mode**, view charts/logs/queues, **switch plan**, **re-run failed jobs**, **toggle feature flags**
  * Can view/filter the same data tables users see

> **Gating rule in UI:** If a card/feature isn’t entitled for the current plan, **show the card but blur it** and overlay a compact **Upgrade** CTA.

---

## 2- High-Level UX Flow (Front-end)

### A- Visitor — Try the App (`/try`)

1. Upload resume (file or paste). JD optional (paste).
2. Click **Check Score** → show **ATS score only** on the right.
3. **Save/Export** → prompt **Login/Upgrade**.
4. Limit: **1 analysis/session**. Guest draft retained **24h** (soft **72h**).

**UI notes:**

* Right panel uses **Results Widget** (same layout for all plans); **non-entitled** cards blurred with Upgrade CTA.
* **Check Score** disabled until both Resume & JD have content.

---

### B- Free — Limited Workflow (`/app/new` → `/app/rewrite/:id`)

**Upload (`/app/new`)**

* User uploads/pastes resume; JD is paste-only.
* Click **Check Score** → show **ATS** and any other panels **only if entitled** (default: ATS visible; others blurred).
* **Rewrite** button routes to Rewrite page.

**Rewrite (`/app/rewrite/:id`)**

* **Header:** Draft title (inline rename; if untitled → **Name Draft** modal with smart default), plan badge, **Model Dropdown** (ChatGPT variants; future: Claude/Gemini), **Regenerate** with **cooldown** timer.
* **Editor:** AI content shown; **latest rewrite only** (no historical versions).
* **AI Changes Panel:** under editor, **“What AI changed”** (collapsible), lists concrete improvements (keywords added, quantified bullets, etc.).
* **Save:** **Manual Save only** (no continuous autosave).
* **Finalize (Free):** Disabled with tooltip **“Pro feature”**. *(Optional flag: show **Watermarked Export** button.)*
* **Quick Switcher:** a **searchable dropdown** to open any existing **draft/finalized resume** directly in the Rewrite screen (load into editor).

**Quotas:** Respect daily **uploads/rewrites/drafts** with clear **“limit reached”** message and reset time.

**Resilience:** **Local last-chance cache** for editor content; when returning after crash/expiry/refresh, prompt **Restore** or **Discard**.

---

### C- Pro — Full Finalize & Download (`/app/new` → `/app/rewrite/:id`)

* **Upload** page: all analysis panels **unblurred** (ATS, match score, missing skills, section suggestions).
* **Rewrite** page: same as Free **plus** enabled **Finalize**:

  * Click **Finalize** → show “Preparing your file…” state → **Download** link (PDF/DOCX).
  * Dashboard row shows status **FINALIZED** with a **Download** button.

---

### D) General Resume Builder (Pro) — (`/app/general`)

1. Wizard: pick **Role**, **YOE**, **Skills**, **Achievements** (+ optional target).
2. Click **Generate** → open **Rewrite** with a tailored starter resume (Summary/Skills/Experience).
3. Edit → **Mark READY** → **Finalize** → download from S3.

---

### E- Dashboard — (`/app/dashboard`)

* **Paginated** table; **search**, **sort**; **status chips**: `DRAFT`, `IN_REVIEW`, `READY`, `FINALIZED` (optional “Reminder sent”).
* Actions: **Open**, **Soft Delete**. Optional tabs: **Drafts / Finalized**.

---

### F- Admin — (`/admin`)

* Overview: signups, drafts, analyses, queue health, audit logs.
* Controls: **switch plan**, **re-run failed jobs**, **toggle flags**, **User mode**.
* Tables: can **view/filter** the same records seen in the user dashboard.

---

## 3- Background Jobs (what the UI must remember)

* `analysis.run` → parse resume, compute **ATS**, (if entitled) **match score**, **missing skills**, **section suggestions**
* `rewrite.run` → generate/refresh editor content (**overwrites** previous), track `lastRegenAt`, `regenCount`, `cooldownUntil`
* `export.render` → generate **PDF/DOCX**, upload to S3, return **pre-signed URL**

**Job tracking pattern (never lose an AI run):**

* On submission, get `{ jobId }`.
* Store `jobId` in **Redux + localStorage** and **poll**/**subscribe** (SSE/WebSocket).
* If user refreshes/navigates away, **resume** tracking on mount.
* On completion, show **toast** “Result ready” with a **View** button (deep-link back).
* No cancel once **running**; show non-blocking **“Working…”** toast and let user browse.

**Token expiry / network loss**

* Keep **last-chance cache** of editor content locally; after login/return, offer **Restore**.
* Jobs continue server-side; tokens aren’t “wasted”.

**Nudges**

* Daily scheduler (backend) finds drafts stuck **7+ days** in `DRAFT/IN_REVIEW`, sends reminder email.
* UI may show an optional **“Reminder sent”** chip.

---

## 4- Universal UI Rules

* **Blur gating**: Non-entitled cards show but are blurred with **Upgrade** CTA.
* **Disable states**:

  * **Check Score** disabled until both Resume & JD present
  * **Regenerate** disabled during cooldown (show **mm:ss**)
  * **Finalize** disabled for Free (tooltip)
* **Unsaved switch guard**: moving away from Rewrite with unsaved changes shows modal **Save & switch** / **Discard & switch**.
* **Status lifecycle**: `DRAFT → IN_REVIEW → READY → FINALIZED`

---

## 5- Components & Files (just as a reference, don't necessarily need to implement or follow this structure)

```
src/
  components/
    ResultsWidget/
      ResultsWidget.tsx          // orchestrates cards with blur gating
      ResultCard.tsx             // simple card
      UpgradeOverlay.tsx         // blurred overlay + Upgrade CTA
    Editor/
      ResumeEditor.tsx           // rich editor (latest rewrite only)
      ModelDropdown.tsx          // ChatGPT models (extensible)
      AiChangesPanel.tsx         // "What AI changed" collapsible list
      CooldownTimer.tsx          // mm:ss countdown, disables regenerate
      RewriteHeader.tsx          // title rename, plan badge, model, actions
    Upload/
      ResumeInput.tsx
      JdInput.tsx
      CheckScoreButton.tsx
    Dashboard/
      DraftsTable.tsx            // pagination, sort, search, status chips
      StatusChip.tsx
      TableToolbar.tsx
      QuickSwitcher.tsx          // searchable dropdown to open any draft/finalized
    Common/
      PageHeader.tsx
      ConfirmDialog.tsx          // Save&Switch/Discard&Switch
      NameDraftModal.tsx
      ToastHost.tsx
      SkeletonCard.tsx
  screens/
    TryPage.tsx
    UploadPage.tsx
    RewritePage.tsx
    GeneralBuilderPage.tsx
    DashboardPage.tsx
    AdminPage.tsx
  features/
    session/                     // plan, entitlements, quotas, flags
    entities/                    // drafts, jobs (normalized) *optional advanced*
    drafts/                      // actions/selectors for current draft
    jobs/                        // job tracking (poll/SSE)
    ui/                          // toasts, modals, cache presence
    tables/                      // dashboard/admin table state
```

> **Note:** If you don’t want normalized entities yet, keep the **minimal** store below; otherwise prefer normalized slices for scale.

---

## 6- Front-end State Shape (Minimal, API-agnostic)

```ts
// Minimal (as provided)
auth:        { user, plan, quotas, entitlements }
draft:       { id, title, status, updatedAt, content }                // content = latest rewrite
analysisJob: { id, status, results, error }
rewriteJob:  { id, status, model, cooldownUntil, error }
ui:          { toasts[], modals:{ nameDraft, confirmSwitch }, pendingJobIds[], lastChanceCachePresent }
table:       { pagination, sort, filter }
```

### Optional (recommended for scale — normalized)

If you want to scale cleanly, use the normalized shape we discussed:

* `entities.drafts.byId/ids` with `resumeText`, `jdText`, `latestRewriteText`, `dirty`, `cooldownUntil`
* `entities.jobs.byId/ids`, plus `jobsIndex.byDraft` map
* `ui.lastChanceCache[draftId] = true` per draft
* `views.dashboard.table`, `views.admin.table` etc.

---

## 7- RTK Query & Hooks (patterns)

* Use RTK Query for **server calls**; keep Redux for: session/plan/quotas, **job IDs**, modals/toasts, and editor state.

* Write `useJobTracking(jobId)`:

  * Poll `/jobs/{id}` every 3–5s (or SSE/WebSocket when feature flag on)
  * Dispatch status updates
  * On completion: toast “Result ready” with **View** button
  * Persist `jobId` in `localStorage` to resume after refresh

* Write `useLastChanceCache(draftId, getContent, setContent)`:

  * Save on `beforeunload`
  * On mount, if cache exists → show non-blocking banner with **Restore/Discard**

---

## 8- Acceptance Criteria (Ship-ready)

**Visitor `/try`**

* [ ] 1 analysis/session enforced; **ATS only** visible; Save/Export triggers login
* [ ] Non-ATS cards blurred with Upgrade
* [ ] Guest draft restores within **24h** (cookie), soft-retain **72h**

**Upload `/app/new`**

* [ ] **Check Score** disabled until Resume + JD present
* [ ] Free: **Rewrite** visible; respect entitlements (blur/enable)
* [ ] Pro: all panels enabled

**Rewrite `/app/rewrite/:id`**

* [ ] Title rename; **Name Draft** on first save/rewrite if untitled
* [ ] Model dropdown; **Regenerate** shows **cooldown** and disables appropriately
* [ ] **Latest rewrite only** in editor
* [ ] **What AI changed** renders structured items (bullets/sections)
* [ ] **Manual Save only**; **last-chance cache** restore works
* [ ] Free: **Finalize disabled** + tooltip; *(flag)* Watermarked export
* [ ] Pro: **Finalize → Download**; status becomes **FINALIZED** in Dashboard
* [ ] **Quick Switcher** can open any draft/finalized into the editor

**General `/app/general`**

* [ ] Wizard collects Role/YOE/Skills/Achievements; **Generate** → open in Rewrite with initial content
* [ ] **READY → FINALIZE** path works

**Dashboard `/app/dashboard`**

* [ ] Paginated, sortable, searchable table with **status chips** and **Soft Delete**
* [ ] Optional tabs **Drafts / Finalized**; optional “Reminder sent” chip

**Admin `/admin`**

* [ ] Overview, queue health, logs; **plan switch**, **re-run failed**, **flags**, **User mode**
* [ ] Filterable tables mirroring user dashboard views
* [ ] All risky actions require confirmation

**Resilience**

* [ ] Job tracking persists across navigation/refresh; UI **auto-updates** on completion
* [ ] Token expiry mid-edit → **restore** works
* [ ] Quotas & throttling messages are clear with reset time

---

## 9- Copilot Task Prompts (paste into Copilot Chat)

**Results Widget (blur gating)**

```
@workspace Build src/components/ResultsWidget/ResultsWidget.tsx per frontend-instructions.md.
Render ATS, Match, Missing Skills, Section Suggestions cards.
Blur non-entitled cards and overlay Upgrade CTA.
Add loading + error + Retry states.
```

**Rewrite Header**

```
@workspace Implement src/components/Editor/RewriteHeader.tsx with:
- inline title (opens NameDraftModal if empty)
- plan badge
- ModelDropdown
- Regenerate button with CooldownTimer (disables during cooldown)
- emit onSave/onMarkReady/onRegenerate events
```

**AI Changes Panel**

```
@workspace Create src/components/Editor/AiChangesPanel.tsx.
Props: sections with lists of improvements.
Collapsible per section; remember open state in URL hash.
```

**Last-chance Cache Hook**

```
@workspace Implement src/features/ui/useLastChanceCache.ts with:
useLastChanceCache(draftId, getContent, setContent).
Save on beforeunload, show restore banner on mount, clear on successful save.
```

**Job Tracking Hook**

```
@workspace Implement src/features/jobs/useJobTracking.ts:
poll /jobs/{id} every 3s (flag: SSE/WebSocket),
persist jobId in localStorage,
dispatch updates,
toast "Result ready" with View action to open the draft.
```

**Dashboard Table**

```
@workspace Build src/components/Dashboard/DraftsTable.tsx with pagination, sort, search, status chips, tabs Drafts/Finalized.
Use shadcn Table primitives; Soft Delete action with confirm dialog.
```

**Rewrite Quick Switcher**

```
@workspace Create src/components/Dashboard/QuickSwitcher.tsx:
command palette or dropdown to search drafts/finalized by title/date/status and open into RewritePage.
```

---

## 10- Performance & DX

* Route-level **code-splitting** for heavy screens (Admin, General, Rewrite)
* Keep deps **lean** (Tailwind, shadcn/ui, lucide-react); avoid heavy libraries
* **A11y**: focus states, ARIA labels, keyboard shortcuts (**Ctrl/⌘+S** to Save)
* **Skeletons** for loading; gentle motion only (Framer Motion fade/expand)

---

## 11- Security (front-end posture)

* Auth: short-lived JWTs; **httpOnly** refresh token; **no sensitive data in localStorage**
* Enforce draft ownership in UI (don’t show actions if not owner)
* Validate file types & sizes before upload; sanitize pasted text (basic)

---

## 12- Implementation Order (Sprints)

**Sprint 1 – Core UX + Analysis**

1. App shell, routing, session/plan state, toasts/modals
2. `/try` & `/app/new` → `analysis.run` → Results Widget (blur gating)
3. Guest draft retention visuals

**Sprint 2 – Rewrite & Resilience**

1. `/app/rewrite/:id`: editor, Model dropdown, Regenerate + cooldown, **AI Changes**
2. Manual Save + **Name Draft** + **last-chance cache**
3. Job tracking (poll or SSE) + “Result ready” toasts

**Sprint 3 – Finalize & General Builder**

1. Pro **Finalize** → Download flow
2. `/app/general` wizard → Generate → Rewrite
3. Dashboard table (pagination/sort/search/chips + Quick Switcher)

**Sprint 4 – Admin & Nudges**

1. `/admin`: overview, plan switch, re-run failed, flags, User mode
2. “Reminder sent” chip support
3. Hardening: quotas/throttling messages, logs, tests

---

