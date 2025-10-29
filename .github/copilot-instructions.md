# Strata Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-29

## Active Technologies
- React 18+ (primary frontend) with Vite bundler; TypeScript 5.x with TSX/JSX
- Styling: Vanilla CSS first (optionally CSS Modules); limit utility frameworks (Tailwind) to targeted cases; Bootstrap components only if justified
- Node.js 18+ runtime and Express.js backend (main)
- Supabase JavaScript client v2.x + Supabase client library; PostgreSQL drivers
- Migration from MongoDB 6.3.x to Supabase (PostgreSQL 15+) (main)
- Test stack: Playwright/Vitest (frontend), Jest (backend)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test; npm run lint

## Code Style
- React + TypeScript: Prefer functional components with hooks; enable strict TypeScript; co-locate component styles; name React files with .tsx
- State management: Start with React state/hooks; introduce lightweight context only when needed; avoid heavy frameworks without justification
- Styling: Default to vanilla CSS (or CSS Modules); keep selectors scoped; follow BEM-like clarity if not using modules; ensure accessible semantics and ARIA
- Backend/Server: Node.js 18+ and Express follow standard conventions; use async/await; consistent error handling; typed interfaces for API contracts
- Supabase: Use v2 client patterns; keep queries typed; centralize client initialization

## Recent Changes
- 002-home-landing-page: Frontend standardized on React 18+ with Vite and TypeScript (.tsx); vanilla CSS as default; Tailwind/Bootstrap considered optional and limited-use
- main: Continued use of Node.js 18+, Express backend, Supabase JS v2, and PostgreSQL drivers
- main: Migration path from MongoDB 6.3.x to Supabase (PostgreSQL 15+) remains active

<!-- MANUAL ADDITIONS START -->
### React-first guidelines (team standard)
- Components: Functional components with hooks; prefer composition over inheritance; keep components small and focused
- Files: Use `.tsx` for React components; colocate tests (`*.test.tsx`) and styles next to components when practical
- Styling: Default to vanilla CSS (or CSS Modules). Only use Tailwind utilities sparingly for rapid prototyping; Bootstrap components are not default
- Routing: React Router may be introduced when multi-page flows require it; avoid premature abstraction
- Accessibility: Ensure semantic HTML, keyboard navigation, and ARIA attributes where appropriate
- Performance: Use memoization (React.memo/useMemo/useCallback) selectively; code-split routes/components via Vite dynamic imports if payload grows
<!-- MANUAL ADDITIONS END -->
