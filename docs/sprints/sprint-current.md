# Sprint 1 — Core UX + Analysis (Oct 20–26)

**Outcome:** Visitor `/try` and logged-in `/app/new` can run **analysis.run** and see results in the **Results Widget** with proper blur gating.
**Auth:** switch front-end session to **cookies** (no localStorage tokens).
**Observability & Docs:** **Pino** logs baseline + **OpenAPI (Swagger)** enabled.
**Data:** initial migrations for `Draft`, `Job`, `Analysis`.
**Reliability:** jobs return `{ jobId }`, job polling works, guest retention visuals.

---

## 0) What’s already done (context)

* App shell + routing ✅
* Redux in place; currently persists tokens in localStorage (to be removed/changed) ⚠️
* Some toasts/modals ✅
* AuthN/AuthZ flows work but need cookie-based refactor ⚠️

---

## 1) End-to-end flow (this sprint)

1. **Auth (cookies)**: user logs in → backend sets `access_token` (≈15m) + `refresh_token` (7–14d) **HttpOnly** cookies. Guest flow sets `guest_draft_id` (24h; soft 72h).
2. **Create Draft**: `POST /drafts` (visitor or logged-in).
3. **Kick Analysis**: `POST /drafts/:id/analysis` → returns `{ jobId }`; queue `analysis.run`.
4. **Track Job**: FE stores `jobId` (Redux + localStorage **only for the job id**) and **polls** `GET /jobs/:jobId` (or SSE if flag on).
5. **Show Results**: when job completes, FE renders ATS (Visitor/Free), Match %, Missing Skills, Section Suggestions (Pro) via **Results Widget**. Non-entitled cards are **blurred** with **Upgrade CTA**.
6. **Guest Retention**: if visitor returns within 24h, load guest draft and last results using `guest_draft_id` cookie.
7. **Docs & Logs**: Swagger `/docs` live, Pino logs (JSON) with `requestId`/`userId`/`draftId`/`jobId`, no PII.

---

## 2) Prompt Cards — Sprint 1 (FE + BE merged; **follow this order**)

> **How to use with Copilot/Codex/Claude Sonnet 4.5**
> Keep these files open: `project-brief.md`, `coding-standards.md`, `frontend-instructions.md`, `docs/README_BACKEND_INSTRUCTIONS.md`, and this file.
> For each card: **read context → propose ≤5 steps → show DIFFS before saving → add one happy-path test**.
> Keep PRs ≤200 LOC. Use **HttpOnly cookies**, **JSON envelope**, **Pino** (no PII), and return `{ jobId }` for long jobs.

---

### P-101 — Pino baseline (BE) - Done

**Goal:** Add Pino request logging & error envelope with `requestId` (no PII).

**Steps:**

* Create Pino logger module + HTTP middleware.
* Log `{ method, path, status, ms, requestId, userId? }`.
* Global error filter → JSON `{ error:{code,message,details}, requestId }`.
* Ensure `x-request-id` is generated/propagated.

**DoD:** Requests and errors produce structured JSON logs; **unit test** for error filter.

---

### P-102 — Helmet, CORS (credentials), cookies (BE)

**Goal:** Secure bootstrap: Helmet, CORS allowlist + credentials, cookie parser, trust proxy.

**Steps:**

* Enable Helmet and CORS with `origin=[APP_ORIGIN]`, `credentials:true`.
* Add cookie parser; `app.set('trust proxy', 1)`.
* Add `ValidationPipe({ whitelist:true, transform:true })`.

**DoD:** Browser can send/receive cookies from FE; **preflight passes**.

---

### P-103 — OpenAPI (Swagger) (BE)

**Goal:** Enable `/docs` (dev-only), tag controllers, expose `/docs-json`.

**Steps:**

* Add Swagger config with title/version; **only non-production**.
* Tag **Auth**, **Drafts**, **Jobs**, **Analyses**.
* Link in README how to open.

**DoD:** `/docs` renders endpoints; **CI still green**.

---

### P-104 — Cookie JWT flows (BE)

**Goal:** **HttpOnly** cookie auth with refresh rotation.

**Steps:**

* `/auth/login` sets `access_token` (~15m, SameSite=Lax) + `refresh_token` (7–14d, path `/auth/refresh`).
* `/auth/refresh` rotates refresh, issues new access.
* `/auth/logout` clears cookies.
* `JwtStrategy` reads from **cookies**; `/auth/me` returns `{ user, plan, entitlements? }`.
* Create **new guards/decorators** wherever required.

**DoD:** Manual test: **login → refresh → logout**; cookies behave; **e2e happy-path** for refresh.

---

### P-107 — Initial entities & migrations (BE)

**Goal:** Create **Draft**, **Job**, **Analysis** with indexes.

**Steps:**

* TypeORM entities **exactly** as in backend instructions.
* Add migration (status enums, links).
* Indexes:

  * `jobs(status,type,created_at)`
  * `drafts(user_id,updated_at desc)`
  * `analyses(draft_id,created_at desc)`

**DoD:** Migrations run; **schema matches doc**.

---

### P-116 — Entitlements baseline (BE + FE)

**Goal:** Plans → entitlements mapping, guard, and exposure to FE; `panels_allowed` in analysis response.

**Steps:**

* Add `Plan`, `Entitlement`, `PLAN_ENTITLEMENTS` map; `EntitlementGuard` + `@RequiresEntitlements`.
* `/auth/me` returns `entitlements: string[]`.
* In analysis serializer, compute `panels_allowed` from entitlements (`ATS`, `MATCH`, `SUGGESTIONS`).
* **(FE)** Wire entitlements into session slice; Results Widget reads `panels_allowed`.
* Use **guards/decorators** where required on BE; mirror gating on FE.

**DoD:** Visitor can analyze but only sees **ATS** (others blurred); **finalize route blocked for non-PRO** (guard unit test).

---

### P-108 — BullMQ queues & analysis worker skeleton (BE)

**Goal:** `analysis.run` queue & worker that saves Analysis and moves Draft `IN_REVIEW → READY`.

**Steps:**

* Queue + processor with **retries/backoff**.
* Processor saves **stub Analysis** with ATS and placeholder fields.
* Update Draft links (`latest_analysis_id`) and status.

**DoD:** Enqueue job → **completes → DB updated**; worker logs with `jobId`.

---

### P-109 — Analysis + Jobs endpoints (BE)

**Goal:** Kick analysis and poll job result.

**Steps:**

* `POST /drafts/:id/analysis` returns `{ jobId }` (support **Idempotency-Key**).
* `GET /jobs/:jobId` returns `{ job, result? }` with JSON envelope.
* Basic ownership/visitor access (**analysis allowed for Visitor**).

**DoD:** **e2e happy-path:** create draft → analyze → poll → result.

---

### P-105 — Session refactor to cookies (FE)

**Goal:** Remove token `localStorage` usage; use cookies with RTK Query.

**Steps:**

* Set `fetchBaseQuery({ credentials:'include' })`.
* Delete all token reads/writes from localStorage; rely on `/auth/me` to hydrate session.
* Keep **only jobIds** in localStorage (for job tracking), **not tokens**.

**DoD:** Refresh keeps session (via cookies) without any token in localStorage.

---

### P-106 — 401 auto-refresh (FE)

**Goal:** Retry once on 401 via `/auth/refresh`.

**Steps:**

* Wrap baseQuery: on 401 → call `/auth/refresh` → retry original; on fail → logout/redirect.
* Add small test for wrapper logic.

**DoD:** Manual test shows **seamless refresh**.

---

### P-110 — Results Widget with blur gating (FE)

**Goal:** Render ATS/Match/Missing/Suggestions; **blur** non-entitled.

**Steps:**

* `ResultsWidget` + `ResultCard` + `UpgradeOverlay`.
* Loading, error, retry states.
* Accept `panels_allowed` from backend.

**DoD:** `/try` shows **ATS only**; others blurred with **Upgrade CTA**.

---

### P-111 — Analyze action (FE)

**Goal:** Button to run analysis and start job tracking.

**Steps:**

* Mutations to `POST /drafts/:id/analysis`.
* Toast “Working…” then “Result ready” with **View** (opens draft).
* Disable **Check Score** until resume+JD present.

**DoD:** End-to-end from button → result appears in widget.

---

### P-112 — Job tracking hook (FE)

**Goal:** `useJobTracking(jobId)` polls every 3s; persists `jobId`; resumes after refresh.

**Steps:**

* Hook to poll `/jobs/:id` (**SSE/WebSocket** behind feature flag).
* Persist `jobId` in localStorage and restore on mount.
* Dispatch state updates; show completion toast.

**DoD:** Refresh mid-job → still get result; **test with MSW**.

---

### P-113 — Guest draft retention visuals (FE)

**Goal:** Show “Restored guest draft” banner when `guest_draft_id` cookie present; explain 24h/72h.

**Steps:**

* Detect cookie presence (via `/auth/me` or a tiny endpoint).
* Non-blocking banner with link to last draft.
* Dismiss → persisted until cookie expires.

**DoD:** Works in `/try`; **UX matches spec**.

---

### P-114 — OWASP quick pass (BE)

**Goal:** Baseline protections aligned with backend instructions.

**Steps:**

* Ownership checks for draft read/write (user **OR** guest cookie).
* Throttler (60 req/min) and basic mime/size validation stub.
* Egress allowlist skeleton for AI/S3/SES.

**DoD:** **403** on forbidden finalize; **429** on flood; tests cover one protected route.

---

### P-115 — Happy-path tests (FE + BE)

**Goal:** Ensure the golden path is reliable.

**Steps:**

* **BE e2e:** create draft → analyze → poll → result & status transition.
* **FE test:** click Analyze → loading → result render in Results Widget (MSW jobs).

**DoD:** **CI green**; coverage note added to README.

---

## 3) Simple checklist

* [ ] P-101 Pino baseline
* [ ] P-102 Helmet + CORS + cookies
* [ ] P-103 OpenAPI
* [ ] P-104 Cookie JWT flows
* [ ] P-107 Entities + migrations
* [ ] P-116 Entitlements baseline
* [ ] P-108 analysis.run worker
* [ ] P-109 analysis/jobs endpoints
* [ ] P-105 Session refactor (FE)
* [ ] P-106 401 auto-refresh (FE)
* [ ] P-110 Results Widget
* [ ] P-111 Analyze action
* [ ] P-112 Job tracking hook
* [ ] P-113 Guest retention visuals
* [ ] P-114 OWASP quick pass
* [ ] P-115 Happy-path tests

---

## 4) Migrations (exact order)

1. `Draft` (status enum `DRAFT|IN_REVIEW|READY|FINALIZED`, source, resume_text, jd_text, latest_* links)
2. `Job` (type, status, meta, error, started_at/finished_at) + index `(status,type,created_at)`
3. `Analysis` (draft_id, ats_score, match_score?, missing_skills[], panels_allowed, parsing_meta, job_id) + index `(draft_id, created_at desc)`

---

## 5) Testing plan

* **e2e (BE):** create draft → POST analysis → poll job → verify analysis saved + status transition.
* **unit (BE):** services for analysis orchestration (stub AI).
* **FE:** test Analyze button → loading → result render in Results Widget (mock jobs with MSW).

---

## 6) Finish criteria

* **Visitor `/try`**: 1 analysis/session, **ATS only** visible, guest draft restores within **24h** (soft **72h**).
* **Logged-in `/app/new`**: analysis with **Results Widget** honoring `panels_allowed`.
* **Auth**: cookies-based session; **no tokens in localStorage**.
* **Ops**: Pino logs and Swagger live; initial schema migrated; **job tracking resilient**.

---

### Copy-ready per-card command (use with any agent)

Replace `P-XXX`:

```text
Execute P-XXX from docs/sprints/prompts.md.
- Read: project-brief.md, coding-standards.md, frontend-instructions.md, backend-instructions.md.
- Propose ≤5 steps, then show diffs before saving.
- Keep PR ≤200 LOC, add one happy-path test.
- Follow: cookies (HttpOnly), JSON envelope, Pino logs (no PII), BullMQ jobs return { jobId }.
```
