# Implementation Plan: Static Marketing Site & Configurator for Garden Rooms

**Branch**: `001-static-web-leads` | **Date**: 2025-10-29 | **Spec**: E:\Zhaoxiang_Qiu\work\SDeal\Strata\specs\001-static-web-leads\spec.md
**Input**: Feature specification from `/specs/001-static-web-leads/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a static‑first marketing site with an MVP form‑based configurator that provides live price estimates (with VAT toggle) and a frictionless quote submission, optimized for SEO, performance, and accessibility. Use a React + Vite frontend with Tailwind CSS and Bootstrap for UI development, and a minimal backend API solely for secure form submissions and admin content management. Store data in Supabase (Postgres) with strong security controls and use Supabase Storage for assets where appropriate. Progressive enhancement ensures core content and contact paths function without JavaScript, with graceful fallbacks; vanilla TypeScript/HTML can be used for supporting pages and simple enhancements where React is not necessary.

## Technical Context

**Language/Version**: 
- Frontend: React (TypeScript) with Vite (latest stable), Tailwind CSS, Bootstrap 5
- Backend: Node.js LTS (latest stable)

**Primary Dependencies**: 
- Frontend: React, Tailwind CSS (latest stable), Bootstrap (latest stable); minimal utility libs only if justified
- Backend: Express (minimal API), `@supabase/supabase-js` (server-side client), zod for validation, nodemailer with SMTP for email delivery, multer or busboy for uploads handling, sharp for image processing, node-cron for scheduled tasks

**Storage**: Supabase Postgres (managed). Schemas/tables: quotes, testimonials, products, gallery, assets. Images served as static assets or via Supabase Storage buckets; controlled runtime admin uploads are allowed in MVP (admin-only) with strict validation. Uploaded images are processed into responsive variants (WebP/AVIF) via `sharp`, stored with hashed filenames (local disk in development; Supabase Storage buckets in production), and referenced via metadata in Postgres. Prefer Row Level Security (RLS) for any client-facing reads; server uses service role for privileged operations.

**Testing**: 
- Unit: vitest for frontend utilities; jest or vitest for backend logic
- E2E: Playwright (critical flows: configurator → quote, contact, gallery overlay)
- Accessibility: axe‑core automated checks in CI (WCAG 2.1 AA target)

**Target Platform**: Web (desktop + mobile). Hosting: static frontend with CDN; backend/API on Node service behind TLS; Supabase provides managed Postgres, Auth (optional), and Storage.

**Project Type**: Web application (static frontend + minimal backend API)

**Performance Goals**: LCP < 1.2s desktop / < 1.8s mobile (P75); TTI < 2.5s; Lighthouse ≥90 in Performance, Accessibility, Best Practices; SEO 100.

**Constraints**: 
- React is the primary frontend framework. Tailwind CSS and Bootstrap are used for UI development (Tailwind for utility-first styling and design tokens; Bootstrap for selected components/layout where it accelerates delivery). Vanilla TypeScript/HTML is acceptable for lightweight, static pages or micro-interactions. Progressive enhancement for no‑JS core paths remains mandatory.
- Data security: strict CSP, HTTPS, SRI (third‑party scripts/styles), security headers, input validation, secrets management
- Controlled runtime uploads (admin‑only): MIME/type and extension checks (jpg/jpeg/png/webp/avif), max size limits, randomized/content‑hashed filenames, rate limiting, authentication + authorization required. Recommend object storage with private buckets/CDN and signed URLs; update CSP to allow the images origin.
- Email deliverability: inbox (not spam), <1 minute delivery for ≥95% submissions

**Scale/Scope**: 20K monthly visits target within 6 months; quote conversion primary metric; admin dashboard for metadata management only in MVP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from Strata Constitution (v1.0.0):

- Static‑First Architecture: Frontend pre‑built with Vite; only dynamic endpoints for quotes/contact/admin; graceful fallback via mailto and downloadable summary if API unavailable. PASS
- Note: Admin asset uploads are limited to authenticated dashboards and do not affect public, core user flows. Public content remains statically served; upload processing happens server‑side and results are consumed as static URLs. PASS
- Performance‑First Development: Performance budgets defined (see Technical Context); image optimization and critical CSS inlined; bundle budget <500KB compressed. PASS
- Progressive Enhancement (NON‑NEGOTIABLE): Core content accessible without JS; forms provide basic fallback; keyboard accessible UI. PASS
- Test‑Driven Development: Unit + E2E + a11y tests planned before implementation; CI required to merge. PASS
- Build‑Time Optimization: Minify, tree‑shake, critical CSS, responsive images. PASS

Gate Status: PASS (no violations). Notes: Dynamic API is limited in scope and adheres to static‑first with graceful degradation.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
frontend/
├── src/
│   ├── pages/               # Home, Products (Garden Room, House Extension, House Build), Gallery, FAQ, Contact
│   ├── components/          # React components: Header, Footer, Configurator steps, Gallery overlay
│   ├── styles/              # Tailwind config and global utilities; Bootstrap integration as needed
│   ├── lib/                 # Utilities (formatters, price calc)
│   └── analytics/           # Event dispatch (abstracted)
├── public/                  # Static assets (images, icons)
└── tests/
  ├── unit/
  └── e2e/

backend/
├── src/
│   ├── api/                 # Express routes (quotes, contact, admin)
│   ├── services/            # mailer, pricing, validation
│   ├── db/                  # Supabase client setup + repositories (Postgres)
│   └── security/            # CSP/headers, input sanitization
└── tests/
  ├── unit/
  └── integration/
```

**Structure Decision**: Web application: static Vite + React frontend with Tailwind and Bootstrap; minimal Node API backend. Public images are served statically or via Supabase Storage; MVP permits controlled admin image uploads (secured endpoints, processing to responsive variants, and metadata references). All data/metadata stored in Supabase Postgres; Supabase Storage is used for assets in production. Security‑first posture with strict headers and CSP.

Additional backend components reflecting uploads pipeline:

```
backend/
├── src/
│   ├── api/
│   │   ├── uploads.ts          # Admin-only upload endpoint (validation, limits)
│   │   └── products.ts         # Admin products CRUD endpoints
│   ├── services/
│   │   ├── images.ts           # Image processing (sharp), variant generation, storage adapter (Supabase Storage)
│   │   └── retention.ts        # Scheduled cleanup (quotes retention)
│   └── security/
│       └── auth.ts             # Auth/session or token strategy and route guards
```

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate backend service | Required to securely handle quotes/contact and admin ops | Client‑only cannot safely store data or send reliable email |
| Email provider dependency | Inbox deliverability guarantees | Self‑hosted SMTP risks poor deliverability and blocks on infra |