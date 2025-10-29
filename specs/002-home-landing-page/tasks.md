# Tasks: Home Landing Page

Created: 2025-10-29
Branch: 002-home-landing-page
Spec: ../spec.md
Plan: ../plan.md

Notes
- Checklist format is strict: "- [ ] T### [P] [US#] Description with file path".
- [P] appears only on tasks that can run in parallel with others.
- User Story phases are independently testable and can be delivered incrementally.

---

## Phase 1 — Setup

- [ ] T001 Configure Tailwind project files in frontend/tailwind.config.cjs
- [ ] T002 Add Tailwind base stylesheet in frontend/src/styles/tailwind.css
- [ ] T003 Wire Tailwind into Vite entry in frontend/src/main.ts
- [ ] T004 Add Bootstrap Reboot (self-hosted) to frontend/public/css/bootstrap-reboot.min.css
- [ ] T005 Include CSS links (Tailwind build + Bootstrap Reboot) in frontend/index.html
- [ ] T006 Create images directory structure in frontend/public/images/{hero,gallery,projects,testimonials,logos}
- [ ] T007 Add CSP meta and required security headers in frontend/index.html (meta tags) and docs/deployment notes
- [ ] T008 Add accessibility tooling hooks (axe in Playwright) in frontend/tests/helpers/axe.ts
- [ ] T009 Prepare Lighthouse config for CI (doc stub) in docs/production-health-automation.md
- [ ] T010 Add privacy & terms links placeholders in frontend/index.html

## Phase 2 — Foundational

- [ ] T011 Create base layout container and grid utilities in frontend/src/styles/layout.css
- [ ] T012 [P] Add utility classes for scroll-snap and reduced-motion in frontend/src/styles/utilities.css
- [ ] T013 Implement Sticky Header shell in frontend/src/components/Header.ts
- [ ] T014 [P] Implement Footer shell with NAP/socials in frontend/src/components/Footer.ts
- [ ] T015 Implement Hero shell (H1, sub, CTA, trust minis) in frontend/src/components/Hero.ts
- [ ] T016 [P] Wire page composition in frontend/src/pages/home.ts (assemble sections)
- [ ] T017 Add anchor target for "Get a Quote" (#quote) in frontend/index.html
- [ ] T018 [P] Add semantics and skip-to-content link in frontend/index.html
- [ ] T019 Create BenefitsGrid base with 6 items in frontend/src/components/BenefitsGrid.ts
- [ ] T020 [P] Add Problem→Outcome strip component in frontend/src/components/ProblemOutcome.ts

## Phase 3 — User Story 1 (P1): Request a Quote

- [ ] T021 [US1] Create QuoteForm component shell in frontend/src/components/QuoteForm.ts
- [ ] T022 [P] [US1] Add required fields (First name, Phone, Email, Address line 1, Eircode) and optional fields in frontend/src/components/QuoteForm.ts
- [ ] T023 [US1] Implement client-side validation rules and aria-describedby in frontend/src/components/QuoteForm.ts
- [ ] T024 [P] [US1] Add no-JS baseline (form action=mailto:… with subject/body template) in frontend/src/components/QuoteForm.ts
- [ ] T025 [US1] Add JS-enhanced submit with inline success/failure to backend POST /api/quote-leads in frontend/src/components/QuoteForm.ts
- [ ] T026 [P] [US1] Ensure header CTA scrolls to form and focuses first field in frontend/src/components/Header.ts
- [ ] T027 [US1] Implement success state message block and next steps UI in frontend/src/components/QuoteForm.ts
- [ ] T028 [US1] Add keyboard navigation and visible focus styles in frontend/src/components/QuoteForm.ts
- [ ] T029 [P] [US1] Backend: scaffold POST /api/quote-leads per contracts in backend/src/api/quotes.ts
- [ ] T030 [US1] Backend: basic validation and 201 response shape in backend/src/api/quotes.ts
- [ ] T031 [US1] Playwright: form validation and success flow test in frontend/tests/e2e/quote-form.spec.ts
- [ ] T032 [P] [US1] Axe: a11y checks for form labels/errors in frontend/tests/e2e/quote-form-a11y.spec.ts

## Phase 4 — User Story 2 (P1): Explore Product Sections

- [ ] T033 [US2] Create Garden Rooms section (2-col layout) with image left in frontend/src/components/ProductSectionGardenRooms.ts
- [ ] T034 [P] [US2] Add right-column content flow (label, H2/H3, brand paragraph, primary CTA) in frontend/src/components/ProductSectionGardenRooms.ts
- [ ] T035 [US2] Add secondary heading, supporting paragraph, underlined "For more details" link in frontend/src/components/ProductSectionGardenRooms.ts
- [ ] T036 [P] [US2] Create Home Extensions section (2-col layout) in frontend/src/components/ProductSectionHomeExtensions.ts
- [ ] T037 [US2] Mirror right-column flow for Home Extensions in frontend/src/components/ProductSectionHomeExtensions.ts
- [ ] T038 [US2] Define details link destinations (temporary anchors or dedicated pages) in frontend/index.html
- [ ] T039 [P] [US2] Ensure 4.5:1 contrast and readable line-lengths in frontend/src/styles/product-sections.css
- [ ] T040 [US2] Keyboard/tab order tests for CTAs and links in frontend/tests/e2e/product-sections-a11y.spec.ts

## Phase 5 — User Story 3 (P2): Explore Projects Gallery

- [ ] T041 [US3] Create Gallery container with fixed height and scroll-snap in frontend/src/components/Gallery.ts
- [ ] T042 [P] [US3] Implement variable-height tiles and lazy-loading images in frontend/src/components/Gallery.ts
- [ ] T043 [US3] Add keyboard focusable tiles and outline styles in frontend/src/components/Gallery.ts
- [ ] T044 [P] [US3] JS enhancement: drag-to-scroll and next/prev controls in frontend/src/components/Gallery.ts
- [ ] T045 [US3] Respect prefers-reduced-motion and disable inertia in frontend/src/components/Gallery.ts
- [ ] T046 [P] [US3] Backend: GET /api/projects (optional enhancement) in backend/src/api/projects.ts
- [ ] T047 [US3] Wire gallery to static images first; then optional fetch path in frontend/src/components/Gallery.ts
- [ ] T048 [US3] Playwright: desktop drag and mobile swipe interaction tests in frontend/tests/e2e/gallery.spec.ts
- [ ] T049 [P] [US3] Axe: a11y checks for gallery controls and focus in frontend/tests/e2e/gallery-a11y.spec.ts

## Phase 6 — User Story 4 (P2): Build Trust

- [ ] T050 [US4] Add trust minis (rating, projects, warranty, planning) to Hero in frontend/src/components/Hero.ts
- [ ] T051 [P] [US4] Create Testimonial list baseline in frontend/src/components/Testimonial.ts
- [ ] T052 [US4] JS enhancement: next/prev and announcement to SR in frontend/src/components/Testimonial.ts
- [ ] T053 [P] [US4] Backend: GET /api/testimonials (optional enhancement) in backend/src/api/testimonials.ts
- [ ] T054 [US4] A11y test: testimonial controls operable via keyboard in frontend/tests/e2e/testimonial-a11y.spec.ts
- [ ] T055 [US4] Visual test: hero trust minis visible and readable in frontend/tests/e2e/hero-visual.spec.ts

## Phase 7 — User Story 5 (P3): Self-Serve Answers (Mini-FAQ)

- [ ] T056 [US5] Implement FAQ using <details><summary> baseline in frontend/src/components/FAQ.ts
- [ ] T057 [P] [US5] Style summary focus/hover and expanded states in frontend/src/styles/faq.css
- [ ] T058 [US5] Ensure multiple items can be open; update behavior in frontend/src/components/FAQ.ts
- [ ] T059 [P] [US5] Add keyboard navigation tests for FAQ in frontend/tests/e2e/faq-a11y.spec.ts
- [ ] T060 [US5] Content placeholders for top 3 planning/regs questions in frontend/src/components/FAQ.ts

## Phase 8 — User Story 6 (P3): Subscribe for Offers (Newsletter)

- [ ] T061 [US6] Create Newsletter form with email field and policy link in frontend/src/components/Newsletter.ts
- [ ] T062 [P] [US6] Add client-side validation and inline error in frontend/src/components/Newsletter.ts
- [ ] T063 [US6] Single opt-in inline success state in frontend/src/components/Newsletter.ts
- [ ] T064 [P] [US6] JS enhancement: POST /api/newsletter-subscriptions in frontend/src/components/Newsletter.ts
- [ ] T065 [US6] No-JS baseline behavior (fallback note and contact email) in frontend/src/components/Newsletter.ts
- [ ] T066 [P] [US6] Backend: scaffold POST /api/newsletter-subscriptions in backend/src/api/newsletter.ts
- [ ] T067 [US6] A11y test: form label, error text, focus order in frontend/tests/e2e/newsletter-a11y.spec.ts

## Final Phase — Polish & Cross-Cutting

- [ ] T068 Optimize responsive images with <picture> and srcset in frontend/index.html and assets
- [ ] T069 [P] Inline critical CSS for hero/header in frontend/index.html
- [ ] T070 Add sitemap and SEO metas (title/desc/og) in frontend/index.html
- [ ] T071 [P] Lighthouse audits: Perf/A11y/Best Practices ≥ 90; SEO = 100 in frontend/tests/e2e/lighthouse.spec.ts
- [ ] T072 Add visible skip links and verify headings order in frontend/index.html
- [ ] T073 [P] Ensure all interactive elements have visible focus styles across components in frontend/src/styles/accessibility.css
- [ ] T074 Verify prefers-reduced-motion across gallery/testimonial in frontend/src/components/{Gallery,Testimonial}.ts
- [ ] T075 [P] Document deployment caching and immutable assets in docs/deployment-mongodb-removal-report.md
- [ ] T076 Update README with build/run steps and feature link in README.md
- [ ] T077 [P] Final spec conformance check vs FR and SC in specs/002-home-landing-page/spec.md

---

## Dependencies (Story Order)

1) US1 Request a Quote (P1) — depends on Foundational (header anchor)
2) US2 Explore Product Sections (P1) — depends on Foundational (grid/layout)
3) US3 Projects Gallery (P2) — depends on Foundational
4) US4 Build Trust (P2) — depends on Foundational
5) US5 Self-Serve Answers (P3) — depends on Foundational
6) US6 Subscribe for Offers (P3) — depends on Foundational

## Parallel Execution Examples

- T012 utilities.css can run in parallel with T013 Header (no conflicting files)
- US1: T022 (fields) can run in parallel with T024 (mailto baseline)
- US3: T042 (tiles/lazy) can run in parallel with T044 (JS enhancement)
- US4: T051 (list baseline) can run in parallel with T053 (backend testimonials)
- US6: T062 (validation) can run in parallel with T064 (POST integration)

## Implementation Strategy

- MVP: Deliver US1 (Request a Quote) end-to-end with no-JS baseline and enhanced submission, plus Header/Hero/Footer from Foundational.
- Then US2 (Product Sections) for routing clarity.
- Then US3/US4 (gallery/testimonials) to boost trust.
- Finally US5/US6 for FAQ and newsletter capture.

## Independent Test Criteria per Story

- US1: Submit form with required fields → inline success; invalid fields → inline errors; keyboard/focus OK.
- US2: Both sections visible with correct flow; CTAs and links keyboard-operable.
- US3: Drag/swipe moves gallery; keyboard focus cycles tiles; reduced motion respected.
- US4: Testimonials navigate via controls; hero trust minis visible.
- US5: FAQ items expand/collapse with keyboard; screen reader announcement.
- US6: Email validation; single opt-in inline success; policy links present.
