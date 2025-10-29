# Feature Specification: Home Landing Page

**Feature Branch**: `002-home-landing-page`  
**Created**: 2025-10-29  
**Status**: Draft  
**Input**: User description: "Creating the home page (main landing page) for a garden-room/home-extension company. Single-page IA with: sticky header/nav; hero with headline, subhead, CTA and trust minis; problem→outcome strip; benefit icon grid; two primary offers (Garden Rooms, Home Extensions); draggable masonry projects carousel; deep testimonial slider; process (1–4); mini-FAQ (planning & regs); email capture; global footer; a11y requirements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Request a Quote (Priority: P1)

A prospective homeowner lands on the page, quickly understands the value, taps "Get a Quote", completes a short form, and receives a clear confirmation.

**Why this priority**: This is the primary conversion goal for the business (lead generation) and should be seamless and fast.

**Independent Test**: Start on the landing page, click the primary CTA, complete the form with valid details, submit, and observe success confirmation without leaving the site.

**Acceptance Scenarios**:

1. Given the landing page loads, When the user activates "Get a Quote", Then the page scrolls to the quote form with focus placed on the first field.
2. Given all required fields are valid, When the user submits the form, Then the user sees an inline success message and receives guidance on next steps.
3. Given required fields are missing or invalid, When the user attempts to submit, Then the form shows accessible error messages next to the relevant fields.

---

### User Story 2 - Explore Product Sections (Priority: P1)

Visitors review the dedicated Garden Rooms and Home Extensions sections (2-column layout), absorb the story and details, and use CTAs to proceed.

**Why this priority**: Clarifies product-market fit and routes users to the most relevant path, improving conversion quality.

**Independent Test**: From the landing page, navigate to each dedicated section and validate layout, content flow, and CTA behavior.

**Acceptance Scenarios**:

1. Given the Garden Rooms section is visible, When the user scans the right-column content, Then they see the section label, headline, body copy, primary "Get a Free Quote" CTA, secondary heading, supporting paragraph, and an underlined "For more details" link.
2. Given the Home Extensions section is visible, When the user scans the right-column content, Then they see the same structured elements as above with relevant copy.
3. Given the user selects the "For more details" link in either section, When activated, Then they navigate to the defined product details destination.

---

### User Story 3 - Explore Projects Gallery (Priority: P2)

Users browse a horizontal draggable masonry gallery of completed projects with variable-height tiles (drag on desktop, swipe on mobile).

**Why this priority**: Visual proof builds trust and accelerates decision-making.

**Independent Test**: Interact with the gallery using mouse drag on desktop and touch swipe on mobile; verify keyboard accessibility and reduced-motion respect.

**Acceptance Scenarios**:

1. Given a desktop viewport, When the user click-drags the gallery horizontally, Then the gallery scrolls smoothly and stops within bounds.
2. Given a mobile viewport, When the user swipes the gallery, Then tiles move horizontally with inertial scrolling and visible focus indication when using keyboard.
3. Given prefers-reduced-motion is enabled, When the user interacts with the gallery, Then animations are minimized without breaking usability.

---

### User Story 4 - Build Trust (Priority: P2)

Users review social proof (star rating, warranties, project counts), read testimonials, and feel comfortable engaging.

**Why this priority**: Trust signals reduce friction and increase form completion.

**Independent Test**: Validate presence and clarity of trust minis in hero and a testimonial slider with names, star ratings, and project context.

**Acceptance Scenarios**:

1. Given the hero is visible, When users scan trust minis, Then they can identify warranty length, rating, projects completed, and planning handling at a glance.
2. Given the testimonial slider is on screen, When advancing to the next testimonial, Then the user sees the quote, rating, first name + initial, and project area with accessible controls.

---

### User Story 5 - Self-Serve Answers (Priority: P3)

Visitors open accordion items in the "Planning & regs" mini-FAQ to understand the top 3 questions.

**Why this priority**: Reduces sales friction and support requests.

**Independent Test**: Expand/collapse each FAQ item via pointer and keyboard; verify only one is required to be open at a time (or multiple, see requirement) and screen reader announcements are correct.

**Acceptance Scenarios**:

1. Given FAQ items are collapsed, When the user opens an item, Then the content is revealed and announced to assistive tech; focus order remains logical.
2. Given one FAQ item is open, When the user opens another, Then both may remain open or previous closes based on defined behavior (documented in Requirements).

---

### User Story 6 - Subscribe for Offers (Priority: P3)

Visitors provide their email address to receive offers/blog updates and get a clear confirmation.

**Why this priority**: Builds a nurture pipeline for leads not ready to convert.

**Independent Test**: Enter a valid email, submit, and observe a confirmation state; verify consent language and opt-in behavior.

**Acceptance Scenarios**:

1. Given the email field is empty, When the user submits, Then an inline error explains what's needed.
2. Given a valid email, When the user submits, Then the user sees a success confirmation and consent statement is recorded. Single opt-in for subscriptions with message "I have read and accept the <u>Terms of Service</u> & <u>Privacy Policy</u>". Where "Terms of Service" and "Privacy Policy" acts as button link to the respective page.

### Edge Cases

- Slow network or low-end devices: ensure hero text and primary CTA are readable quickly; images can lazy-load without blocking content.
- No-JS or script errors: critical navigation and form submission provide graceful fallbacks and clear feedback.
- Accessibility: visible focus states, logical headings, alt text for informative images, decorative icons hidden from AT; ARIA patterns for carousel and accordion.
- Form validation: invalid email/phone/postcode shows concise, accessible errors; privacy consent must be explicit.
- Reduced motion: animations are minimized when the user prefers reduced motion; galleries remain usable.
- Content fallbacks: if gallery images fail to load, tiles show graceful placeholders without layout shift.

## Requirements *(mandatory)*

### Functional Requirements

Header & Navigation
- **FR-001**: Provide a sticky global header containing logo (left), nav items (Garden Rooms, Home Extensions, Portfolio, FAQ, About, Contact), and an emphasized "Contact" action (right).
- **FR-002**: Include a contrasting "Get a Quote" button in the header that scrolls to the on-page quote form.
- **FR-003**: Header must remain readable with 4.5:1 contrast, have visible focus states, and collapse appropriately on smaller screens.

Hero (fold)
- **FR-004**: Display a benefit-led H1 headline and supporting subhead; allow placeholder copy initially.
- **FR-005**: Show a primary CTA "Get a Quote" that scrolls to the form section.
- **FR-006**: Present four trust minis: star rating, projects completed, warranty term, and "planning handled" indicator.
- **FR-007**: Support a background image from a completed project while maintaining text legibility.

Problem → Outcome strip
- **FR-008**: Present three paired bullets mapping problems (No spare room, Rising costs, Disruption fears) to outcomes (Dedicated space, Adds value, Install on site).

Feature/Benefit Grid
- **FR-009**: Show an icon grid of at least six benefits: Warm & energy-efficient, Planning handled, Concrete foundations, Fast build, Premium finishes, Aftercare; each ≤20 words.
- **FR-010**: Icons are decorative unless conveying information; ensure accessible names if informative.

Dedicated Product Sections (Garden Rooms & Home Extensions)
- **FR-011**: Provide two dedicated sections: Garden Rooms and Home Extensions. Each section uses a 2-column layout with a full-height image on the left (~50% width) and a right column constrained to ~540–600px for readable text.
- **FR-012**: In each section's right column, include this vertical flow: (a) Section label (uppercase product_name, small caps, neutral tone), (b) prominent H2/H3 headline, (c) concise brand-story paragraph, (d) primary CTA button labeled "Get a Free Quote", (e) a secondary heading, (f) a supporting paragraph focusing on design/materials/expertise, (g) a secondary underlined link labeled "For more details" that navigates to the product details destination.

Projects Carousel (Horizontal Draggable Masonry)
- **FR-013**: Implement a fixed-height, variable-tile-height horizontal gallery that supports mouse drag on desktop and swipe on touch devices.
- **FR-014**: Provide keyboard-accessible controls to advance/reverse and a non-motion fallback for reduced motion settings.

Deep Trust Module (Testimonials)
- **FR-015**: Include a testimonial slider showing full quote, star rating, first name + surname initial, project photo, and project area.
- **FR-016**: Provide accessible next/previous controls and ensure the slide change is announced to assistive tech.

Process (1–2–3–4)
- **FR-017**: Display four stages: Survey → Design & quote → Build → Handover & warranty with concise descriptions.
- **FR-018**: Present reassurance on response SLAs and no-spam commitment; include consent + GDPR note near the quote form.

Planning & Regs (Mini-FAQ)
- **FR-019**: Provide an accordion with top 3 FAQs; support pointer, touch, and keyboard interaction with proper ARIA semantics.
- **FR-020**: Define whether multiple items can be open simultaneously and ensure state is preserved on focus changes.

Email Capture
- **FR-021**: Provide an email-only capture form with a clear value proposition and privacy notice, including a visible link to the privacy and data policy.
- **FR-022**: Use single opt-in: upon valid submission, display an inline success confirmation and record consent; no additional confirmation step required.

Quote Form
- **FR-023**: Include a short quote form reachable via CTA with the following fields and validation:
	- Required: First name, Phone number, Email, Address line 1, Eircode.
	- Optional: Second name, Address line 2, Note.
	- Validation: email must be in valid format; phone must contain digits and allow country code; Eircode must match standard Irish format; show field-level errors and aria-describedby associations.
- **FR-024**: On successful submission, show confirmation and next steps; on failure, present clear, actionable errors without data loss.

Footer
- **FR-025**: Show NAP (name, address, phone), email, quick links, social links, accreditations, and copyright.

Global Accessibility & Quality
- **FR-026**: All interactive elements have visible focus states; headings are logical; contrast meets 4.5:1 for text.
- **FR-027**: Respect prefers-reduced-motion; provide alt text and ARIA where appropriate for carousels/accordions.
- **FR-028**: Forms have labels, inline error text, and accessible success states; consent text is explicit and unambiguous.

Scope Boundaries (Non-Goals)
- This feature does not include building the full Garden Rooms or Home Extensions detail pages (only navigation to them).
- This feature does not include backend CRM or email provider integration specifics; only defines required user-facing behaviors and outcomes.
- This feature does not include multilingual support or localization.

### Key Entities *(include if feature involves data)*

- **Prospect Lead**: A person submitting the quote form; key attributes include contact details and high-level project info (without dictating storage technology).
- **Email Subscriber**: A person opting into updates/offers; key attribute is email address and consent status.
- **Project**: A previously completed build showcased in the gallery; attributes include images, title/location, and tags.
- **Testimonial**: A customer quote with rating, attribution (first name + initial), related project area, and photo.
- **Offer**: Summarized product category (Garden Rooms or Home Extensions) with attributes such as sizes/uses or timelines, plus CTA destination.
- **FAQ Entry**: A question-and-answer pair displayed in the mini-FAQ.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of visitors can reach and view the hero headline and primary CTA within 2 seconds of page load on a standard mobile connection.
- **SC-002**: At least 90% of valid quote submissions complete successfully on the first attempt within 1 minute from starting the form.
- **SC-003**: At least 80% of gallery interactions (drag/swipe) result in visible scroll within 100 ms of input, as reported by user-observable responsiveness surveys or testing sessions.
- **SC-004**: 100% of interactive elements are keyboard-operable and have visible focus states verified via accessibility testing.
- **SC-005**: Newsletter email capture achieves a minimum 2% submission rate among unique visitors to that section over a baseline period, with clear consent messaging.
- **SC-006**: Bounce rate from the hero to the quote form is reduced by 20% compared to baseline landing content after deployment of this page.

## Assumptions

- Placeholder copy will be provided or approved during design sign-off; final copy swaps will not change structure.
- Pricing displayed as "starting from" is indicative and can be updated by content editors without structural changes.
- There are existing or forthcoming detail destinations for Garden Rooms and Home Extensions (either dedicated pages or well-defined intra-page sections).
- Testimonial quotes, ratings, and project photos are available and approved for public use.
- A published privacy & data policy exists and is linked from forms; GDPR consent language will be reviewed by the business.
- Newsletter uses single opt-in, and consent capture/logging aligns with business policy and applicable regulations.

