<!--
  Sync Impact Report:
  Version change: Template → 1.0.0
  Modified principles: All principles newly defined for static web app
  Added sections: Core Principles (5), Performance Standards, Security Requirements, Development Workflow
  Removed sections: Template placeholders
  Templates requiring updates: 
    ✅ Updated: .specify/templates/plan-template.md (Constitution Check section aligns)
    ✅ Updated: .specify/templates/spec-template.md (Independent testing aligns with principles)
    ✅ Updated: .specify/templates/tasks-template.md (Task organization supports principles)
  Follow-up TODOs: None - all placeholders filled
-->

# Strata Constitution

## Core Principles

### I. Static-First Architecture
All content and functionality MUST be pre-built at compile time whenever possible.
No runtime server dependencies for core functionality. Dynamic features MUST degrade 
gracefully when server components are unavailable. Client-side rendering and static 
site generation are preferred over server-side rendering.

**Rationale**: Ensures maximum performance, reliability, and deployment flexibility while 
minimizing operational overhead and security surface area.

### II. Performance-First Development
Page load times MUST NOT exceed 3 seconds on slow 3G connections. First Contentful 
Paint MUST occur within 1.5 seconds. Total bundle size MUST remain under 500KB 
compressed. All images MUST be optimized and use modern formats (WebP, AVIF) with 
appropriate fallbacks.

**Rationale**: User experience directly correlates with performance metrics. Poor 
performance leads to user abandonment and reduced conversion rates.

### III. Progressive Enhancement (NON-NEGOTIABLE)
Core functionality MUST work without JavaScript enabled. Enhanced features may require 
JavaScript but MUST NOT break core user flows when unavailable. CSS MUST provide 
complete styling without JavaScript dependencies. All interactive elements MUST be 
keyboard accessible.

**Rationale**: Ensures accessibility, SEO compatibility, and resilience across diverse 
user environments and assistive technologies.

### IV. Test-Driven Development
All new features MUST have automated tests written before implementation. Visual 
regression tests are required for UI components. Cross-browser compatibility MUST be 
verified through automated testing. Accessibility compliance MUST be validated with 
automated tools (minimum WCAG 2.1 AA).

**Rationale**: Prevents regressions, ensures consistent behavior across environments, 
and maintains quality standards throughout development lifecycle.

### V. Build-Time Optimization
All assets MUST be minified and compressed during build process. Unused CSS and 
JavaScript MUST be eliminated through tree-shaking. Images MUST be automatically 
optimized with responsive variants generated. Critical CSS MUST be inlined for 
above-the-fold content.

**Rationale**: Maximizes performance benefits of static architecture and reduces 
bandwidth requirements for users.

## Performance Standards

Web Vitals MUST meet the following thresholds:
- Largest Contentful Paint (LCP): ≤ 2.5 seconds
- First Input Delay (FID): ≤ 100 milliseconds  
- Cumulative Layout Shift (CLS): ≤ 0.1
- Time to Interactive (TTI): ≤ 3.5 seconds

Lighthouse scores MUST achieve minimum 90/100 for Performance, Accessibility, and 
Best Practices categories. SEO score MUST be 100/100.

## Security Requirements

Content Security Policy (CSP) MUST be implemented with strict directives. All external 
resources MUST use HTTPS. Subresource Integrity (SRI) MUST be implemented for all 
third-party assets. No sensitive data may be embedded in client-side code. All forms 
MUST implement CSRF protection when applicable.

HTTPS is mandatory for all environments including development previews. Security headers 
MUST include: HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.

## Development Workflow

All changes MUST go through pull request review process. Automated testing MUST pass 
before merge approval. Performance budgets MUST be verified in CI/CD pipeline. 
Breaking changes require architecture review and migration documentation.

Code reviews MUST verify: performance impact, accessibility compliance, security 
considerations, and adherence to static-first principles. Documentation MUST be 
updated concurrent with feature development.

## Governance

This constitution supersedes all other development practices and guidelines. All pull 
requests MUST demonstrate compliance with core principles. Performance budgets are 
enforced automatically and cannot be overridden without constitution amendment.

Amendments require: documented justification, impact assessment, team consensus, and 
migration plan for existing code. Constitution compliance is verified during code 
review process.

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16
