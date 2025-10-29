# Data Model: Home Landing Page

Created: 2025-10-29
Branch: 002-home-landing-page
Spec: ../spec.md

## Entities

### ProspectLead
- Description: Lead generated from quote form.
- Fields:
  - id (UUID)
  - firstName (string, required)
  - secondName (string, optional)
  - phone (string, required; E.164 or local with country code)
  - email (string, required; RFC 5322 basic)
  - addressLine1 (string, required)
  - addressLine2 (string, optional)
  - eircode (string, required; pattern: Ireland Eircode regex)
  - note (string, optional)
  - createdAt (datetime)
- Validation:
  - email format; phone digits and optional +country; eircode regex.

### EmailSubscriber
- Description: Newsletter subscriber (single opt-in).
- Fields:
  - id (UUID)
  - email (string, required)
  - consentAt (datetime, required)
  - source (string; e.g., "landing-newsletter")
  - createdAt (datetime)

### Project
- Description: Completed build showcased in gallery.
- Fields:
  - id (UUID)
  - title (string)
  - location (string)
  - images (array<Image>)
  - tags (array<string>)

### Testimonial
- Description: Deep trust quote.
- Fields:
  - id (UUID)
  - quote (string)
  - rating (number 1–5)
  - authorFirstName (string)
  - authorInitial (string)
  - projectArea (string)
  - image (Image)

### Offer
- Description: Product section summary.
- Fields:
  - id (UUID)
  - productName ("Garden Rooms" | "Home Extensions")
  - headline (string)
  - body (string)
  - secondaryHeading (string)
  - secondaryBody (string)
  - image (Image)
  - detailsHref (string)

### FAQEntry
- Fields:
  - id (UUID)
  - question (string)
  - answer (string)
  - order (number)

### Image
- Fields:
  - src (string)
  - alt (string)
  - width (number)
  - height (number)
  - srcset (string)

## Relationships
- Testimonial may reference Project by id (optional).
- Offer is standalone content; links to detailsHref.

## Notes
- Storage is not on the critical path; entities reflect enhanced submission/curation use cases.
