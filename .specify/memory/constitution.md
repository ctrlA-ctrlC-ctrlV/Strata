<!--
Sync Impact Report

- Version change: N/A → 1.0.0
- Modified principles: Added new principles (P1–P7)
- Added sections: Purpose, Scope, Principles (P1–P7), Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ aligned (no changes needed)
  - .specify/templates/spec-template.md — ✅ aligned (no changes needed)
  - .specify/templates/tasks-template.md — ✅ updated (static web focus)
- Follow-up TODOs: None
-->

# Project Constitution: Strata

Version: 1.0.0  
Ratified: 2025-10-20  
Last Amended: 2025-10-20

## Purpose

Define non-negotiable engineering principles and governance for Strata, a standard
static web application delivered over HTTPS with pre-rendered content and
progressive enhancement.

## Scope

This constitution applies to all repositories and contributions under the Strata
project that build, test, deploy, or operate the static web application and its
assets (HTML, CSS, JS, images, fonts, data files). Server-side components are
out-of-scope except for build-time pipelines and hosting configuration.

## Principles

### P1 — Static-First Delivery

- Pages MUST be pre-rendered at build time with zero runtime server dependency.
- Critical user journeys MUST work without client-side JavaScript enabled.
- No dynamic runtime APIs are allowed on the critical path; use build-time data
  fetching and content generation instead.
- Rationale: Ensures reliability, speed, and low operational complexity.

### P2 — Performance Budgets

- Budgets (on a simulated Slow 3G/Median mobile device):
  - First Contentful Paint (FCP) ≤ 1.5s
  - Largest Contentful Paint (LCP) ≤ 2.5s
  - Time to Interactive (TTI) ≤ 3.5s
  - Total compressed JS+CSS bundles ≤ 500KB
- Images MUST be responsive, lazy-loaded where non-critical, and optimized.
- Rationale: Predictable fast experiences drive engagement and SEO.

### P3 — Progressive Enhancement & Accessibility

- Key flows MUST function with JS disabled; enhance features progressively.
- Accessibility MUST meet WCAG 2.1 AA: semantic HTML, focus order, contrast,
  ARIA only when necessary, and full keyboard navigation.
- All interactive elements MUST be usable by keyboard and screen readers.
- Rationale: Inclusive design broadens reach and reduces tech debt.

### P4 — Testing Discipline (TDD)

- Tests MUST be authored before implementation and observed to fail.
- Required test types per change:
  - Accessibility checks (automated, e.g., axe) for affected pages/components.
  - Lighthouse audits for Performance, Accessibility, Best Practices ≥ 90; SEO = 100.
  - Visual regression tests for critical UI where applicable.
- Rationale: Prevent regressions and codify quality expectations.

### P5 — Build-Time Optimization

- The build MUST apply minification, tree-shaking, dead-code elimination, and
  critical CSS inlining for above-the-fold content.
- Assets MUST be fingerprinted (content hashes) and served with long cache TTLs
  and immutable cache control; HTML must be no-cache.
- Rationale: Reduce payloads and improve cache efficiency at scale.

### P6 — Security by Default

- Site MUST be served over HTTPS with HSTS enabled.
- Enforce a strict Content Security Policy (CSP) with no unsafe-inline or
  unsafe-eval; allowlists for necessary origins only.
- Third-party assets MUST use Subresource Integrity (SRI) where applicable.
- Set secure headers: X-Content-Type-Options=nosniff, X-Frame-Options=DENY,
  Referrer-Policy=strict-origin-when-cross-origin, Permissions-Policy minimal.
- Rationale: Minimize attack surface for static delivery.

### P7 — Quality Gates & Reviews

- Every PR MUST include evidence of passing gates: tests, Lighthouse scores,
  and a11y report snapshots for changed pages/components.
- Changes MUST document performance budget impacts; exceeding budgets requires a
  temporary waiver with a plan to remediate before release.
- Rationale: Sustains quality and prevents slow drift.

## Governance

### Amendment Procedure

- Any contributor may propose amendments via PR referencing this file.
- Required approvals: at least one project maintainer and one reviewer with
  domain expertise (performance, accessibility, or security as relevant).
- On merge, update Last Amended date and version per Versioning Policy.

### Versioning Policy

- Semantic versioning of the constitution:
  - MAJOR: Backward-incompatible removals or redefinitions of principles.
  - MINOR: New principle/section added or materially expanded guidance.
  - PATCH: Clarifications, wording, and non-semantic refinements.

### Compliance Reviews

- CI MUST run: unit/visual tests, a11y checks, Lighthouse CI on key pages.
- Quarterly reviews MUST verify adherence to principles and budgets; action
  items tracked as issues with clear owners and due dates.

### Exceptions

- Temporary waivers MUST be approved by a maintainer, time-boxed, and include a
  remediation plan. Waivers expire in one release unless renewed with rationale.
