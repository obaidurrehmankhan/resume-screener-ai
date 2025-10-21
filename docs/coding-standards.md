# Coding Standards (Short, Enforced)

**Read first:**  
- Frontend spec → `frontend-instructions.md`  
- Backend spec → `/docs/README_BACKEND_INSTRUCTIONS.md`

**Prime rules**
- Small, reviewable PRs (≤ 200 LOC). Keep commits atomic and descriptive.
- **TypeScript everywhere**. Strict types; no `any`.
- **Controllers thin**; business logic in **services**.  
- **Validate every input** (DTO + class-validator / zod). Fail fast with clear errors.
- **Cookies-based JWT**; never store tokens in `localStorage`.
- **No PII in logs**. Use **Pino** JSON logs with `requestId`, `userId`, `draftId`, `jobId`.
- Long tasks → **BullMQ jobs** return `{ jobId }`. Support **idempotency** via `Idempotency-Key`.

---

**State**
- RTK Query for server data.  
- Redux slices for: session/entitlements, **job tracking**, modals/toasts, editor state (latest rewrite only).

**Patterns**
- **Job tracking**: `useJobTracking(jobId)` polls `/jobs/{id}` (3–5s) or SSE (flag), persists jobId to `localStorage`, shows “Result ready” toast.
- **Last-chance cache**: `useLastChanceCache(draftId, getContent, setContent)` saves on `beforeunload`, offers **Restore/Discard** on mount.
- **Gating**: Show all result cards; **blur** non-entitled with Upgrade CTA.
- **Disabled states**: Check Score until both inputs; Regenerate during cooldown; Finalize for Free (tooltip).
- **A11y**: semantic elements, ARIA labels, focus management, keyboard shortcuts (**Ctrl/⌘+S** to Save).
- **Perf**: Route-level code splitting (Rewrite, Admin); avoid heavy libs.

**Testing**
- Vitest + React Testing Library + MSW.  
- Each endpoint/screen: at least one **happy-path** test; mock jobs via MSW.

---

## Backend (NestJS + TypeORM + BullMQ)

**HTTP & Security**
- Bootstrap with **Helmet**, **CORS (credentials: true, allowlist)**, **ValidationPipe**, JSON error envelope.
- **Cookie JWT**: `access_token` (≈15m), `refresh_token` (7–14d, rotate on use).  
- **Guest**: set `guest_draft_id` (24h; soft 72h) when creating a guest draft.
- **OWASP**: ownership checks, throttling, quotas, idempotency, egress allowlist (OpenAI/Cohere/S3/SES), parameterized queries.

**API Shape**
- Success: `{ data, requestId, meta }`  
- Error: `{ error: { code, message, details }, requestId }`

**Jobs**
- Queues: `analysis.run`, `rewrite.run`, `export.render`.  
- Endpoints return `{ jobId }` immediately.  
- Processors update domain entities (`latest_*` links, statuses).  
- Retries/backoff; admin retry endpoint.  
- **Idempotency**: dedupe by `Idempotency-Key`.

**Data**
- **Rewrite is unique per draft** (no history).  
- Index for dashboard and job lookups.  
- S3 private with presigned GET; SES for reminders.

**Logging**
- **Pino** only. Log request summary, job lifecycle, provider latency; never log PII.

**Testing**
- Start with one **e2e happy-path** per new endpoint (Supertest).  
- Services get **unit tests** (pure logic).  
- Add **integration** tests for service+repo when logic stabilizes.

---

## Git & Reviews

- Conventional commits (e.g., `feat:`, `fix:`, `chore:`).  
- One feature per PR; include screenshots or sample responses for UI/API changes.  
- Checklists in PR template:
  - [ ] DTOs validated
  - [ ] Logs have requestId
  - [ ] At least one happy-path test
  - [ ] Quotas/throttling/idempotency considered (BE)
  - [ ] Blur/entitlement states verified (FE)

---

## Working with Copilot (Prompts)

- Keep **prompt cards** in `docs/sprints/prompts.md` (IDs like `P-007`).  
- Start a session with: “Read `project-brief.md`, `coding-standards.md`, FE/BE instructions; execute **P-00X**; propose ≤5-step plan; show **diffs** before saving; add 1 happy-path test.”  


---

## Definition of Done (quick checks)

**Frontend**
- [ ] Follows `frontend-instructions.md` (gating, cooldowns, job tracking, last-chance cache).  
- [ ] One happy-path test; a11y basics; no unused deps.

**Backend**
- [ ] Validated DTOs; JSON envelope; Pino logs (no PII).  
- [ ] Cookie JWT flows correct; guest cookie where needed.  
- [ ] Long work is a BullMQ job with `{ jobId }`; idempotency handled.  
- [ ] At least one e2e happy-path test.

---
