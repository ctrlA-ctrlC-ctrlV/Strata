import type { RequestHandler } from 'express';

export function applySecurityHeaders(): RequestHandler {
  return (_req, res, next) => {
    // Basic security headers (additional Helmet protections applied separately)
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // CSP (report-only initial; production move to enforce per T057)
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join('; '));
    next();
  };
}
