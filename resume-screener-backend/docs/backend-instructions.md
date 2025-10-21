# AI Resume Screener — **Backend Instructions** 

*(Place this file in `/docs/README_BACKEND_INSTRUCTIONS.md` in your repo)*

> **Purpose.** A single, opinionated playbook for how Copilot should generate backend code for this project.
> **Scope.** NestJS API, PostgreSQL (TypeORM), Redis + BullMQ jobs, S3 exports, SES emails, **Pino** logs, cookies-based JWT, OWASP controls, migrations, and acceptance criteria.
> **Guardrails.** Prefer **simplicity first**, enterprise-ready where it matters (auth, logging, security, data integrity).

---

## 0- Stack & Global Conventions

**Tech:** NestJS (REST) · PostgreSQL + TypeORM · Redis + BullMQ · **Pino** (JSON logs) · S3 · SES · Cron (EventBridge later) · JWT (cookies)

**Golden rules Copilot must follow**

* **Never** store tokens in `localStorage`. Use **HttpOnly cookies** (`access_token`, `refresh_token`).
* Long-running work = **BullMQ jobs** with a **`jobId`** returned immediately.
* **Only the latest rewrite** is stored per draft (no version history).
* Respond with **structured JSON**, include `requestId` on every response.
* **No PII in logs**. Always log with **Pino** (JSON), include correlation IDs when available: `requestId`, `userId`, `draftId`, `jobId`.
* Use **DTOs + class-validator** on **every** input. TypeORM **parameterized** queries only.

---

## 1- Folder Layout (backend)

```
/src
  app.module.ts
  /config/                  # env & config factories
  /common/                  # shared code (no feature logic)
    /logging/               # pino logger module + http middleware
    /security/              # helmet, cors, csrf (if cross-site), throttler
    /guards/                # auth/ownership guards
    /interceptors/          # response shaping, timeout
    /types/                 # shared enums/types/utils
  /modules/                 # ⬅️ all feature modules live here
    /auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      dto/
      strategies/           # jwt/refresh strategies
      guards/
    /users/
      users.module.ts
      users.controller.ts
      users.service.ts
      dto/
      entities/             # (option A) co-locate entity
    /drafts/
      drafts.module.ts
      drafts.controller.ts
      drafts.service.ts
      dto/
      entities/
    /analyses/
      analyses.module.ts
      analyses.controller.ts
      analyses.service.ts
      dto/
      entities/
    /rewrites/
    /exports/
    /files/
    /jobs/                  # BullMQ queues + processors + Job entity
    /admin/
    /mailer/                # SES mailer service + templates
    /scheduler/             # cron; EventBridge adapter later
/database
  /entities/                # (option B) keep entities centralized
  /migrations/

```

---

## 2- Environment & Config (12-factor)

Expose via `ConfigModule` + validation schema:

```
NODE_ENV, PORT, APP_ORIGIN, API_ORIGIN
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TTL_MIN=15, REFRESH_TTL_DAYS=14
PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DB
REDIS_URL
S3_REGION, S3_BUCKET_UPLOADS, S3_BUCKET_EXPORTS, S3_ACCESS_KEY, S3_SECRET_KEY
SES_REGION, SES_FROM_EMAIL
ENABLE_SSE, ENABLE_WATERMARKED_EXPORT
```

---

## 3- Security Posture — **OWASP Top-10 Map**

* **A01 Broken Access Control**: Ownership checks (by `user_id` **or** `guest_session_id`), RBAC for admin routes, server-side plan gating.
* **A02 Cryptographic Failures**: HttpOnly/Secure cookies, short-lived access JWT, refresh rotation, TLS only in prod, secrets in env/manager.
* **A03 Injection**: DTO validation/sanitization, TypeORM param queries, strict upload size/mime.
* **A04 Insecure Design**: Vertical slices with threat review, idempotency keys, quotas/throttling, cooldowns, bounded job inputs.
* **A05 Security Misconfiguration**: Helmet, CORS allowlist + `credentials: true`, private S3 + presigned GET, prod-only Secure cookies.
* **A06 Vulnerable/Outdated Components**: Dependabot/Snyk enabled, lockfile pinned, CI fails on high vulns.
* **A07 Identification & Auth Failures**: Cookie JWT, refresh endpoint, logout clears cookies, strong password hashing (argon2/bcrypt), CSRF if cross-site.
* **A08 Software & Data Integrity Failures**: Locked versions, validate job payload schemas, restrict outbound egress to approved domains.
* **A09 Security Logging & Monitoring Failures**: **Pino** JSON logs + correlation IDs, job lifecycle logs, slow-query logging, failure alerts.
* **A10 SSRF**: Egress allowlist (OpenAI/Cohere/S3/SES), disallow RFC-1918/metadata endpoints, never fetch user-provided URLs server-side.

---

## 4- HTTP Server Bootstrap (Nest) — **Pino, Helmet, CORS**

```ts
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Pino logger
  app.useLogger(app.get(PinoLogger)); // custom provider wrapping pino
  app.use(pinoHttp({ // request logs
    autoLogging: true,
    customProps: (req) => ({
      requestId: req.id,
      userId: req.user?.id,
    }),
  }));

  // Trust proxy if behind NGINX
  app.set('trust proxy', 1);

  // Security hardening
  app.use(helmet());
  app.enableCors({
    origin: [process.env.APP_ORIGIN], // allowlist
    credentials: true,                // cookies
  });

  // Global pipes/filters
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter()); // ensures JSON error shape

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

---

## 5- Auth & Sessions (Cookies, not localStorage)

**Flows**

* `POST /auth/register` → create user
* `POST /auth/login` → set **HttpOnly** cookies:

  * `access_token`: 15m, SameSite=Lax, Secure in prod
  * `refresh_token`: 7–14d, path `/auth/refresh`, rotate on use
* `POST /auth/refresh` → rotate refresh, issue access
* `POST /auth/logout` → clear cookies
* `GET /auth/me` → `{ user, plan }` (no tokens in body)

**JWT Strategy**

* Extract from **cookies**, not headers. Reject if missing or expired.
* Add CSRF only if cross-site cookies are required (double-submit cookie).

**Guests**

* On first guest draft: set `guest_draft_id` (uuid) cookie valid **24h**; soft-retain **72h**.

---

## 6- Request Lifecycle & Error Shape

* **Request ID** middleware: generate/propagate `x-request-id`.
* **Response envelope** (example):

  ```json
  { "data": { ... }, "requestId": "uuid", "meta": { ... } }
  ```
* **Error** shape:

  ```json
  { "error": { "code": "QUOTA_EXCEEDED", "message": "...", "details": {...} }, "requestId": "uuid" }
  ```

---

## 7- **Pino** Logging Policy

* **Format:** JSON to stdout.
* **Include** when present: `requestId`, `userId`, `draftId`, `jobId`.
* **Log**:

  * `info`: request summary (method, path, status, ms), job lifecycle (queued→running→completed), provider latency, quotas.
  * `warn`: retries, near-limit quotas, degraded providers.
  * `error`: stack, sanitized details (never PII), provider error codes.
* **DB**: enable slow-query logging and add indexes outlined in Data Model.

---

## 8- Data Model (TypeORM, PostgreSQL)

**users**
`id, email(unique), password_hash, name?, plan('FREE'|'PRO'|'ADMIN'), is_active, last_login_at?, created_at, updated_at`

**drafts**
`id, user_id?, guest_session_id?, title?, status('DRAFT'|'IN_REVIEW'|'READY'|'FINALIZED'), source('UPLOAD'|'GENERAL'), resume_text, jd_text, latest_analysis_id?, latest_rewrite_id?, finalized_export_id?, expires_at?, deleted_at?, created_at, updated_at`
**Indexes:** `(user_id, updated_at desc)`, `(guest_session_id)`, `(status)`

**analyses**
`id, draft_id, job_id?, ats_score(int 0–100), match_score(int 0–100)?, parsing_meta(jsonb)?, missing_skills(text[])?, keyword_hits(jsonb)?, panels_allowed(text[])? , created_at`
**Index:** `(draft_id, created_at desc)`

**rewrites** *(only latest per draft)*
`id, draft_id(unique), job_id?, model, tokens_used(int), content_json(jsonb), change_notes(jsonb)?, last_regen_at, regen_count(int), cooldown_until?, created_at`

**files**
`id, user_id?, guest_session_id?, draft_id?, kind('RESUME_UPLOAD'|'JD_UPLOAD'|'EXPORT_PDF'|'EXPORT_DOCX'), storage('S3'|'LOCAL'), bucket?, key?, etag?, mime, size(bigint), extracted_text?, created_at`

**exports**
`id, draft_id, job_id?, format('PDF'|'DOCX'), file_id, url_ttl_seconds(default 900), created_at`

**jobs**
`id, draft_id, user_id?, type('analysis.run'|'rewrite.run'|'export.render'), status('queued'|'running'|'completed'|'failed'), meta(jsonb)?, error(jsonb)?, started_at?, finished_at?, created_at`
**Index:** `(status, type, created_at)`

> **Later:** `guest_sessions`, `plan_entitlements`, `user_quotas`, `feature_flags`, `audit_logs`.

---

## 9- Migrations — Safe Order

1. **Auth**: switch FE to cookies; add `/auth/refresh` (no DB change).
2. **Draft status**: add enum (`DRAFT/IN_REVIEW/READY/FINALIZED`), backfill, swap.
3. **Draft links**: add `latest_analysis_id`, `latest_rewrite_id`, `finalized_export_id`, `source`.
4. **Jobs**: create `jobs` + indexes.
5. **Analyses**: add `parsing_meta`, `missing_skills[]`, `keyword_hits`, `panels_allowed`, `job_id`.
6. **Rewrites**: enforce **UNIQUE(draft_id)**, add cooldown/notes/job_id; migrate latest version per draft.
7. **Files/Exports**: extend `files.kind`, add S3 metadata; create `exports`.
8. **Indexes**: confirm dashboard & jobs queries are indexed.

---

## 10- Jobs & Queues (BullMQ)

**Queues:** `analysis.run`, `rewrite.run`, `export.render`

**Contract**

* POST endpoints return `{ jobId }` immediately.
* Consumers update **Job** entity and target domain entities.

**Processors**

* `analysis.run`: parse resume/JD → compute ATS, match?, missing skills?, suggestions; save **Analysis**, set `draft.status: IN_REVIEW→READY`, update `latest_analysis_id`.
* `rewrite.run`: generate/refresh resume → **upsert Rewrite** (unique per draft), update `regen_count`, `last_regen_at`, `cooldown_until`, `latest_rewrite_id`.
* `export.render`: render PDF/DOCX → upload to S3 → create **File** & **Export** → set `draft.status='FINALIZED'` + `finalized_export_id`.

**Reliability**

* Accept **`Idempotency-Key`** header; store in `jobs.meta.idemKey`; dedupe duplicates.
* Exponential backoff retries (3 attempts).
* Admin endpoint to **retry** failed jobs.

---

## 11- Storage & Emails

**S3 (private)**

* Buckets: `*-uploads` (optional, lifecycle 7–30d), `*-exports`.
* Download via **presigned GET** (short TTL). Do not expose raw S3 keys to clients.

**SES**

* Transactional emails: welcome/upgrade, **7-day reminder**.
* Keep templates in code first; can move to DB later.

---

## 12- Scheduling (start simple, upgrade later)

* **Now**: Nest `@Cron` or BullMQ repeatable job daily → drafts stuck `≥7 days` in `DRAFT/IN_REVIEW` → send SES email.
* **Later**: Migrate to **EventBridge Scheduler** for managed cron & fine-grained visibility.

---

## 13- API Contracts (what UI calls)

```http
# Auth (cookies; no tokens in body)
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

# Drafts
POST   /drafts
GET    /drafts?status=&q=&page=&pageSize=
GET    /drafts/:id
PATCH  /drafts/:id
DELETE /drafts/:id

# Analysis
POST   /drafts/:id/analysis           # → { jobId }
GET    /jobs/:jobId                   # → { job, result? }
# (optional later) GET /jobs/:jobId/stream  # SSE

# Rewrite
POST   /drafts/:id/rewrite            # body: { model, ... } → { jobId, cooldownUntil? }
GET    /drafts/:id/rewrite

# Finalize / Export
POST   /drafts/:id/finalize           # body: { format: 'PDF'|'DOCX' } → { jobId }
GET    /exports/:exportId             # { downloadUrl, expiresAt }

# Files (optional presign)
POST   /uploads/presign               # { kind, mime, size } → { url, fields }

# Admin
GET    /admin/overview
POST   /admin/jobs/:id/retry
PATCH  /admin/users/:id/plan
PATCH  /admin/flags/:key
```

---

## 14- Quotas, Entitlements, Throttling

* **Seeded plan config**:

  * `FREE`: `REWRITES_PER_DAY=2`, `EXPORT=false`
  * `PRO`: generous caps, `EXPORT=true`, `GENERAL_RESUME=true`
* **Counters** (add `user_quotas` later): increment atomically at request start; on exceed → **429** with `{ resetAt }`.
* **Throttling**: Nest Throttler per IP (e.g., `60 req/min`).
* **Gating**: analysis serializer fills `panels_allowed` based on user’s plan; UI blurs non-entitled panels.

---

## 15- Admin & Auditing

* **Admin** can: list jobs, **retry** job, **switch plan**, toggle feature flags, view overview metrics.
* **Audit logs** (later): persist admin actions: plan change, flag toggle, job retry.

---

## 16- Implementation Plan (backend tasks per slice)

**Sprint 1 — Visitor + Analysis**

* Cookie auth base; guest cookie on draft create.
* Entities: `Draft`, `Job`, `Analysis`.
* Endpoints: `/drafts`, `/drafts/:id/analysis`, `/jobs/:id`.
* Worker: `analysis.run`.
* **Pino** logging baseline, CORS with credentials.
* Updated the previous auth and user entities for cookie based sessions
* Proper OWASP rules usage
* Unit and e2e testing after basic APIs are ready for this sprint. 
* Necessary tools and tecnolgoies are integrated like pino, redis (if required)

**Sprint 2 — Rewrite + Resilience**

* Entity: `Rewrite` (unique per draft) with cooldown/notes.
* Endpoints: `POST/GET /drafts/:id/rewrite`.
* Idempotency keys; retries/backoff; slow-query logging.
* (Optional) SSE `/jobs/:id/stream`.

**Sprint 3 — Finalize + General Builder**

* Entities: `Export`, extended `File`.
* Endpoints: `/drafts/:id/finalize`, `/exports/:id`, `/general`.
* Worker: `export.render`; S3 presigned download.
* Admin: minimal job retry.

**Sprint 4 — Admin + Nudges + Hardening**

* Admin overview, plan switch, flags, user mode.
* Daily reminder cron → SES.
* Quotas counters, Throttler, further indexes, optional audit logs.

---

## 17- Acceptance Criteria (backend)

**Auth & Cookies**

* Cookies set/cleared correctly; `/auth/refresh` rotates; CORS credentials OK.

**Visitor `/try`**

* `guest_draft_id` cookie set; 1 analysis/session; 24h restore, 72h soft-retain.

**Analysis**

* `POST /drafts/:id/analysis` → Job queued; draft `IN_REVIEW → READY`; analysis includes `panels_allowed`; idempotency works.

**Rewrite**

* `POST /drafts/:id/rewrite` → Job queued; cooldown enforced; **Rewrite** holds only latest; `change_notes` filled.

**Export**

* `POST /drafts/:id/finalize` → Job queued; S3 file + **Export** saved; presigned URL returned; draft `FINALIZED`.

**Dashboard/Admin**

* Drafts list paginated/filterable; Admin can retry jobs, switch plan, toggle flags.

**Reliability & Security**

* Retries with backoff; throttling + quotas return 429 with reset; **Pino** logs contain correlation IDs; Helmet/CORS/CSRF configured.

---

## 18- Snippets Copilot Should Reuse

### 18.1 Cookie setters (login)

```ts
res.cookie('access_token', accessToken, {
  httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 15*60*1000,
});
res.cookie('refresh_token', refreshToken, {
  httpOnly: true, secure: true, sameSite: 'lax', path: '/auth/refresh', maxAge: 14*24*60*60*1000,
});
```

### 18.2 JWT extractor (cookies)

```ts
jwtFromRequest: (req) => req?.cookies?.['access_token'] || null,
```

### 18.3 Ownership guard (user or guest)

```ts
// Allow if draft.userId === req.user.id OR draft.guestSessionId === req.cookies['guest_draft_id']
```

### 18.4 Idempotency

```ts
// Read 'Idempotency-Key' header, upsert Job with meta.idemKey, return existing job if found
```

### 18.5 BullMQ processor skeleton

```ts
@Processor('analysis.run')
export class AnalysisProcessor {
  @Process()
  async handle(job: Job) {
    // set Job.running, startedAt
    // perform work
    // persist Analysis, update Draft.status & latest_analysis_id
    // set Job.completed, finishedAt
  }
}
```

### 18.6 S3 presigned GET

```ts
const url = await s3.getSignedUrlPromise('getObject', {
  Bucket: bucket, Key: key, Expires: 900,
});
```

---

## 19- Non-Functional Targets

* P95 API latency < 300ms (non-job endpoints).
* Job throughput target: 2–4 concurrent per queue (configurable).
* Error budget visible (5xx rate, job failure rate).
* Backups: Postgres daily snapshot (ops).

---