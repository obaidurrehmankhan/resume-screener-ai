# AI Resume Screener — Project Brief (MVP)

**One-liner:** Upload → Score → Rewrite with AI → Finalize to PDF/DOCX.  
Long tasks (analysis, rewrite, export) run as **background jobs** and return a **jobId** immediately.

**Audience:** You + GitHub Copilot (FE + BE)  
**Source of truth:**  
- Frontend: `resume-screener-frontend/frontend-instructions.md`  
- Backend: `resume-screener-backend/backend-instructions.md`

---

## 1) Who we serve (Plans)

- **Visitor (`/try`)**: ATS score only; **1 analysis/session**; guest draft retained **24h** (soft **72h**) via cookie.
- **Free (`/app/new`)**: ATS + limited rewrites (e.g., **2/day**); **no export** by default (optional watermarked export via flag).
- **Pro (`/app/new`, `/app/general`)**: Full features — match score, missing skills, suggestions, rewrites, **Finalize/Export**, General Resume Builder.
- **Admin (`/admin`)**: Charts, queues, plan switch, retry jobs, feature flags, “User mode”.

**UI gating rule:** Show all cards; **blur** those not entitled with a compact **Upgrade** CTA.

---

## 2) Core Flows (UX)

- **Visitor Try:** Upload → **Check Score** → **ATS only** result → Save/Export triggers Login/Upgrade.
- **Free Upload:** Upload/paste → **Check Score** → see ATS (others blurred) → **Rewrite** page.
- **Pro Upload:** All analysis panels visible (ATS, match %, missing skills, section suggestions).
- **Rewrite:** Model dropdown → **Regenerate** with cooldown → **latest rewrite only** in editor → manual **Save** → (Pro) **Finalize**.
- **General Resume Builder (Pro):** Wizard → Generate base resume → open in Rewrite → Finalize.
- **Dashboard:** Paginated table; search/sort; status chips: `DRAFT → IN_REVIEW → READY → FINALIZED`.
- **Admin:** Overview, job retry, plan switch, flags, user mode.

---

## 3) System Overview

**Frontend (React + RTK Query + Tailwind + shadcn/ui)**
- Results Widget orchestrates ATS/Match/Missing Skills/Suggestions; blur when not entitled.
- Rewrite page: Editor, ModelDropdown, Regenerate + **CooldownTimer**, **AI Changes** panel.
- **Manual Save only**; **last-chance cache** protects edits on refresh/token expiry.
- **Job tracking** by `jobId` (polling or SSE flag); resume on refresh.

**Backend (NestJS + PostgreSQL + TypeORM + Redis + BullMQ)**
- Cookies-based JWT (HttpOnly); refresh rotation; `guest_draft_id` cookie for visitors.
- **Pino** JSON logs with `requestId`, `userId`, `draftId`, `jobId`; **no PII**.
- Jobs: `analysis.run`, `rewrite.run`, `export.render` with retries/backoff and **idempotency keys**.
- S3 private buckets + **presigned GET** for downloads; SES for emails (e.g., 7-day reminder).

**AI**
- OpenAI (GPT) for feedback/rewrites.
- Cohere for classification/similarity (skills/match).

---

## 4) Contracts (high-level)

**Response shape:** `{ "data": {...}, "requestId": "uuid", "meta": {...} }`  
**Error shape:** `{ "error": { "code": "...", "message": "...", "details": {...} }, "requestId": "uuid" }`

---

## 5) Data (summary)

- **users**: plan, auth fields.
- **drafts**: owner/guest, `status`, `source`, `resume_text`, `jd_text`, links to latest analysis/rewrite/export.
- **analyses**: `ats_score`, `match_score?`, `missing_skills`, `panels_allowed`, metadata.
- **rewrites**: **unique per draft**, model/tokens, `content_json`, `change_notes`, cooldown + counters.
- **jobs**: type/status/timestamps/meta/error.
- **files/exports**: S3 metadata; presigned URL for downloads.

Indexes support dashboard lists and job lookups.

---

## 6) Non-Goals (MVP)

- Payments, multi-org tenants, batch uploads, full version history, advanced analytics.

---

## 7) Acceptance Criteria (must-haves)

- **Visitor**: 1 analysis/session; ATS only; 24h restore; non-ATS cards blurred.
- **Free**: Upload → ATS visible; Rewrite enabled with daily limit; **Finalize disabled** (tooltip).
- **Pro**: All analysis panels; Rewrite + **Finalize → Download**; Dashboard shows **FINALIZED**.
- **Rewrite**: Model dropdown, **Regenerate** with cooldown; **latest rewrite only**; **AI Changes** panel; **Manual Save**; last-chance cache restore.
- **Jobs**: All long tasks return `{ jobId }`, survive refresh/navigation; UI resumes tracking.
- **Security**: Cookies (HttpOnly) + refresh rotation; Helmet + CORS (credentials); no PII logs.
- **Performance**: P95 < 300ms for non-job endpoints; 2–4 concurrent jobs per queue.

---

## 8) Risks & Notes

- Resume parsing can be slow → keep analysis as a job and start with a stub if needed.
- Enforce quotas/throttling early with clear “limit resets at hh:mm” messages.
- Keep PRs small (≤200 LOC). Always add at least **one e2e happy-path** per new endpoint.

---
