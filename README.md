# Static Marketing Site & Configurator for Garden Rooms

A static-first marketing website with an interactive configurator that provides live price estimates and frictionless quote submission. Built for performance, accessibility, and SEO optimization.

## Features

- **Live Configurator**: Interactive garden room configurator with real-time price estimates and VAT toggle
- **Use Case Landing Pages**: SEO-optimized pages for home office, studio, and rental use cases
- **Product Pages**: Comprehensive pages for Garden Rooms, House Extensions, and House Builds
- **Gallery & Testimonials**: Trust-building galleries with overlay CTAs and customer testimonials
- **Contact Flow**: Simple contact forms with fast email delivery
- **Admin Dashboard**: Content management for assets, testimonials, and quote management
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance First**: Lighthouse score ≥90, LCP < 1.2s desktop

## Quick Start

See [quickstart.md](specs/001-static-web-leads/quickstart.md) for detailed setup instructions.

## Project Structure

```
frontend/           # Vite-powered static frontend
  src/
    pages/          # Static pages (home, products, gallery, contact)
    components/     # Reusable UI components
    styles/         # Global CSS and critical styles
    lib/            # Utilities (price calc, formatters)
    analytics/      # Event tracking
  public/           # Static assets
  tests/            # Unit and E2E tests

backend/            # Minimal Node.js API
  src/
    api/            # Express routes (quotes, contact, admin)
    services/       # Business logic (mailer, validation)
    db/             # MongoDB connection and repositories
    security/       # Security middleware and CSP
  tests/            # Backend tests
```

## Development

### Prerequisites
- Node.js 20 LTS
- MongoDB connection
- Email provider credentials

### Setup
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Accessibility checks
npm run test:a11y
```

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS with Vite build system
- **Backend**: Express.js with minimal dependencies
- **Database**: MongoDB with collections for quotes, testimonials, gallery
- **Security**: CSP, HTTPS, input validation, rate limiting
- **Performance**: Critical CSS inlining, responsive images, bundle budgets

## License

See [LICENSE](LICENSE) file for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.
