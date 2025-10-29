# Research: Home Landing Page

Created: 2025-10-29
Branch: 002-home-landing-page
Spec: ../spec.md

## Decisions and Rationale

### 1) Tailwind + Bootstrap without bloat
- Decision: Tailwind as primary (utilities, layout, spacing, typography). Bootstrap limited to Reboot/base and selective tokens; avoid full component bundle.
- Rationale: Meet stakeholder directive while keeping CSS payload small and predictable. Tailwind Purge removes unused utilities; Bootstrap base normalizes defaults and offers consistent box model.
- Alternatives: Tailwind-only (rejected: conflicts with directive); Bootstrap-only (rejected: utility ergonomics and theming less flexible for this IA).

Implementation notes:
- Enable Tailwind purge based on `frontend/src/**/*.{html,ts,tsx}`.
- Include Bootstrap Reboot via self-hosted CSS; avoid JS plugins; no jQuery. Prefer details/summary and native patterns.
- Extract critical CSS for hero/header; inline in HTML head at build time.

### 2) Static-First forms with progressive enhancement
- Decision: Baseline submission via `mailto:` fallback and clearly visible email/phone alternatives. JS-enhanced path calls backend endpoints to capture leads/subscribers and shows inline success.
- Rationale: Satisfies Constitution P1 (no runtime API on critical path) while providing a modern UX when JS is available.
- Alternatives: Third-party form handlers (Formspree, Netlify Forms) (rejected to avoid external dependency); Full server-side only (rejected due to P1).

Implementation notes:
- Quote form: required fields (First name, Phone, Email, Address line 1, Eircode); optional (Second name, Address line 2, Note).
- Newsletter: single opt-in; link to privacy & data policy.
- No-JS: show submit button that opens `mailto:info@sdeal.ie?subject=Quote%20Request&body=...` with prefilled details; also display contact email/phone inline.
- JS: POST to `/api/quote-leads` and `/api/newsletter-subscriptions` (see contracts), then render inline success.

### 3) Accessible gallery and sliders with no-JS baseline
- Decision: Use CSS `overflow-x:auto` + `scroll-snap-type:x mandatory` for horizontal gallery; mouse/touch scrolling native; keyboard support via focusable tiles. JS enhancement adds drag-to-scroll inertia and next/prev controls. Testimonials render as a list with the same pattern.
- Rationale: Native scrolling is robust and accessible; JS enhancement is optional.
- Alternatives: Heavy carousel libs (rejected due to bundle size and a11y risk); pure CSS radio-slider (hard to make robust for SRs and keyboard).

### 4) FAQ accordion pattern
- Decision: Use native `<details><summary>` for baseline; enhance styles for visibility; ARIA roles only if needed.
- Rationale: Best native a11y with minimal JS and small footprint.
- Alternatives: Custom ARIA accordion (heavier), or Bootstrap JS accordion (adds JS dependency not needed).

### 5) Images and performance
- Decision: Use `<picture>` with responsive sources; lazy-load non-critical; prefetch hero image; compress WebP/AVIF where supported.
- Rationale: Meet budgets and LCP goals.
- Alternatives: Single large hero; rejected due to LCP risk.

## Resolved Unknowns (from Technical Context)
- Bootstrap + Tailwind coexistence: resolved via Bootstrap Reboot + Tailwind utilities with purge and critical CSS.
- Forms static-first + enhanced API: resolved via mailto fallback + optional POST endpoints.
- Carousel/accordion a11y with no-JS: resolved via scroll-snap + details/summary; JS is optional.

## Open Considerations
- Content sources (images, copy) delivery path and ownership (CMS vs repo) — assume repo-managed assets for now.
- Exact destination of "For more details" links — assume dedicated detail pages or temporary anchors until pages exist.
