# Quickstart: Home Landing Page

Created: 2025-10-29
Branch: 002-home-landing-page

## Goals
- Implement static-first landing page per spec.
- Use Tailwind utilities + Bootstrap Reboot/base; avoid heavy JS.
- Ensure all critical flows work without JS and pass a11y/perf gates.

## Setup (frontend)
1. Add Tailwind with purge scanning `frontend/src/**/*.{html,ts,tsx}`.
2. Include Bootstrap Reboot/base CSS (self-hosted). Avoid Bootstrap JS plugins.
3. Configure CSP to self-hosted assets and SRI on any third-party.
4. Prepare responsive images for hero and gallery.

## Implementation order
1. Header (sticky) + Hero (CTA + trust minis)
2. Problem→Outcome strip
3. Benefits icon grid
4. Garden Rooms section (2-col layout)
5. Home Extensions section (2-col layout)
6. Gallery: CSS scroll-snap baseline + JS enhancement for drag/controls
7. Testimonial slider: baseline list + optional JS
8. Process steps
9. Mini-FAQ using details/summary
10. Newsletter capture (single opt-in with policy link)
11. Quote form (mailto fallback + JS-enhanced submit)
12. Footer (NAP + socials + accreditations)

## Testing
- Write Playwright tests with axe checks for a11y; include keyboard navigation tests.
- Add Lighthouse audits: Perf/A11y/Best Practices ≥ 90; SEO = 100.
- Validate forms: required/optional fields and error states; no-JS fallback.

## Contracts
- See `contracts/openapi.yaml` for optional enhanced API endpoints.

## Notes
- Keep total compressed CSS+JS ≤ 500KB; use Tailwind purge and avoid unused Bootstrap.
- Respect prefers-reduced-motion and ensure visible focus styles throughout.
