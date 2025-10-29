# Implementation Plan: Home Landing Page

**Branch**: `002-home-landing-page` | **Date**: 2025-10-29 | **Spec**: specs/002-home-landing-page/spec.md
**Input**: Feature specification from `/specs/002-home-landing-page/spec.md`

**Note**: Filled via /speckit.plan workflow.

## Summary

Build the main marketing landing page for a garden-room/home-extension company with static-first delivery and progressive enhancement. UI uses Tailwind for utility-first styling and Bootstrap (minimal footprint) for consistent base styles/components, per request. Critical journeys (read content, navigate sections, submit quote/newsletter) work without JavaScript; JS enhances carousels, smooth scroll, and inline confirmations. Forms provide mailto fallbacks to satisfy Static-First while offering enhanced submissions to backend APIs when JS is available.

## Technical Context

**Language/Version**: TypeScript 5.x (existing), HTML/CSS, Node.js 18+ (tooling)  
**Primary Dependencies**: Tailwind CSS (utilities), Bootstrap (reboot/base and selective components), existing frontend toolchain (Vite) and test stack (Playwright/Vitest); existing backend (Express) optionally for enhanced submissions  
**Storage**: Existing Supabase/PostgreSQL (for enhanced lead/subscriber capture) — not on critical path  
**Testing**: Vitest + Playwright (existing), axe automated a11y checks, Lighthouse CI/per-run audits  
**Target Platform**: Static site over HTTPS with progressive enhancement; desktop and mobile browsers  
**Project Type**: Web application (frontend + optional backend enhancements)  
**Performance Goals**: FCP ≤ 1.5s, LCP ≤ 2.5s on median mobile; interactive gallery feels instant (<100ms perceived)  
**Constraints**: Total compressed CSS+JS ≤ 500KB; strict CSP; no critical-path runtime APIs; keyboard-accessible flows; prefers-reduced-motion respected  
**Scale/Scope**: Single-page landing with 11 sections; gallery ~12–24 images; testimonials 3–6 entries; traffic typical for SMB marketing site

NEEDS CLARIFICATION (captured then resolved in Phase 0 research):
- How to include Bootstrap alongside Tailwind without exceeding budgets and conflicting styles? (resolved in Phase 0)
- Form submission strategy that honors Static-First while enabling inline success states. (resolved in Phase 0)
- Carousel/accordion approach that is fully accessible with no-JS baseline. (resolved in Phase 0)

## Constitution Check

Pre-Design Gate (pass with mitigation strategies):
- Static-First: Use semantic HTML; details/summary for FAQ; CSS scroll-snap for gallery baseline; forms include mailto fallbacks; JS enhances but not required. PASS
- Performance Budgets: Tailwind with purge; Bootstrap limited to reboot/base + selective components; critical CSS inlining for hero/header; responsive images. PASS
- Progressive Enhancement: Baseline works without JS; keyboard-friendly controls; ARIA only as needed. PASS
- TDD: Author Playwright+axe tests and Lighthouse audits before implementation; observe failures first. PASS
- Build-Time Optimization: Tree-shake, minify, purge unused CSS, responsive images, hashes. PASS
- Security: Strict self-hosted assets, SRI for any third-party; CSP configured. PASS
- Quality Gates: Target ≥90 (Perf/A11y/Best Practices), SEO 100 with sitemeta. PASS

## Project Structure

### Documentation (this feature)

```
specs/002-home-landing-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 (via /speckit.tasks)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/             # Optional: enhanced form handlers
│   └── services/
└── tests/

frontend/
├── src/
│   ├── components/      # Header, Hero, ProblemOutcome, BenefitsGrid, ProductSection, Gallery, Testimonial, Process, FAQ, Newsletter, Footer
│   ├── pages/
│   │   └── home.tsx     # Landing page composition (or index.html with partials)
│   └── styles/
└── tests/
```

**Structure Decision**: Use existing `frontend/` for UI; optional backend endpoints in `backend/src/api/` for enhanced submissions. All critical flows have static/no-JS fallbacks to meet constitution.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Use of both Tailwind and Bootstrap | Stakeholder requirement; Bootstrap reboot for base consistency, Tailwind for utilities | Using only one would not meet explicit request; mitigate via purge and selective imports |

---

## Phase 0: Outline & Research

Unknowns identified in Technical Context were researched and resolved. See `research.md` for decisions, rationale, and alternatives. Key outcomes:
- Tailwind + Bootstrap coexistence plan (minimal Bootstrap, purge CSS, critical CSS).
- Static-first forms with mailto fallback; JS-enhanced POST to optional APIs.
- Accessible gallery and FAQ with no-JS baselines using native patterns.

Artifacts:
- E:\Zhaoxiang_Qiu\work\SDeal\Strata\specs\002-home-landing-page\research.md

## Phase 1: Design & Contracts

Artifacts produced:
- Data model: E:\Zhaoxiang_Qiu\work\SDeal\Strata\specs\002-home-landing-page\data-model.md
- API contracts (OpenAPI): E:\Zhaoxiang_Qiu\work\SDeal\Strata\specs\002-home-landing-page\contracts\openapi.yaml
- Quickstart: E:\Zhaoxiang_Qiu\work\SDeal\Strata\specs\002-home-landing-page\quickstart.md
- Agent context updated via script for GitHub Copilot.

Re-evaluated Constitution Check (post-design): PASS — static-first maintained; budgets feasible with purge and minimal Bootstrap; baseline no-JS UX intact.

## Phase 2: Next Steps (Planning stub)

- Implementation tasks to be created in `tasks.md` by `/speckit.tasks`.

