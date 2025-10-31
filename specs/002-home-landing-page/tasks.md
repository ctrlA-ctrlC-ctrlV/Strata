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

- [X] T079 Create Phase 1 smoke tests scaffold in frontend/tests/e2e/setup.smoke.spec.ts

- [X] T001 Configure Tailwind (Tailwind V4.0) project files in frontend/tailwind.config.cjs
- [X] T002 Add Tailwind base stylesheet in frontend/src/styles/tailwind.css
- [X] T003 Wire Tailwind into Vite entry in frontend/src/main.tsx
- [X] T004 Add Bootstrap (Bootstrap V5.3.8) Reboot (self-hosted) to frontend/public/css/bootstrap-reboot.min.css
- [X] T005 Include CSS links (Tailwind build + Bootstrap Reboot) in frontend/index.html
- [X] T006 Create images directory structure in frontend/public/images/{hero,gallery,projects,testimonials,logos}
- [X] T007 Add CSP meta tag (tight baseline) in frontend/index.html (document-only; real enforcement via server/CDN)
- [X] T078 Create deployment security headers config (Nginx/hosting) with HSTS, CSP, SRI, and secure headers in docs/deployment-static-security-headers.md
- [X] T008 Add accessibility tooling hooks (axe in Playwright) in frontend/tests/helpers/axe.ts
- [X] T009 Prepare Lighthouse config for CI (doc stub) in docs/production-health-automation.md
- [X] T010 Add privacy & terms links placeholders in frontend/index.html

- [X] T080 Run Phase 1 tests (smoke, lint, typecheck)

## Phase 2 — Foundational

- [X] T081 Create Phase 2 foundational tests scaffold in frontend/tests/e2e/foundational.spec.ts

- [X] T011 Create base layout container and grid utilities in frontend/src/styles/layout.css
- [X] T012 [P] Add utility classes for scroll-snap and reduced-motion in frontend/src/styles/utilities.css
- [X] T013 Implement Sticky Header shell in frontend/src/components/Header.tsx
- [X] T014 [P] Implement Footer shell with NAP/socials in frontend/src/components/Footer.tsx
- [X] T015 Implement Hero shell (H1, sub, CTA, trust minis) in frontend/src/components/Hero.tsx
- [X] T016 [P] Wire page composition in frontend/src/pages/home.tsx (assemble sections)
- [X] T017 Add anchor target for "Get a Quote" (#quote) in frontend/index.html
- [X] T018 [P] Add semantics and skip-to-content link in frontend/index.html
- [X] T019 Create BenefitsGrid base with 6 items in frontend/src/components/BenefitsGrid.tsx
- [X] T020 [P] Add Problem→Outcome strip component in frontend/src/components/ProblemOutcome.tsx

- [X] T103 Add hero text-on-image contrast check tests in frontend/tests/e2e/hero-contrast.spec.ts
- [X] T104 A11y verify icon semantics (aria-hidden or labels) for BenefitsGrid and trust minis in frontend/tests/e2e/icons-a11y.spec.ts

- [X] T082 Run Phase 2 tests (foundational, a11y)

## Phase 3 — User Story 1 (P1): Request a Quote

- [X] T083 [US1] Author failing tests first for quote form (validation, success, a11y) in frontend/tests/e2e/quote-form.spec.ts and frontend/tests/e2e/quote-form-a11y.spec.ts

- [X] T021 [US1] Create QuoteForm component shell in frontend/src/components/QuoteForm.tsx
- [X] T022 [P] [US1] Add required fields (First name, Phone, Email, Address line 1, Eircode) and optional fields in frontend/src/components/QuoteForm.tsx
- [X] T023 [US1] Implement client-side validation rules and aria-describedby in frontend/src/components/QuoteForm.tsx
- [X] T024 [P] [US1] Add no-JS baseline (form action=mailto:… with subject/body template) in frontend/src/components/QuoteForm.tsx
- [X] T025 [US1] Add JS-enhanced submit with inline success/failure to backend POST /api/quote-leads in frontend/src/components/QuoteForm.tsx
- [X] T026 [P] [US1] Ensure header CTA scrolls to form and focuses first field in frontend/src/components/Header.tsx
- [X] T027 [US1] Implement success state message block and next steps UI in frontend/src/components/QuoteForm.tsx
- [X] T028 [US1] Add keyboard navigation and visible focus styles in frontend/src/components/QuoteForm.tsx
- [X] T084 [US1] Add optional newsletter opt-in checkbox to QuoteForm in frontend/src/components/QuoteForm.tsx
- [X] T085 [US1] Add “I have read Terms of Service & Privacy Policy” notice with links in frontend/src/components/QuoteForm.tsx
- [X] T029 [P] [US1] Backend: scaffold POST /api/quote-leads per contracts in backend/src/api/quotes.ts
- [X] T030 [US1] Backend: basic validation and 201 response shape in backend/src/api/quotes.ts
- [X] T031 [US1] Playwright: form validation and success flow test in frontend/tests/e2e/quote-form.spec.ts
- [X] T032 [P] [US1] Axe: a11y checks for form labels/errors in frontend/tests/e2e/quote-form-a11y.spec.ts
- [X] T086 [US1] Run Phase 3 (US1) tests

## Phase 4 — User Story 2 (P1): Explore Product Sections

- [X] T087 [US2] Author failing tests first for product sections (a11y, tab order, links) in frontend/tests/e2e/product-sections-a11y.spec.ts

- [X] T033 [US2] Create Garden Rooms section (2-col layout) with image left in frontend/src/components/ProductSectionGardenRooms.tsx
- [X] T034 [P] [US2] Add right-column content flow (label, H2/H3, brand paragraph, primary CTA) in frontend/src/components/ProductSectionGardenRooms.tsx
- [X] T035 [US2] Add secondary heading, supporting paragraph, underlined "For more details" link in frontend/src/components/ProductSectionGardenRooms.tsx
- [X] T036 [P] [US2] Create Home Extensions section (2-col layout) in frontend/src/components/ProductSectionHomeExtensions.tsx
- [X] T037 [US2] Mirror right-column flow for Home Extensions in frontend/src/components/ProductSectionHomeExtensions.tsx
- [X] T038 [US2] Define details link destinations (temporary anchors or dedicated pages) in frontend/index.html
- [X] T039 [P] [US2] Ensure 4.5:1 contrast and readable line-lengths in frontend/src/styles/product-sections.css
- [X] T040 [US2] Keyboard/tab order tests for CTAs and links in frontend/tests/e2e/product-sections-a11y.spec.ts

- [X] T088 [US2] Run Phase 4 (US2) tests

## Phase 5 — User Story 3 (P2): Explore Projects Gallery

- [X] T089 [US3] Author failing tests first for gallery (drag/swipe, a11y) in frontend/tests/e2e/gallery.spec.ts and frontend/tests/e2e/gallery-a11y.spec.ts

- [X] T041 [US3] Create Gallery container with fixed height and scroll-snap in frontend/src/components/Gallery.tsx
- [X] T042 [P] [US3] Implement variable-height tiles and lazy-loading images in frontend/src/components/Gallery.tsx
- [X] T043 [US3] Add keyboard focusable tiles and outline styles in frontend/src/components/Gallery.tsx
- [X] T044 [P] [US3] JS enhancement: drag-to-scroll and next/prev controls in frontend/src/components/Gallery.tsx
- [X] T045 [US3] Respect prefers-reduced-motion and disable inertia in frontend/src/components/Gallery.tsx
- [X] T046 [P] [US3] Backend: GET /api/projects (optional enhancement) in backend/src/api/projects.ts
- [X] T047 [US3] Wire gallery to static images first; then optional fetch path in frontend/src/components/Gallery.tsx
- [X] T090 [US3] Implement and test graceful image placeholders for failed loads in frontend/src/components/Gallery.tsx and frontend/tests/e2e/gallery-placeholders.spec.ts
- [X] T048 [US3] Playwright: desktop drag and mobile swipe interaction tests in frontend/tests/e2e/gallery.spec.ts
- [X] T049 [P] [US3] Axe: a11y checks for gallery controls and focus in frontend/tests/e2e/gallery-a11y.spec.ts

- [X] T091 [US3] Run Phase 5 (US3) tests

## Phase 6 — User Story 4 (P2): Build Trust

- [X] T092 [US4] Author failing tests first for testimonials and trust minis in frontend/tests/e2e/testimonial-a11y.spec.ts and frontend/tests/e2e/hero-visual.spec.ts

- [X] T050 [US4] Add trust minis (rating, projects, warranty, planning) to Hero in frontend/src/components/Hero.tsx
- [X] T051 [P] [US4] Create Testimonial list baseline in frontend/src/components/Testimonial.tsx
- [X] T052 [US4] JS enhancement: next/prev and announcement to SR in frontend/src/components/Testimonial.tsx
- [X] T053 [P] [US4] Backend: GET /api/testimonials (optional enhancement) in backend/src/api/testimonials.ts
- [X] T054 [US4] A11y test: testimonial controls operable via keyboard in frontend/tests/e2e/testimonial-a11y.spec.ts
- [X] T055 [US4] Visual test: hero trust minis visible and readable in frontend/tests/e2e/hero-visual.spec.ts

- [X] T093 [US4] Run Phase 6 (US4) tests

## Phase 7 — Process (User Story Neutral)

- [X] T094 Create failing tests first for Process steps (1–4) in frontend/tests/e2e/process.spec.ts
- [X] T095 Implement Process component with four stages and concise copy in frontend/src/components/Process.tsx
- [X] T096 Ensure a11y and keyboard navigation for Process in frontend/src/components/Process.tsx
- [X] T097 Integrate Process component into page flow in frontend/src/pages/home.tsx
- [X] T098 Run Phase 7 (Process) tests

## Phase 8 — User Story 5 (P3): Self-Serve Answers (Mini-FAQ)

- [X] T099 [US5] Author failing tests first for FAQ expand/collapse and SR announcements in frontend/tests/e2e/faq-a11y.spec.ts

- [X] T056 [US5] Implement FAQ using <details><summary> baseline in frontend/src/components/FAQ.tsx
- [X] T057 [P] [US5] Style summary focus/hover and expanded states in frontend/src/styles/faq.css
- [X] T058 [US5] Ensure multiple items can be open; update behavior in frontend/src/components/FAQ.tsx
- [X] T059 [P] [US5] Add keyboard navigation tests for FAQ in frontend/tests/e2e/faq-a11y.spec.ts
- [X] T060 [US5] Content placeholders for top 3 planning/regs questions in frontend/src/components/FAQ.tsx

- [X] T100 [US5] Run Phase 8 (US5) tests

## Phase 9 — User Story 6 (P3): Subscribe for Offers (Newsletter)

- [X] T101 [US6] Author failing tests first for newsletter (validation, links) in frontend/tests/e2e/newsletter-a11y.spec.ts

- [X] T061 [US6] Create Newsletter form with email field and policy link in frontend/src/components/Newsletter.tsx
- [X] T062 [P] [US6] Add client-side validation and inline error in frontend/src/components/Newsletter.tsx
- [X] T063 [US6] Single opt-in inline success state in frontend/src/components/Newsletter.tsx
- [X] T064 [P] [US6] JS enhancement: POST /api/newsletter-subscriptions in frontend/src/components/Newsletter.tsx
- [X] T065 [US6] No-JS baseline behavior (fallback note and contact email) in frontend/src/components/Newsletter.tsx
- [X] T066 [P] [US6] Backend: scaffold POST /api/newsletter-subscriptions in backend/src/api/newsletter.ts
- [X] T067 [US6] A11y test: form label, error text, focus order in frontend/tests/e2e/newsletter-a11y.spec.ts

- [X] T102 [US6] Run Phase 9 (US6) tests

## Final Phase — Polish & Cross-Cutting

- [ ] T068 Optimize responsive images with <picture> and srcset in frontend/index.html and assets
- [ ] T069 [P] Inline critical CSS for hero/header in frontend/index.html
- [ ] T070 Add sitemap and SEO metas (title/desc/og) in frontend/index.html
- [ ] T071 [P] Lighthouse audits: Perf/A11y/Best Practices ≥ 90; SEO = 100 in frontend/tests/e2e/lighthouse.spec.ts
- [ ] T072 Add visible skip links and verify headings order in frontend/index.html
- [ ] T073 [P] Ensure all interactive elements have visible focus styles across components in frontend/src/styles/accessibility.css
- [ ] T074 Verify prefers-reduced-motion across gallery/testimonial in frontend/src/components/{Gallery,Testimonial}.tsx
- [ ] T075 [P] Document deployment caching and immutable assets in docs/deployment-static-site.md
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
