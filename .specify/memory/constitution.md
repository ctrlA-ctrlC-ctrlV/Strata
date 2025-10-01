# Strata Constitution

Minimum governing document for the Strata static web application project. Keep this lean; expand only when a demonstrated need (not speculation) arises.

## Core Principles

### 1. Simplicity First
Deliver a static site (HTML + CSS + minimal vanilla JS). No framework added until a concrete, quantified requirement cannot be met without it. Prefer progressive enhancement; the site must render core content with JS disabled.

### 2. Fast by Default
Initial page (above‑the‑fold) must load < 1 network round trip after HTML (critical CSS inlined up to 8KB). Largest Contentful Paint target: < 2.5s on a throttled mid‑tier mobile (Fast 3G profile). Defer non-essential scripts; avoid blocking third‑party assets.

### 3. Accessible & Semantic
All interactive elements use proper semantic tags. Color contrast passes WCAG AA. Each page has one <h1>, meaningful <title>, lang attribute, and meta viewport. Images require alt (or explicit empty alt for decorative). Keyboard navigation must work.

### 4. Cache & Immutable Assets
Static build emits fingerprinted asset filenames (content hash). HTML not fingerprinted and may be short‑cache (<=5m) or no-cache; assets (CSS/JS/images) get 1y immutable cache headers. Never overwrite an existing hashed filename.

### 5. Minimum Security Posture
All content served over HTTPS. Enforce: Content-Security-Policy (default-src 'self'); X-Content-Type-Options: nosniff; Referrer-Policy: strict-origin-when-cross-origin. No inline <script> without nonce/hash; if unavoidable, document justification inline.

## Technical Requirements

1. Build Tooling: Optional. If needed for hashing/minification, use a single, well‑supported tool (e.g., esbuild) with < 2s cold build on a typical laptop. No custom bundler layers.
2. Directory Layout (baseline):
	/public (raw static assets)
	/src (optional authoring sources if transformation is required)
	/dist (deployment artifact; fully static)
3. Asset Budget (initial):
	- HTML per page: <= 30KB uncompressed
	- Critical CSS inline: <= 8KB
	- Total blocking JS at initial load: 0KB (no blocking); total JS loaded on first paint: <= 50KB compressed
4. Images: Prefer modern formats (WebP / AVIF) fallback only if demonstrably needed.
5. Monitoring (minimum): Automatable check (CI) for Lighthouse performance (mobile), accessibility score ≥ 95, performance ≥ 90.

## Workflow & Quality Gates

1. Version Control: Every change via PR; no direct pushes to main.
2. Required PR Checks (must pass before merge):
	- HTML validation (e.g., w3c or tidy) no errors
	- Lighthouse CI (mobile) thresholds (Perf ≥90, A11y ≥95)
	- Link check (no broken internal links)
3. Review Focus: Simplicity, bytes shipped, accessibility semantics. Reject premature abstraction.
4. Deployment: Merge to main triggers static build + upload to CDN bucket + cache invalidation of HTML only.
5. Rollback: Retain last 5 dist bundles (hash or timestamp) for instant CDN pointer rollback.

## Governance

This constitution supersedes ad-hoc preferences. Amendments require:
1. Problem statement referencing a metric or incident.
2. Proposed concise change (≤ 200 added words) with acceptance metric.
3. Approval: 1 maintainer + 1 independent reviewer.
4. Version bump (PATCH for clarifications, MINOR for new rule, MAJOR for removal/incompatible change).

Non-compliant PRs must not merge. Exceptions (temporary waivers) require an inline TODO with owner + expiry date (≤ 30 days) and are tracked until resolved.

**Version**: 1.0.0 | **Ratified**: 2025-10-01 | **Last Amended**: 2025-10-01