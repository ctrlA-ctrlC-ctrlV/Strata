# Deployment Security Headers Configuration

This document provides security header configurations for deploying the Strata Garden Rooms landing page on various hosting platforms and web servers.

## Overview

These security headers should be configured at the server/CDN level for maximum protection. The CSP meta tag in the HTML serves as a fallback for development but production should use server-side headers.

## Nginx Configuration

Add the following to your Nginx server block:

```nginx
# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Remove server signature
server_tokens off;

# SRI (Subresource Integrity) for external resources
# Note: Calculate hashes for any external resources and update accordingly
```

## Apache Configuration

Add to your `.htaccess` file or Apache virtual host:

```apache
# Security Headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# Remove server signature
ServerTokens Prod
```

## Cloudflare Configuration

If using Cloudflare, configure these in the dashboard:

1. **SSL/TLS > Edge Certificates**:
   - Enable "Always Use HTTPS"
   - Enable "HTTP Strict Transport Security (HSTS)"
   - Max Age: 12 months
   - Include subdomains: Yes
   - Preload: Yes

2. **Security > WAF > Custom Rules**:
   - Add security headers via Transform Rules

3. **Transform Rules > HTTP Response Header Modification**:
   ```
   Set static header:
   - Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: geolocation=(), microphone=(), camera=()
   ```

## Netlify Configuration

Create `_headers` file in the public directory:

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

## Security Header Explanations

### Strict-Transport-Security (HSTS)
- Forces HTTPS connections for 1 year
- Includes all subdomains
- Enables HSTS preload list submission

### Content-Security-Policy (CSP)
- `default-src 'self'`: Only allow resources from same origin
- `style-src 'self' 'unsafe-inline'`: Allow inline styles (needed for Tailwind)
- `script-src 'self'`: Only allow scripts from same origin
- `img-src 'self' data: https:`: Allow images from same origin, data URLs, and HTTPS
- `connect-src 'self'`: Only allow XHR/fetch to same origin
- `font-src 'self'`: Only allow fonts from same origin
- `frame-src 'none'`: Block all iframes
- `object-src 'none'`: Block plugins (Flash, etc.)
- `base-uri 'self'`: Restrict base tag URLs
- `form-action 'self'`: Restrict form submission targets
- `frame-ancestors 'none'`: Prevent clickjacking

### X-Content-Type-Options
- Prevents MIME type sniffing attacks

### X-Frame-Options
- Prevents clickjacking by blocking iframe embedding

### X-XSS-Protection
- Enables browser XSS filtering (legacy browsers)

### Referrer-Policy
- Controls how much referrer information is sent with requests

### Permissions-Policy
- Blocks access to sensitive browser APIs (location, microphone, camera)

## Testing Security Headers

Use these tools to verify your headers are configured correctly:

1. **SecurityHeaders.com**: https://securityheaders.com/
2. **Mozilla Observatory**: https://observatory.mozilla.org/
3. **CSP Evaluator**: https://csp-evaluator.withgoogle.com/

## Production Notes

1. **Remove 'unsafe-inline' from CSP**: Once inline styles are eliminated in production
2. **Add SRI hashes**: For any external resources
3. **Monitor CSP violations**: Set up reporting endpoint
4. **Review headers regularly**: Update as security best practices evolve

## Emergency CSP Bypass

If CSP blocks legitimate functionality, temporarily add to meta tag:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval';">
```

**⚠️ WARNING**: Only use in emergency. Remove as soon as possible.