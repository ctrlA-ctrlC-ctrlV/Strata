# Quickstart: Static Marketing Site & Configurator

## Prerequisites
- Node.js 20 LTS (nvm recommended)
- MongoDB connection string (TLS, IP allowlist configured)
- Email provider credentials (Postmark recommended) or SMTP relay

## Install
1. Clone repo and checkout branch `001-static-web-leads`
2. Frontend: `npm ci` in `/frontend`
3. Backend: `npm ci` in `/backend`

## Configure
- Backend `.env` (example):
  - MONGODB_URI=...
  - EMAIL_PROVIDER=postmark|smtp
  - EMAIL_FROM=no-reply@yourdomain.ie
  - SECURITY_CSP=enabled
  - RATE_LIMIT=true

## Run
- Frontend dev: `npm run dev` in `/frontend`
- Backend dev: `npm run dev` in `/backend`

## Test
- Frontend unit: `npm test` in `/frontend`
- Backend unit: `npm test` in `/backend`
- E2E: `npm run e2e`

## Verify
- Lighthouse ≥90; a11y checks pass; E2E for configurator→quote and contact pass
- Email deliverability verified (inbox) and <1 minute SLA for ≥95% tests
