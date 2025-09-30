# 🧠 Resume Screener AI – Full Stack MVP

Production-minded **AI Resume Screener & Rewriter** that showcases **real AI integration**, **clean architecture**, a **guest → signup funnel**, and **SaaS readiness**.

<p align="left">
  <a href="#tech-stack"><img alt="Stack" src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20RTK%20Query%20%7C%20Tailwind-blue"></a>
  <a href="#tech-stack"><img alt="Backend" src="https://img.shields.io/badge/Backend-NestJS%20%7C%20TypeORM%20%7C%20PostgreSQL-green"></a>
  <a href="#api-docs-swagger"><img alt="Docs" src="https://img.shields.io/badge/API%20Docs-Swagger-brightgreen"></a>
  <a href="#deployment-plan"><img alt="Deploy" src="https://img.shields.io/badge/Deploy-Vercel%20%7C%20Railway%20%7C%20Neon-purple"></a>
</p>

---

## 📚 Table of Contents
- [Problem](#-problem)
- [Solution](#-solution)
- [What We’re Offering](#-what-were-offering)
- [Tech Stack](#-tech-stack)
- [Status](#-status)
- [Architecture](#-architecture)
- [Core Flows](#-core-flows)
- [Deployment Plan](#-deployment-plan)
- [AI Concepts Covered](#-ai-concepts-covered)
- [Contributing / Contact](#-contributing--contact)

---

## 🔍 Problem
Most resumes are **misaligned** with the Job Description (JD): missing keywords, weak structure, and ATS issues. Recruiters skim and discard quickly; candidates don’t know what to fix.

---

## 🎯 Solution
**Resume Screener AI** lets users (and **guests**) paste or upload a resume + JD, then uses AI to:

- **Score the match** (e.g., 76%)
- **Highlight gaps** (skills, tools, titles)
- **Provide actionable suggestions**
- **Rewrite the resume** in one click (logged-in users)
- **Check ATS compatibility** (prompt-assisted)
- **Throttle/regenerate** to control cost
- **Autosave** drafts (incl. on token expiry)

---

## 👥 What We’re Offering
- **Job seekers:** fast gap analysis, targeted rewrite, ATS-friendly output.
- **Freelance/Agencies:** demo-ready app easily extended to multi-tenant orgs, pricing, exports.
- **Recruiters (future):** multi-resume tracking, bulk scoring, team views.

---

## 🧱 Tech Stack
| Layer     | Tech |
|----------|------|
| Frontend | **React 18**, React Router, Tailwind CSS, **Redux Toolkit**, **RTK Query** |
| Backend  | **NestJS**, **TypeORM**, **PostgreSQL** (JSONB) |
| AI       | **OpenAI (GPT-4)** for analysis & rewrite; **Cohere** later (similarity/classification) |
| Auth     | **JWT** (access), protected routes, **autosave on 401** |
| Ops      | Throttling (Nest Throttler), DTO validation, soft delete |
| Deploy   | **Vercel (frontend)** + **Railway/Render (API)** + **Supabase (Postgres)** |
| Docs     | **Swagger** at `/docs` (Bearer auth), schemas & examples |

---

## ✅ Status

**Done**
- Admin/User dashboard scaffolds  
- Upload screen UI (Resume+JD inputs, widgets)  
- Rewrite screen UI (editor, regenerate, save draft)  
- JWT auth wired (frontend + backend)  
- Base folder/feature structure

**In Progress**
- **Guest mode**: `/upload` with **limited scoring** + upgrade CTA  
- **Full analysis** (match %, ATS, section tips) for logged-in users  
- **Rewrite**: v1 + **regenerate** (throttled + cooldown UI)  
- **Autosave** (debounced & on 401)  
- **History dashboard** (list/open/delete drafts)  
- **Swagger docs** with examples  
- **Deployment** (Vercel + Railway/Render + Supabase)

**Future MVPs**
- Downloads (PDF/DOCX), pricing/billing, multi-tenancy, recruiter workspace

---

## 🗺️ Architecture

  - A[Browser (React at Vercel)] -- HTTPS --> B[NestJS API at Railway/Render]
  - B --> C[(Supabase PostgreSQL)]
  - B --> D[[OpenAI GPT-4]]

---

## 🔁 Core Flows

**Guest (no login)**

- /upload → paste/upload resume + JD

- Check Score → limited match score only

- Upgrade CTA → login/signup → attach guest draft to user → redirect to /rewrite/:draftId

**User**

- /upload → upload/paste → Create draft

- Check Score → full analysis (match %, ATS, section tips)

- Rewrite → v1 generated; Regenerate → v2, v3… (throttled)

- Autosave while typing; on 401 do best-effort autosave before redirect

- Dashboard → history list, open, delete (soft)

---

## 🚀 Deployment Plan

***Frontend**: Vercel (React SPA)

- VITE_API_BASE_URL=https://api.yourdomain.com

**API**: Railway or Render (Docker)

- ENV: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGIN

- Run TypeORM migrations on startup

**DB**: Supabase PostgreSQL

- Primary branch + connection pooling

**CORS**: allow only your Vercel domain(s)

**HTTPS**: managed by Vercel + Railway/Render

---

## Contributing / Contact

Issues and PRs welcome.

Contact: obaid.techguy@gmail.com
