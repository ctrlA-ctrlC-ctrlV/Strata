# Feature Specification: Static Marketing Site & Configurator for Garden Rooms

**Feature Branch**: `001-static-web-leads`  
**Created**: 2025-10-16  
**Status**: Draft  
**Input**: User description: "We’re building a modern static web app for a new construction company in Ireland that designs, manufactures, and installs light gauge steel framed garden rooms. These high-quality, pre-fabricated spaces are ideal for homeowners who need extra living space or are exploring rental income opportunities.

The website will act as a marketing and lead generation tool, showcasing product configurations, use cases (e.g. home office, studio, rental unit), and enabling prospective customers to explore options, estimate costs, and initiate a purchase or quote request, all without friction.

- Primary business objective: Drive high-quality, intent-driven quote requests by maximizing organic (SEO) traffic and optimizing for conversion through intuitive user experience. The site will act as the primary lead generation channel, with social media and word-of-mouth acting as secondary acquisition sources. SEO performance and UX must work together, high traffic is only useful if it converts efficiently.
- Product success metrics: We will track both traffic generation and quote conversion to measure product success:
  - Organic traffic growth: Baseline monthly visits from search (target: 5K → 20K in first 3–6 months)
  - Traffic-to-quote conversion rate: % of visitors who complete a quote request after engaging with the configurator (target TBD)
  - Drop-off analysis: Funnel tracking to identify the most common abandonment points before quote submission
  - Configurator engagement: % of visitors who interact with the room visualizer or product preview.
- Guardrail metrics: To protect the user experience and avoid friction with a potentially less tech-savvy audience:
  - Page load time: fast on desktop and mobile
  - Quote abandonment rate: Track exits during quote flow to flag UX confusion
  - Support signal creep: Monitor for increase in help requests or clarification emails, a sign the flow may be too complex
  - Image/gallery discoverability: Ensure users can easily find and view past builds and product examples; track interaction with these assets.

Core user value: This product simplifies decision-making with guided, no-pressure configurators and transparent pricing; builds trust through real-life project galleries, customer testimonials, and clear, jargon-free copy; saves time by enabling users to explore options, preview designs, and receive a quote — all without needing a sales call or site visit; and reduces planning stress by focusing on permitted development sizes and helping users stay compliant. The overall value is confidence: users feel clear on what they're getting, what it costs, and how to move forward — fast."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Configure and Get Instant Estimate (Priority: P1)

A first‑time visitor explores garden room options (size, layout, finishes, add‑ons) using a guided configurator and sees a running price estimate. They can submit a quote request with their chosen configuration in a single, frictionless flow.

**Why this priority**: This is the primary conversion path and the highest predictor of sales intent; it directly drives qualified quote submissions.

**Independent Test**: A test user can start on the configurator, select options, view an immediate estimate, and submit a quote request without visiting any other pages.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they open the configurator, **Then** they see default options and a clear step‑by‑step flow with an initial estimate.
2. **Given** a partially completed configuration, **When** the visitor changes an option (e.g., size), **Then** the estimate updates immediately and the summary reflects the new choice.
3. **Given** a completed configuration, **When** the visitor proceeds to request a quote, **Then** they can submit contact details and receive a confirmation with a human‑readable summary of selections.
4. **Given** connectivity constraints (slow or intermittent), **When** loading the configurator, **Then** primary content remains usable and the flow degrades gracefully without breaking core actions.
5. **Given** the configurator wizard, **When** a visitor progresses steps, **Then** the current step and overall progress are always visible.
6. **Given** a price estimate is visible, **When** the visitor toggles VAT, **Then** the displayed price updates immediately and clearly indicates the state.
7. **Given** a completed configuration, **When** the visitor chooses to save/email their design, **Then** the configuration summary is sent to the visitor and internal sales.

---

### User Story 2 - Discover via SEO Landing Pages (Priority: P2)

A search visitor lands on a use‑case page (e.g., Home Office, Studio, Rental Unit) with credible content, galleries, and clear CTAs that lead to the configurator.

**Why this priority**: Organic acquisition is the primary traffic channel; high‑intent pages must convert to configurator engagement.

**Independent Test**: A test user starting on a use‑case page can understand value, view examples, and reach the configurator in one click.

**Acceptance Scenarios**:

1. **Given** a use‑case landing page, **When** a visitor scrolls, **Then** they encounter credible content (benefits, sizing guidance, compliance notes) and a prominent “Configure your room” CTA.
2. **Given** a use‑case landing page, **When** a visitor clicks the CTA, **Then** they arrive at the configurator with context preserved (e.g., preselected template for that use case).
3. **Given** a product landing page, **When** the visitor scrolls, **Then** they see a concise description, images, and a prominent CTA to configure or request a quote.

---

### User Story 3 - Build Trust with Galleries & Testimonials (Priority: P3)

A hesitant visitor browses past builds, image galleries, and testimonials to assess quality and credibility, then proceeds to configure or request a quote.

**Why this priority**: Trust signals reduce drop‑off for higher‑ticket purchases and support conversion for less tech‑savvy audiences.

**Independent Test**: A test user can navigate to a gallery, filter or browse examples, read testimonials, and reach the quote path without using the configurator.

**Acceptance Scenarios**:

1. **Given** a gallery page, **When** a visitor filters or browses projects, **Then** they can view high‑quality images, captions, and details for each build.
2. **Given** testimonials, **When** a visitor reviews them, **Then** quotes feel authentic and relevant (location/context provided) and a CTA is available to continue.
3. **Given** a gallery job thumbnail, **When** it is clicked, **Then** an overlay opens with multiple photos, job description, and a “Like this design? Contact us” CTA.
4. **Given** a visitor submits the gallery CTA form, **When** the inquiry is sent, **Then** the job reference is included for the internal team.

---

[Add more user stories as needed, each with an assigned priority]

### User Story 4 - Admin Manages Content and Quotes (Priority: P2)

An internal admin updates product images, website assets, testimonials, and manages quotes through a simple dashboard without technical assistance.

**Why this priority**: Enables rapid content iteration, keeps galleries and testimonials fresh, and supports daily operations for leads and sales.

**Independent Test**: An admin can access a basic dashboard, upload a product image, edit a testimonial, view new quotes with unique IDs, and export/print a quote receipt.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they upload or replace a product image, **Then** the change appears on the public site after save/publish.
2. **Given** a new quote submission, **When** the admin views it, **Then** the system shows a unique quote number, configuration snapshot, and contact details.
3. **Given** a confirmed sale, **When** the admin generates a final quote receipt, **Then** a formatted document (print/email‑ready) includes specifications, VAT, discounts (if any), totals, and customer details.
4. **Given** quote retention rules, **When** a quote expires (e.g., after 60 days), **Then** the system auto‑deletes it according to the configured retention period.

---

### User Story 5 - Prefab Configuration Path (Priority: P2)

A visitor selects a prefabricated room size and customizes allowed options within constraints, then requests a quote.

**Why this priority**: Offers a faster path to value for users who want guidance without full customization.

**Independent Test**: A test user selects a prefab size, adjusts allowed options, and submits a quote with an itemized result.

**Acceptance Scenarios**:

1. **Given** a prefab selection, **When** the visitor customizes options, **Then** disallowed options are clearly indicated and prevented.
2. **Given** a prefab flow, **When** the visitor submits contact details, **Then** an itemized quote is generated and confirmed to the user and internal team.

---

### User Story 6 - Homepage & First Impression (Priority: P2)

On arriving at the homepage, a visitor quickly understands offerings, sees trust signals, and can easily navigate to key flows.

**Why this priority**: Establishes clarity and trust immediately, improving conversion to deeper engagement.

**Independent Test**: A first‑time user can identify product categories, spot testimonials/trust, and navigate to products, gallery, FAQ, or contact.

**Acceptance Scenarios**:

1. **Given** a homepage visit, **When** the page loads, **Then** clear product categories, testimonials, and trust signals are visible above or near the fold.
2. **Given** homepage navigation, **When** the visitor chooses a destination, **Then** they can reach products, gallery, FAQ, or contact in one click from the header.

---

### User Story 7 - Contact Flow (Priority: P2)

A visitor reaches the contact page and submits a message, receiving confirmation while the internal team is notified promptly.

**Why this priority**: Eliminates friction for users who prefer direct outreach.

**Independent Test**: A user can submit required details and receive confirmation; internal inbox receives the inquiry.

**Acceptance Scenarios**:

1. **Given** a visitor on any page, **When** they click Contact, **Then** they reach the contact form with hours and location context.
2. **Given** a completed contact form, **When** it is submitted, **Then** the visitor sees a success confirmation and the team receives the inquiry.

### User Story 4 - Admin Manages Content and Quotes (Priority: P2)

An internal admin updates product images, website assets, testimonials, and manages quotes through a simple dashboard without technical assistance.

**Why this priority**: Enables rapid content iteration, keeps galleries and testimonials fresh, and supports daily operations for leads and sales.

**Independent Test**: An admin can access a basic dashboard, upload a product image, edit a testimonial, view new quotes with unique IDs, and export/print a quote receipt.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they upload or replace a product image, **Then** the change appears on the public site after save/publish.
2. **Given** a new quote submission, **When** the admin views it, **Then** the system shows a unique quote number, configuration snapshot, and contact details.
3. **Given** a confirmed sale, **When** the admin generates a final quote receipt, **Then** a formatted document (print/email‑ready) includes specifications, VAT, discounts (if any), totals, and customer details.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Visitors with JavaScript disabled can still access core content and initiate contact/quote.
- Very slow connections or mobile data: content remains readable; images and enhancements load progressively.
- Configurations that exceed permitted development sizes: the system flags constraints and provides compliant alternatives.
- Incomplete quote forms: users can save progress or recover from validation errors without losing configuration details.
- Out‑of‑service locations or installation constraints: the system clearly communicates limitations and suggests next steps.
- User lands on blog content and later navigates to products; ensure CTAs exist to resume primary conversion paths.
- Visitor prefers phone contact; provide a clear contact option and capture intent for manual follow‑up.
- Visitor only explores gallery and exits; ensure CTAs are discoverable throughout the overlay and detail views.
- Mobile access: layouts remain clear and functional; controls are touch‑friendly; images and interactive elements are accessible with labels.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a guided configurator for garden rooms (sizes, layouts, finishes, add‑ons) with a clear step‑by‑step flow.
- **FR-002**: System MUST display a running price estimate that updates immediately as options change.
- **FR-003**: System MUST present a human‑readable configuration summary before quote submission.
- **FR-004**: System MUST enable a frictionless quote request (minimal fields; contact details + configuration attached) and provide an on‑screen confirmation.
- **FR-005**: System MUST allow visitors to reach the configurator from use‑case pages in one click with context preserved (template preselection where applicable).
- **FR-006**: System MUST provide trust content: galleries (filter/browse), testimonials, and clear explanatory copy.
- **FR-007**: System MUST make primary content accessible and usable on mobile devices, including keyboard accessibility and clear focus states.
- **FR-008**: System MUST enable measurement of key funnel steps: configurator engagement, quote starts, quote submissions, and drop‑off points.
- **FR-009**: System MUST support clear, compliant guidance for permitted development sizes and surface constraints in the UX.
- **FR-010**: System MUST keep the quote flow resilient to interruptions (e.g., accidental navigation away) by preserving configuration state during the session.

- **FR-011**: Header MUST include logo linked to home and global navigation for Home, Products (Garden Room, House Extension, House Build), Gallery, Blog, FAQ, Contact.
- **FR-012**: Footer MUST include location info, contact details, opening hours, social links, nav links, and newsletter signup; a “true footer” MUST include legal links and dynamic year.
- **FR-013**: Product pages MUST include an SEO‑optimized hero section and a “Build your own [product]” configurator wizard with steps: (1) width & depth; (2) front windows/doors; (3) side windows; (4) cladding color; (5) bathroom options (conditional); (6) floor type; (7) extras (with image, title, description, selectable UI); (8) contact form (name, email, phone, address, Eircode, desired install timeframe).
- **FR-014**: Configurator MUST provide image previews, info tooltips, live price display with VAT toggle, and a visible progress bar.
- **FR-015**: Users MUST be able to “Email Design” so that the full configuration summary is sent to the user and to the internal sales inbox.
- **FR-016**: FAQ page MUST present structured questions and answers with easy scanning and deep‑link capability.
- **FR-017**: Contact page MUST provide hours (with bank holiday note), an embedded map or location reference, and a contact form (name, phone, email, address, optional message).
- **FR-018**: Gallery page MUST allow browsing by category (Garden Rooms, House Extensions, House Builds) and job‑based overlays with image carousel, description, and a “Like this design?” CTA that captures interest with a job reference.
- **FR-019**: System MUST generate a unique quote number upon quote submission and allow auto‑deletion of quotes after a fixed period (e.g., 60 days), with retention windows configurable.
- **FR-020**: System MUST allow generation of a final quote receipt upon sale confirmation containing selected specs, totals, VAT, discount amount (if applicable), and customer details in a format suitable for print and email.
- **FR-021**: A basic admin dashboard MUST allow authorized users to upload/update/remove product images and site assets; and to edit Products, Quotes, and Testimonials via simple tables.

Unclear but critical scope decisions (clarifications needed):

- **FR-022**: System MUST reveal pricing as [NEEDS CLARIFICATION: indicative estimates inline vs only after form submission?]
- **FR-023**: System MUST support purchase initiation [NEEDS CLARIFICATION: include deposit/payment now or strictly collect quotes?]
- **FR-024**: System MUST constrain serviceable geography [NEEDS CLARIFICATION: Ireland nationwide vs specific counties/regions?]

### Non‑Functional Requirements

- Performance
  - LCP: < 1.2s desktop; < 1.8s mobile for top landing pages (at P75)
  - TTI: < 2.5s for main content
  - Assets: optimize; lazy‑load images; use modern formats; cache effectively
- Accessibility
  - Target WCAG 2.1 AA; all images have alt text; keyboard navigation for configurator; clear labels
- Reliability
  - Static‑friendly deployment with CDN; uptime target 99.9%; graceful fallback to form configurator if any advanced visuals fail
  - Quote confirmation emails delivered to user and internal inbox promptly (target within 1 minute)
- Security
  - HTTPS enforced; follow strong content isolation; validate and rate‑limit form submissions; manage secrets outside source control; perform dependency checks in CI
- Privacy & Compliance
  - Consent for non‑essential tracking; no PII in analytics; GDPR rights honored (access/delete) via manual process until CRM is integrated

### Post‑MVP: 3D Configurator – Future Acceptance

- **Given** a user opens the 3D visual configurator, **When** they drag and drop elements or change sizes, **Then** the preview updates in real time.
- **And** the live price adjusts accordingly.
- **And** the user can still save and email their configuration with all details preserved.

### Analytics & Instrumentation

- Track page engagement: page views, referrers/channels, scroll depth on long pages
- Track CTA interactions: “Build your own”, “Email me my quote”, “Contact us”, “View Gallery Job”
- Track quote journey: step progression, option changes, use of save/email, abandonment, final submission success/failure (with non‑PII context like product type, VAT toggle state)
- Track gallery exploration: image opens, project views, contact from job reference
- Track content engagement: newsletter signups, blog/article views (when enabled), FAQ open/expand behavior
- Attribute conversions back to source channels; review weekly at launch and monthly post‑stabilization

### Key Entities *(include if feature involves data)*

- **Product Configuration**: User‑selected options (dimensions, layout, finishes, add‑ons); includes pricing breakdown and compliance flags.
- **Quote Request**: Contact details (name, phone, email), location, preferred timeline, configuration snapshot, estimate presented.
- **Use‑Case Page**: Content entity representing a primary intent (Home Office, Studio, Rental Unit) with benefits and relevant presets.
- **Gallery Item**: Past build with images, description, location (regional), tags (size/type), and credibility signals.
- **Testimonial**: Quote, author attribution, context (project type/location), and optional media.
- **Admin Asset**: Site asset (e.g., logo, banners) with metadata for publishing; managed via dashboard.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Objectives & Success Metrics

- Primary business objective: Drive high‑quality, intent‑driven quote requests by maximizing organic (SEO) traffic and optimizing for conversion through intuitive UX. SEO and UX must work together—traffic only matters if it converts.
- Product success metrics to track:
  - Organic traffic growth: 5K → 20K monthly visits in 3–6 months
  - Traffic‑to‑quote conversion rate after configurator engagement (primary success metric)
  - Drop‑off analysis: identify common abandonment points pre‑submission
  - Configurator engagement: % of visitors who interact with the configurator/product preview
- Guardrails:
  - Page performance: LCP < 1.2s desktop, < 1.8s mobile (supports SEO + UX)
  - Quote abandonment, support signal creep, and gallery discoverability interactions monitored

### Measurable Outcomes

- **SC-001**: Organic search traffic grows from ~5,000 to ≥20,000 monthly visits within 6 months of launch.
- **SC-002**: ≥40% of visitors reaching a use‑case page click through to the configurator.
- **SC-003**: ≥3% of total site visitors submit a quote request after engaging with the configurator. (Assumption; see notes.)
- **SC-004**: ≥95% successful completion rate for visitors who start the quote flow (start → submit) with clear confirmation provided.
- **SC-005**: ≥50% of visitors view at least one gallery item; ≥20% proceed to a conversion path (configurator or quote).
- **SC-006**: Primary content becomes readable within ~2 seconds on typical mobile connections for most users (experience‑based measure supporting UX and discovery).
- **SC-007**: Support inquiries related to quote or configurator flow remain under 2% of total quote submissions post‑launch.
- **SC-008**: Guardrails achieved on performance: LCP < 1.2s desktop / < 1.8s mobile (P75) and TTI < 2.5s on top entry pages.
- **SC-009**: Quote and contact emails are delivered within 1 minute for ≥95% of successful submissions in a monitored period.
- **SC-010**: 100% of quote and contact emails are delivered to inbox (not spam) in monitored tests.
- **SC-011**: 0 P1 usability blockers reported in the first 30 days post‑launch (from support/feedback channels).
- **SC-012**: Homepage click‑through to a product or gallery page ≥60% (assumption pending baseline; refine post‑launch).

*Assumptions used for defaults: traffic target set to 20K/month within 6 months; conversion rate target set to 3% pending baseline (primary metric); homepage click‑through target set at 60% pending baseline; geography assumed Ireland‑only unless clarified; payments treated as out of scope unless specified.*

