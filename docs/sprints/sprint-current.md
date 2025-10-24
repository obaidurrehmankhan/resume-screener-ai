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
* Make sure to add openAPI tags or attributes for documentation
* Help me in testing these things on frontend (if required) and steps to test on backend with Postman

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

### P-116 — Entitlements baseline (BE)

*## P-116 — Entitlements Baseline (Backend)

**Goal:** Build the backend permission layer so routes and serializers know what each plan (Visitor/Free/Pro/Admin) can do. Expose entitlements to clients and enforce them on protected endpoints.

**Deliverables (backend):**

* `src/common/types/entitlements.ts` — `Plan`, `Entitlement`, `PLAN_ENTITLEMENTS` map
* `src/common/security/entitlement.decorator.ts` + `src/common/security/entitlement.guard.ts` — route-level entitlement checks
* `src/common/security/entitlements.service.ts` — resolve plan (user or Visitor via `guest_draft_id`) → `Set<Entitlement>`
* `GET /auth/me` — include `entitlements: string[]`
* **Analysis serializer** — compute `panels_allowed` from entitlements (`ATS`, `MATCH`, `SUGGESTIONS`) and include in response
* Protect at least one route with the guard, e.g. `POST /drafts/:id/finalize` requires `EXPORT`

**Steps (≤5):**

* Add `Plan`, `Entitlement`, `PLAN_ENTITLEMENTS` map and the `EntitlementsService`.
* Create `@RequiresEntitlements(...ents)` decorator and `EntitlementGuard` that resolves plan and verifies required entitlements.
* Update `/auth/me` to return `entitlements: string[]` per current plan (or Visitor via cookie).
* In analysis response builder/serializer, populate `panels_allowed` from entitlements.
* Apply the guard to `POST /drafts/:id/finalize` (requires `EXPORT`) and any other restricted endpoints.

**OpenAPI (Swagger):**

* Add/confirm `@ApiTags('Auth')` (and relevant module tags) on controllers.
* Document that `/auth/me` returns `entitlements[]`.
* Document **403** on finalize when entitlement is missing.

**Logging:**

* On **403** from `EntitlementGuard`, log **warn** with `requestId`, `userId?`, `requiredEntitlements` (no PII).

**Tests (backend):**

* **Unit:** Guard denies Visitor on finalize (requires `EXPORT`).
* **e2e:** Visitor can `POST /drafts/:id/analysis` (ATS only); Visitor gets **403** on `POST /drafts/:id/finalize`.

**Postman quick verify:**

* **Visitor** (no login, ensure `guest_draft_id` cookie):

  * `GET /auth/me` → `plan=VISITOR`, `entitlements: ["ATS_VIEW"]`
  * `POST /drafts/:id/analysis` → **200**
  * `POST /drafts/:id/finalize` → **403**
* **Pro user:**

  * `GET /auth/me` → includes `EXPORT`
  * `POST /drafts/:id/finalize` → **202/200** (per contract)

**DoD (backend):**

* `/auth/me` includes `entitlements[]`.
* `panels_allowed` present in analysis responses and matches plan.
* `finalize` route correctly **403** without `EXPORT`.
* Unit + e2e pass.
---

## P-105 — Session Refactor to Cookies (Frontend)

**Goal**
Stop using localStorage for tokens; use **HttpOnly cookies** with RTK Query.

**Deliverables (frontend)**

* RTK Query `baseQuery` configured with `credentials: 'include'`
* Token reads/writes to localStorage removed
* Session hydration via `/auth/me` on app start
* localStorage used **only** for jobIds (tracking), not tokens

**Steps (≤5)**

1. Set `fetchBaseQuery({ baseUrl, credentials: 'include' })`.
2. Remove all token storage/access code from Redux/localStorage.
3. Add an app-init thunk or hook to call `/auth/me` and populate `user, plan, entitlements`.
4. Keep `jobIds` in localStorage for tracking; nothing else auth-related.
5. Update guards/PrivateRoutes to rely on session slice, not tokens.

**Testing**

* Unit: selectors return correct session when `/auth/me` succeeds/fails.
* Manual: login → hard refresh → still authenticated (cookies).

**DoD**

* Refresh persists session without any token in localStorage.

---

## P-106 — 401 Auto-Refresh (Frontend)

**Goal**
When an API call returns 401, automatically call `/auth/refresh` once, then retry the original request.

**Deliverables (frontend)**

* A wrapped `baseQuery` (or `baseQueryWithReauth`) that handles 401 → refresh → retry
* Small test for the wrapper logic

**Steps (≤5)**

1. Implement `baseQueryWithReauth`: try request; on 401, call `/auth/refresh`; if success, retry once.
2. Prevent loops: only one retry per request. If still 401, dispatch logout and redirect to login.
3. Plug `baseQueryWithReauth` into RTK Query API.
4. Add console-safe debug logs in dev builds.
5. Write a unit test that mocks 401 → refresh → success.

**Testing**

* Manual: delete `access_token` cookie, call a protected endpoint, confirm auto-refresh & retry.
* Unit test passes.

**DoD**

* Seamless refresh in the browser; no infinite loops; correct logout on double-401.
---
## P-117 — Entitlements UI Wiring (Frontend)

**Goal:** Use backend **entitlements** (`/auth/me`) and `panels_allowed` (from analysis response) to control visibility/blur and actions in the UI.

**Deliverables (frontend):**

* Session slice stores `entitlements: string[]` fetched via `/auth/me` (RTK Query).
* `ResultsWidget` renders ATS/Match/Suggestions and **blurs** non-entitled cards with an **Upgrade** CTA, driven by `panels_allowed`.
* **Finalize** action is **disabled/hidden** unless entitlement includes `EXPORT` (show tooltip: “Pro feature” when disabled).
* *(Optional)* Lightweight route guard/HOC to block navigation to Pro-only flows without entitlement.
* Selector helper: `selectHasEntitlement(state, 'EXPORT')` for reuse.

**Steps (≤5):**

* Extend session slice/types to persist `entitlements[]` from `/auth/me` (RTK Query `baseQuery` already uses `credentials:'include'` from P-105).
* Update `ResultsWidget` to respect `panels_allowed` (`ATS`, `MATCH`, `SUGGESTIONS`): render all cards but **blur** those not allowed; overlay `UpgradeOverlay`.
* Gate Finalize UI: `!selectHasEntitlement('EXPORT')` → disable/hide button and show tooltip/Upgrade CTA; allow when `EXPORT` present.
* Implement `selectHasEntitlement(state, key)` and use it in components (Finalize button, menus, etc.).
* *(Optional)* Add a simple guard/HOC to prevent routing into Pro-only pages without required entitlements.

**Tests (frontend):**

* `/try`: ATS visible; Match/Suggestions **blurred** with Upgrade CTA (Visitor).
* Pro user: all cards visible; Finalize **enabled**.
* Free user: Finalize **disabled** with tooltip; ATS visible; other panels blurred per `panels_allowed`.

**DoD (frontend):**

* Visitor sees **ATS only** on `/try`; other cards are **blurred** with Upgrade CTA.
* Free **cannot Finalize**; Pro **can**.
* All new tests green.

---
## P-108 — BullMQ Queues & Analysis Worker Skeleton (Backend)

**Goal**
Create the `analysis.run` queue and worker that processes analysis jobs, persists an `Analysis` record, and moves the `Draft` status from `IN_REVIEW` → `READY`.

**Deliverables (backend)**

* `src/modules/jobs/queues/analysis.queue.ts` — BullMQ queue factory (`analysis.run`)
* `src/modules/jobs/processors/analysis.processor.ts` — worker/processor with retries/backoff
* `src/modules/analyses/analyses.service.ts` — `runAnalysisJob(draftId, payload)` orchestration + stub scorer
* Wiring in `AppModule` (or `JobsModule`) for Redis connection and processor registration
* Pino job lifecycle logs (`queued`, `running`, `completed`, `failed`) with `jobId`, `draftId`, `userId?`

**Steps (≤5)**

1. **Queue**: Create BullMQ queue `analysis.run` with default opts (attempts=3, backoff exponential, removeOnComplete=true).
2. **Processor**: Implement `@Processor('analysis.run')` with a handler that:

   * validates payload (DTO), logs `running`, and calls a **stub** analyzer to compute `ats_score` (and placeholders for others),
   * persists a new `Analysis`, updates `Draft.latest_analysis_id`, and sets `Draft.status='READY'`.
3. **Service**: Add `runAnalysisJob(draftId, dto)` that enqueues a job and returns `{ jobId }`.
4. **Errors**: On processor error, log `error` (no PII) and let BullMQ retry.
5. **Config**: Read Redis URL from env; export concurrency via env (default 2–4).

**OpenAPI (Swagger)**

* No public route here, but annotate any DTOs used by the endpoint (P-109) that enqueues jobs.

**Logging**

* On enqueue: `info` `{ event:'job_queued', queue:'analysis.run', jobId, draftId, userId? }`
* On start: `info` `{ event:'job_started', ... }`
* On complete: `info` `{ event:'job_completed', ... }`
* On fail: `error` `{ event:'job_failed', code, message }`

**Tests (backend)**

* **Unit**: `analyses.service` saves Analysis and updates Draft when given a fake scorer.
* **Integration**: Processor persists Analysis and updates Draft on a real queue with in-memory Redis (or test Redis).

**Postman quick verify**

* Trigger via P-109 endpoint (below). Observe job logs and DB changes.

**DoD**

* Enqueue → processor runs → `Analysis` row created → `Draft.latest_analysis_id` set → `Draft.status='READY'`.
* Pino job lifecycle logs include `jobId` and `draftId`.

---

## P-109 — Analysis + Jobs Endpoints (Backend)

**Goal**
Expose endpoints to kick an analysis and poll job status/result.

**Deliverables (backend)**

* `POST /drafts/:id/analysis` — returns `{ jobId }`, supports `Idempotency-Key`
* `GET /jobs/:jobId` — returns `{ job, result? }` in the standard JSON envelope
* Ownership/visitor access checks (analysis allowed for Visitor)

**Steps (≤5)**

1. **POST /drafts/:id/analysis**:

   * Validate `:id`, check ownership (user or `guest_draft_id` cookie).
   * Support `Idempotency-Key`: return existing `{ jobId }` if the same key was used.
   * Enqueue via `runAnalysisJob()` and return `{ jobId }`.
2. **GET /jobs/:jobId**:

   * Return job status and, if complete, the resulting entity shape (latest analysis data link or snippet).
3. **Envelope**: All responses use `{ data, requestId, meta }`.
4. **Security**: No auth required for analysis (Visitor allowed), but enforce ownership.
5. **Indexes**: Confirm `jobs(status,type,created_at)` exists (from P-107).

**OpenAPI (Swagger)**

* Tag: `@ApiTags('Analyses')` and `@ApiTags('Jobs')`.
* Document `Idempotency-Key` header for `POST /drafts/:id/analysis`.
* Document job response schema (`queued|running|completed|failed`).

**Logging**

* On enqueue, include `{ draftId, userId?, idemKey? }`.
* On GET job, include `{ jobId, status }` at `debug` level.

**Tests (backend)**

* **e2e**: create draft → `POST /drafts/:id/analysis` → `GET /jobs/:jobId` until `completed` → verify Analysis persisted & Draft status updated.
* **Idempotency**: second POST with same `Idempotency-Key` returns the same `{ jobId }`.

**Postman quick verify**

* POST analysis with `Idempotency-Key` header → `{ jobId }`.
* Poll GET `/jobs/{jobId}` every 3s → `completed` and result present.

**DoD**

* Happy-path works; idempotent POST; JSON envelope; Visitor access allowed with ownership checks.

---

## P-110 — Results Widget with Blur Gating (Frontend)

**Goal**
Render ATS/Match/Missing/Suggestions; **blur** non-entitled panels. Handle loading/error/retry states.

**Deliverables (frontend)**

* `components/ResultsWidget/ResultsWidget.tsx`
* `components/ResultsWidget/ResultCard.tsx`
* `components/ResultsWidget/UpgradeOverlay.tsx`
* Props accept `panels_allowed` and raw analysis data; uses entitlements as fallback

**Steps (≤5)**

1. Build `ResultCard` with slots for title, content, loading/error/retry.
2. Build `UpgradeOverlay` (CTA) and a blur wrapper controlled by entitlement.
3. Build `ResultsWidget` that maps `panels_allowed` → render cards; blur when not allowed.
4. Add skeletons/spinners for loading, and a retry callback.
5. Snapshot/unit tests for blur and loading states.

**Testing**

* `/try`: ATS visible; others blurred with Upgrade CTA.
* Pro route: all visible.

**DoD**

* Correct blur gating; clean loading/error UX; tests pass.

---

## P-111 — Analyze Action (Frontend)

**Goal**
Wire the **Analyze** button to trigger backend analysis and start job tracking.

**Deliverables (frontend)**

* RTK Query mutation for `POST /drafts/:id/analysis`
* Button component that disables until resume+JD present
* Toasts: “Working…” → “Result ready” with **View** action

**Steps (≤5)**

1. Create `useAnalyzeDraftMutation()` with header support for `Idempotency-Key`.
2. Button: disable until both Resume & JD present; on click, call mutation and start tracking `{ jobId }`.
3. Show non-blocking “Working…” toast; on completion, “Result ready” with deep link.
4. Error handling: toast with retry and error details (no PII).
5. Minimal test for disabled/enabled and mutation call.

**Testing**

* Manual: run analysis and confirm job starts; toasts show; results render.
* Unit: button state & mutation call verified.

**DoD**

* End-to-end from button → job started → result visible in widget.

---

## P-112 — Job Tracking Hook (Frontend)

**Goal**
A hook that **polls** `/jobs/:id` every ~3s, persists jobId to localStorage, and resumes after refresh.

**Deliverables (frontend)**

* `features/jobs/useJobTracking.ts`
* Redux slice or context entries to store job status/results per draft
* Toast “Result ready” when job completes

**Steps (≤5)**

1. Implement `useJobTracking(jobId, onComplete)` to poll (or use SSE/WebSocket via feature flag).
2. Persist `jobId` to localStorage keyed by draft; restore on mount.
3. Dispatch state updates as job advances; call `onComplete` with result.
4. Show a completion toast that deep-links back to the draft.
5. Tests with MSW for polling & completion.

**Testing**

* Refresh mid-job → still get the result.
* MSW test simulates `queued → running → completed`.

**DoD**

* Robust resume after refresh; no duplicate toasts; tests pass.

---

## P-113 — Guest Draft Retention Visuals (Frontend)

**Goal**
When a visitor returns (has `guest_draft_id`), show a banner to restore the last guest draft; explain 24h (soft 72h) retention.

**Deliverables (frontend)**

* `components/Common/GuestRestoreBanner.tsx`
* Logic in `/try` to detect guest session and last draft
* Dismiss state persisted until cookie expires

**Steps (≤5)**

1. Detect guest via `/auth/me` (plan=VISITOR).
2. If last guest draft exists, show a banner with “Restore” (opens draft) and “Dismiss”.
3. Persist dismiss flag (localStorage) until cookie expiration.
4. Add a link to retention policy info.
5. Test banner show/hide logic.

**Testing**

* Simulate cookie present → banner appears; on dismiss → stays hidden.
* Restore loads last draft.

**DoD**

* Works on `/try`; UX matches spec; tests pass.

---

## P-114 — OWASP Quick Pass (Backend)

**Goal**
Baseline protections aligned with backend instructions.

**Deliverables (backend)**

* Ownership checks: ensure draft belongs to `userId` **or** `guest_draft_id`
* Throttler: global rate limit (e.g., 60 req/min/IP)
* Upload validation stub: max size & allowed mime types (PDF/DOCX)
* Egress allowlist skeleton (OpenAI, Cohere, S3, SES domains)

**Steps (≤5)**

1. Implement an ownership guard/helper used by Draft/Analysis endpoints.
2. Add Nest ThrottlerModule with sensible defaults; document 429 envelope.
3. Add file-upload pipe/guard with size/mime checks (even if upload path is later).
4. Add an outbound HTTP service wrapper that rejects non-allowlisted hosts.
5. Tests for one protected route (403) and throttling (429).

**OpenAPI (Swagger)**

* Document 403/429 responses on representative endpoints.

**Logging**

* Log 403/429 at `warn` with `requestId`, `userId?` (no PII).

**DoD**

* 403 on forbidden finalize; 429 when rate-limited; tests pass.

---

## P-115 — Happy-Path Tests (FE + BE)

**Goal**
Guarantee the “golden path” for this sprint stays green.

**Deliverables**

* **Backend e2e** test: draft → analysis → job completes → analysis persisted → draft status `READY`
* **Frontend** test: Analyze → loading → result render in `ResultsWidget` with blur gating

**Steps (≤5)**

1. **BE e2e** (Supertest): seed user/guest → create draft → POST analysis → poll job → assert analysis & status.
2. **BE idempotency**: same `Idempotency-Key` returns same `{ jobId }`.
3. **FE test** (RTL + MSW): click Analyze → loading/skeleton → completed result → ATS shows, others blurred.
4. Add tests to CI; update README with `npm run test` commands.
5. Add coverage threshold note (optional).

**DoD**

* CI green; both BE and FE happy paths verified; idempotency covered.

---

## 3) Simple checklist

* [D] P-101 Pino baseline
* [D] P-102 Helmet + CORS + cookies
* [D] P-103 OpenAPI
* [D] P-104 Cookie JWT flows
* [D] P-107 Entities + migrations
* [D] P-116 Entitlements baseline
* [D] P-105 Session refactor (FE)
* [D] P-106 401 auto-refresh (FE)
* [D] P-117 Entitlements UI wiring (FE)
* [D] P-108 analysis.run worker
* [ ] P-109 analysis/jobs endpoints
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
