# Tasks: Static Marketing Site & Configurator for Garden Rooms

**Input**: Design documents from `/specs/001-static-web-leads/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Initialize Git branch protections and CI placeholders
- [x] T002 Create frontend project structure per plan in frontend/
- [x] T003 Create backend project structure per plan in backend/
- [x] T004 Add base README sections referencing quickstart.md
- [x] T005 Configure .editorconfig and basic linting rules for JS/CSS/MD
- [x] T006 Add LICENSE and CONTRIBUTING basics

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T007 Configure Vite in frontend/ (vanilla template, minimal plugins)
- [x] T008 Add global styles and critical CSS scaffolding in frontend/src/styles/
- [x] T009 [P] Implement price calculation utility scaffold in frontend/src/lib/price.ts
- [x] T010 Implement analytics dispatcher wrapper in frontend/src/analytics/events.ts
- [x] T011 Set up Express app in backend/src/api/server.ts with secure headers
- [x] T012 Implement Mongo connection module in backend/src/db/mongo.ts
- [x] T013-1 [P] Define repositories skeletons in backend/src/db/repos/quotes.ts
- [x] T013-2 [P] Define repositories skeletons in backend/src/db/repos/assets.ts,content.ts
- [x] T013-3 [P] Define repositories skeletons in backend/src/db/repos/content.ts
- [x] T014 Add validation schemas (zod) in backend/src/services/validation.ts
- [x] T015 Configure mailer service (SMTP) in backend/src/services/mailer.ts
- [x] T016 Add security middleware (CSP, rate limit) in backend/src/security/security.ts
- [x] T017 Add .env.example and dotenv loading in backend
- [x] T018 Add Playwright setup for e2e tests in frontend/tests/e2e/
- [x] T019 Add axe-core a11y test helper in frontend/tests/
- [x] T067 Provide no-JS fallback contact form at frontend/public/contact.html posting to backend/src/api/contact.ts (server-rendered success)
- [x] T068 Provide no-JS minimal quote form at frontend/public/quote.html posting to backend/src/api/quotes.ts (captures essentials; server-rendered confirmation)
- [x] T069-1 [P] Add server-rendered success templates for contact/quote in backend/src/api/views/contact-success.html
- [x] T069-2 [P] Add server-rendered success templates for contact/quote in backend/src/api/views/quote-success.html
- [x] T070 Enforce county/Eircode constraints (Dublin, Wicklow, Kildare) in backend/src/services/validation.ts with clear error messages

## Phase 3: User Story 1 (P1) – Configure and Get Instant Estimate
Goal: Guided configurator with live estimate (VAT toggle) and quote submission
Independent Test: Start configurator → select options → see estimate → submit quote → get confirmation

- [ ] T020 [US1] Create configurator page shell in frontend/src/pages/products/configurator.html
- [ ] T021 [P] [US1] Build step components (size, openings, cladding, bathroom, floor, extras) in frontend/src/components/configurator/
- [ ] T022 [US1] Implement progress bar UI in frontend/src/components/progress.ts
- [ ] T023 [US1] Wire price calc and VAT toggle in frontend/src/lib/price.ts and components
- [ ] T024 [US1] Build summary view before submission in frontend/src/components/configurator/summary.ts
- [ ] T025 [US1] Implement quote form (name, email, phone, address, eircode, timeframe) in frontend/src/components/configurator/quote-form.ts
- [ ] T026 [US1] Implement POST /quotes client in frontend/src/lib/api.ts
- [ ] T027 [US1] Backend: implement POST /quotes in backend/src/api/quotes.ts
- [ ] T028 [US1] Backend: generate quoteNumber and persist QuoteRequest in backend/src/db/repos/quotes.ts
- [ ] T029 [US1] Backend: send confirmation emails (user + internal) in backend/src/services/mailer.ts
- [ ] T030 [US1] Show on-screen confirmation with human-readable summary in frontend/src/components/configurator/confirmation.ts
- [ ] T031 [US1] Implement “Email Design” (send config snapshot) in frontend/src/components/configurator/email-design.ts

- [ ] T099 [P][US1] Write tests first: create E2E happy path for configurator and unit tests for price util in frontend/tests/e2e/us1-configurator.spec.ts and frontend/tests/unit/price.spec.ts

- [ ] T072 [US1] Persist configuration to sessionStorage and restore on return with resume prompt in frontend/src/components/configurator/state.ts
- [ ] T073 [US1] Implement option tooltips and image previews with accessible labels in frontend/src/components/configurator/ui-helpers.ts
- [ ] T074 [US1] Implement gated price breakdown: short form capture then reveal breakdown; include in emails (frontend/src/components/configurator/breakdown.ts; backend/src/services/mailer.ts)
- [ ] T075 [US1] Client-side enforce county/Eircode constraints on quote form with inline messaging in frontend/src/components/configurator/quote-form.ts

## Phase 4: User Story 2 (P2) – Discover via SEO Landing Pages
Goal: Use case pages funnel to configurator with context
Independent Test: Land on use case page → understand value → one-click to configurator (preselect template)
- [ ] T100 [P][US2] Write tests first: E2E test for use-case → configurator with preserved context in frontend/tests/e2e/us2-use-cases.spec.ts
- [ ] T032-1 [US2] Create use case landing pages in frontend/src/pages/use cases/home-office.html
- [ ] T032-2 [US2] Create use case landing pages in frontend/src/pages/use cases/studio.html
- [ ] T032-3 [US2] Create use case landing pages in frontend/src/pages/use cases/rental.html
- [ ] T033 [US2] Add credible content blocks and CTAs in frontend/src/components/use cases/
- [ ] T034 [US2] Preselect configurator templates via URL params in frontend/src/pages/products/configurator.html

## Phase 5: User Story 8 (P2) – Product Pages Layout & Conversion Flow
Goal: Consistent product pages (Garden Room, House Extension, House Build) driving users to configure or contact
Independent Test: From any product page, hero CTA scrolls to configuration; about section (carousel + inclusions + gallery CTA) works; example gallery supports drag + hover/tap enlarge; testimonials present; user can configure or contact

- [ ] T106 [US8] Create Garden Room product page shell in frontend/src/pages/products/garden-room/index.html
- [ ] T107 [US8] Create House Extension product page shell in frontend/src/pages/products/house-extension/index.html
- [ ] T108 [US8] Create House Build product page shell in frontend/src/pages/products/house-build/index.html

- [ ] T109 [P] [US8] Implement shared product hero with CTA scroll to #configuration in frontend/src/components/product/hero.ts
- [ ] T110 [P] [US8] Implement "About our [product]" section with sliding carousel and inclusions list in frontend/src/components/product/about.ts
- [ ] T111 [US8] Wire "View gallery" CTA to filter gallery by product via query (e.g., ?category=garden-rooms) in frontend/src/pages/gallery/index.html
- [ ] T112 [US8] Add configuration section anchor (#configuration) and start configurator hook on each product page in frontend/src/pages/products/*/index.html
- [ ] T113 [US8] Add CTA "Don't have time for this — Contact us" linking to /contact in frontend/src/pages/products/*/index.html

- [ ] T114 [P] [US8] Implement example gallery: horizontal drag-scroll masonry in frontend/src/components/product/example-gallery.ts
- [ ] T115 [P] [US8] Add hover (desktop) / tap (mobile) smooth enlargement without layout shift in frontend/src/components/product/example-gallery.ts
- [ ] T116 [US8] Ensure keyboard operability (focusable items, arrow-key navigation, visible focus) in frontend/src/components/product/example-gallery.ts
- [ ] T117 [US8] Provide no-JS fallback (static grid with next/prev) and ensure hero CTA anchor works without JS in frontend/src/pages/products/*/index.html

- [ ] T118 [US8] Add testimonials section component with attribution and onward CTA in frontend/src/components/product/testimonials.ts

- [ ] T119 [P] [US8] E2E: hero scroll, gallery drag, contact CTA in frontend/tests/e2e/us8-product-pages.spec.ts
- [ ] T120 [P] [US8] A11y: keyboard navigation and focus visibility for example gallery in frontend/tests/a11y/us8-gallery.spec.ts
- [ ] T121 [P] [US8] Performance budget checks (Lighthouse) for 3 product pages in tests/perf/lh-product-pages.yml

## Phase 6: User Story 3 (P3) – Galleries & Testimonials
Goal: Trust-building galleries and testimonials with overlay CTA
Independent Test: Browse gallery → open overlay → submit interest with job reference

- [ ] T035 [US3] Create gallery page in frontend/src/pages/gallery/index.html
- [ ] T036 [US3] Implement category tabs (garden-rooms, house-extensions, house-builds) in frontend/src/components/gallery/tabs.ts
- [ ] T037 [US3] Implement image grid with lazy loading in frontend/src/components/gallery/grid.ts
- [ ] T038 [US3] Implement overlay viewer and CTA form in frontend/src/components/gallery/overlay.ts
- [ ] T039 [US3] Backend: route to accept gallery CTA interest in backend/src/api/contact.ts (reuse /contact)

- [ ] T101 [P][US3] Write tests first: E2E test for gallery overlay and CTA submission including job reference in frontend/tests/e2e/us3-gallery.spec.ts

## Phase 7: User Story 4 (P2) – Admin Manages Content & Quotes
Goal: Basic admin dashboard for metadata edits and quote management
Independent Test: Upload/edit assets, edit testimonials, view quotes with IDs, generate final quote receipt

- [ ] T040 [US4] Create admin dashboard shell in frontend/src/pages/admin/index.html
- [ ] T041 [US4] Implement assets table editor in frontend/src/components/admin/assets-table.ts
- [ ] T042 [US4] Implement testimonials editor in frontend/src/components/admin/testimonials-table.ts
- [ ] T043 [US4] Implement quotes table with retention info in frontend/src/components/admin/quotes-table.ts
- [ ] T044 [US4] Backend: GET /admin/assets and POST/PUT for assets in backend/src/api/admin-assets.ts
- [ ] T045 [US4] Backend: GET/PUT /admin/testimonials in backend/src/api/testimonials.ts
- [ ] T046 [US4] Backend: GET/PUT /admin/quotes (retention window, status) in backend/src/api/admin-quotes.ts
- [ ] T047 [US4] Backend: server-side quote receipt generator in backend/src/services/receipt.ts

- [ ] T102 [P][US4] Write tests first: E2E test for admin auth + protected routes in frontend/tests/e2e/us4-admin.spec.ts and backend integration tests in backend/tests/integration/auth.spec.ts

- [ ] T077 [US4] Implement admin authentication (login/logout): frontend/src/pages/admin/login.html; backend/src/api/auth.ts
- [ ] T078 [US4] Implement password hashing and session/token strategy with secure cookies in backend/src/security/auth.ts
- [ ] T079 [US4] Protect admin routes with authorization middleware in backend/src/security/auth.ts and apply to backend/src/api/* admin routes
- [ ] T080 [US4] Add Products table editor UI in frontend/src/components/admin/products-table.ts and backend/src/api/products.ts (GET/PUT)
- [ ] T081 [US4] Add image upload endpoint with type/size validation in backend/src/api/uploads.ts; wire from assets editor
- [ ] T082 [US4] Generate responsive image variants (WebP/AVIF) and store metadata in Mongo in backend/src/services/images.ts
- [ ] T083 [US4] Update CSP to allow storage domain (if external) and ensure SRI where applicable in backend/src/security/security.ts
- [ ] T084 [US4] Implement scheduled retention cleanup for expired quotes in backend/src/services/retention.ts (node-cron) with config in .env


## Phase 8: User Story 5 (P2) – Prefab Path
Goal: Prefab size selection with allowed options and itemized quote
Independent Test: Select prefab → adjust allowed options → submit → itemized quote

- [ ] T048 [US5] Implement prefab selector control in frontend/src/components/configurator/prefab-selector.ts
- [ ] T049 [US5] Enforce allowed/disallowed options in frontend/src/components/configurator/constraints.ts
- [ ] T050 [US5] Generate itemized quote summary in frontend/src/components/configurator/itemized.ts

- [ ] T103 [P][US5] Write tests first: E2E test for prefab constraints and itemized summary in frontend/tests/e2e/us5-prefab.spec.ts

## Phase 9: User Story 6 (P2) – Homepage & First Impression
Goal: Clear offerings, trust signals, easy navigation
Independent Test: See categories/testimonials/trust signals; one-click nav to key pages

- [ ] T051 [US6] Build homepage in frontend/src/pages/index.html
- [ ] T052 [US6] Implement header with nav in frontend/src/components/header.ts
- [ ] T053 [US6] Implement footer + true footer in frontend/src/components/footer.ts

- [ ] T104 [P][US6] Write tests first: E2E test for homepage navigation and trust signals visibility in frontend/tests/e2e/us6-home.spec.ts

## Phase 10: User Story 7 (P2) – Contact Flow
Goal: Submit contact with confirmation; fast internal delivery
Independent Test: Submit contact → user sees confirmation; internal team receives email promptly

- [ ] T054 [US7] Create contact page in frontend/src/pages/contact/index.html
- [ ] T055 [US7] Implement contact form component in frontend/src/components/contact/form.ts
- [ ] T056 [US7] Implement POST /contact in frontend/src/lib/api.ts and backend/src/api/contact.ts

- [ ] T105 [US7] Write tests first: E2E test for contact submission and confirmation in frontend/tests/e2e/us7-contact.spec.ts

- [ ] T087 [US7] Add hours and bank holiday note to contact page; include location context in frontend/src/pages/contact/index.html
- [ ] T088 [US7] Add privacy-friendly map (static map or no-cookie embed) with fallback in frontend/src/pages/contact/index.html

## Phase 11: Non‑Functional & Cross‑Cutting

- [ ] T057 Production hardening for security headers and CSP in backend/src/security/security.ts (finalize directives; move CSP from report-only to enforce; add CI checks)
- [ ] T058 Configure SRI for third-party assets in frontend/public/
- [ ] T059 Add rate limiting and input validation to all POST endpoints
- [ ] T060 Optimize images and add responsive variants in frontend/public/
- [ ] T061 Inline critical CSS on key pages (home, products) in frontend/src/styles/
- [ ] T062 Add analytics events per spec in frontend/src/analytics/events.ts
- [ ] T063 Add E2E tests for US1, US2, US3 flows in frontend/tests/e2e/
- [ ] T064 Add accessibility checks (axe) for key pages in frontend/tests/
- [ ] T065 Add performance budget checks (Lighthouse CI or equivalent) in CI config
- [ ] T066 Configure email delivery monitoring (bounce/spam) in backend/src/services/mailer.ts

- [ ] T089 Add cookie consent/banner with granular controls in frontend/src/components/cookie-consent.ts
- [ ] T090 Ensure analytics scrubs PII and block-list fields at source in frontend/src/analytics/events.ts (add unit tests in frontend/tests/unit/analytics.spec.ts)
- [ ] T091 Document static hosting + CDN setup for frontend in docs/deploy/frontend-cdn.md (include caching and invalidation)
- [ ] T092 Document API hosting and TLS setup for backend in docs/deploy/backend-api.md (include headers and TLS notes)
- [ ] T093 Add E2E tests with JS disabled for quote/contact flows in frontend/tests/e2e/pe-nojs.spec.ts
- [ ] T094 Assess CSRF applicability; implement CSRF protection if using cookie sessions in backend/src/security/csrf.ts and integrate in forms
- [ ] T095 Create operator runbook for GDPR access/delete handling in docs/operations/gdpr-runbook.md
- [ ] T096 Create FAQ page with hash deep-links in frontend/src/pages/faq/index.html and frontend/src/components/faq.ts

- [ ] T097 Add Permitted Development guidance component and include on configurator and use-case pages in frontend/src/components/guidance/pd-guidance.ts (import into frontend/src/pages/products/configurator.html and frontend/src/pages/use-cases/*)
- [ ] T098 Add newsletter signup component and integrate into footer in frontend/src/components/newsletter-signup.ts and frontend/src/components/footer.ts

## Dependencies (Story Order)
1) US1 → 2) US2 → 3) US8 → 4) US6 → 5) US3 → 6) US7 → 7) US5 → 8) US4

## Parallel Execution Examples
- T021 [US1] step components and T022 [US1] progress bar can proceed in parallel
- T033 [US2] content blocks and T034 [US2] template preselect can proceed in parallel
- T036 [US3] tabs and T037 [US3] grid can proceed in parallel
- Backend routes in US4 (T044–T046) can be implemented in parallel once repos are ready
 - US8: T109 hero and T110 about section can proceed in parallel; T114 example gallery and T118 testimonials can also proceed in parallel

## Implementation Strategy
- Deliver MVP with US1 first (Configurator + Quote). Then funnel pages (US2), Homepage (US6), Trust (US3), Contact (US7). Add Prefab path (US5) and Admin (US4) after MVP.
