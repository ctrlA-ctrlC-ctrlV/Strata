# Production Health Automation

This document outlines the automated health monitoring and performance testing setup for the Strata Garden Rooms landing page.

## Overview

The production health automation includes:
- Lighthouse CI for performance monitoring
- Automated accessibility testing
- Security header validation
- Core Web Vitals tracking
- Uptime monitoring

## Lighthouse CI Configuration

### Installation

```bash
npm install -g @lhci/cli@latest
```

### Configuration File

Create `.lighthouserc.js` in project root:

```javascript
module.exports = {
  ci: {
    collect: {
      // Static site configuration
      staticDistDir: './frontend/dist',
      // Or for live URL testing
      url: [
        'http://localhost:3000',
        'http://localhost:3000/contact.html',
        'http://localhost:3000/quote.html'
      ],
      numberOfRuns: 3,
      settings: {
        // Use mobile simulation for primary testing
        preset: 'desktop', // or 'mobile'
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Categories to test
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        // Skip PWA for static site
        skipAudits: ['service-worker', 'installable-manifest', 'apple-touch-icon'],
      }
    },
    assert: {
      assertions: {
        // Performance targets
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 2000 }],
        
        // Accessibility audits
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-valid-attr': 'error',
        'heading-order': 'error',
        
        // Security audits
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        
        // SEO audits
        'meta-description': 'error',
        'document-title': 'error',
        'structured-data': 'warn',
        'robots-txt': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      // For production, use LHCI server or GitHub integration
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN
    }
  }
};
```

### GitHub Actions Integration

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build application
      run: |
        cd frontend
        npm run build
        
    - name: Serve application
      run: |
        cd frontend
        npm run preview &
        sleep 10
        
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@latest
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
        
    - name: Upload Lighthouse results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: lighthouse-results
        path: .lighthouseci/
```

### Local Development Scripts

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:mobile": "lhci autorun --config=.lighthouserc.mobile.js",
    "lighthouse:desktop": "lhci autorun --config=.lighthouserc.desktop.js",
    "perf:analyze": "npm run build && npm run lighthouse"
  }
}
```

## Core Web Vitals Monitoring

### Real User Monitoring (RUM)

Add to `frontend/src/analytics/performance.ts`:

```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics provider
  console.log('Web Vital:', metric);
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
}

// Monitor all Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Budget Enforcement

Create `frontend/performance-budget.json`:

```json
{
  "budget": [
    {
      "resourceType": "script",
      "maximumSizeKb": 250
    },
    {
      "resourceType": "stylesheet",
      "maximumSizeKb": 150
    },
    {
      "resourceType": "image",
      "maximumSizeKb": 500
    },
    {
      "resourceType": "total",
      "maximumSizeKb": 1000
    }
  ],
  "timing": [
    {
      "metric": "first-contentful-paint",
      "budget": 1500
    },
    {
      "metric": "largest-contentful-paint", 
      "budget": 2500
    },
    {
      "metric": "cumulative-layout-shift",
      "budget": 0.1
    }
  ]
}
```

## Accessibility Monitoring

### Automated A11y Testing

Create `frontend/tests/e2e/accessibility-monitoring.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { runCommonAccessibilityTests } from '../helpers/axe';

test.describe('Production Accessibility Monitoring', () => {
  const pages = [
    { name: 'Homepage', url: '/' },
    { name: 'Contact', url: '/contact.html' },
    { name: 'Quote', url: '/quote.html' }
  ];

  for (const page of pages) {
    test(`${page.name} - Full accessibility scan`, async ({ page: playwright }) => {
      await playwright.goto(page.url);
      await runCommonAccessibilityTests(playwright, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
      });
    });
  }
});
```

### Pa11y Integration

```bash
npm install -g pa11y pa11y-ci
```

Create `.pa11yci.json`:

```json
{
  "defaults": {
    "timeout": 10000,
    "wait": 1000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": [
    "http://localhost:3000",
    "http://localhost:3000/contact.html",
    "http://localhost:3000/quote.html"
  ]
}
```

## Security Header Validation

### Security Headers Test

Create `frontend/tests/e2e/security-headers.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Headers Validation', () => {
  test('should have all required security headers', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).toBeTruthy();
    
    const headers = response?.headers() || {};
    
    // HSTS
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    
    // CSP
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    
    // Other security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toContain('strict-origin');
  });
});
```

## Uptime and Synthetic Monitoring

### Health Check Endpoint

Create `backend/src/api/health.ts`:

```typescript
import { Request, Response } from 'express';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'healthy', // Add actual DB check
      memory: process.memoryUsage(),
      disk: 'healthy' // Add disk space check
    }
  };
  
  res.status(200).json(health);
}
```

### Pingdom/StatusCake Configuration

Monitor these endpoints:
- `https://yourdomain.com/` (Homepage load test)
- `https://yourdomain.com/api/health` (Backend health)
- Check for specific text content
- Performance thresholds: < 2s response time
- Availability: 99.9% uptime target

## CI/CD Pipeline Integration

### Complete workflow example

```yaml
name: Production Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Build and test
      run: |
        cd frontend
        npm run build
        npm run preview &
        sleep 10
        
    - name: Lighthouse audit
      run: |
        npm install -g @lhci/cli@latest
        lhci autorun
        
    - name: Accessibility audit
      run: |
        npm install -g pa11y-ci
        pa11y-ci
        
    - name: Security headers test
      run: |
        cd frontend
        npm run test:e2e -- tests/e2e/security-headers.spec.ts
        
    - name: Notify on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Performance**
   - Core Web Vitals (LCP, FID, CLS)
   - Lighthouse scores
   - Page load times
   - Bundle sizes

2. **Accessibility**
   - Accessibility score trends
   - Axe violation counts
   - Keyboard navigation issues

3. **Security**
   - Security header compliance
   - SSL certificate status
   - Vulnerability scan results

4. **Availability**
   - Uptime percentage
   - Response times
   - Error rates

### Alert Thresholds

- Performance score < 90: Warning
- Accessibility score < 90: Error
- Core Web Vitals failure: Error
- Uptime < 99.5%: Critical
- Response time > 3s: Warning

## Implementation Priority

1. **Phase 1**: Basic Lighthouse CI setup
2. **Phase 2**: Accessibility monitoring integration
3. **Phase 3**: Security header validation
4. **Phase 4**: Real user monitoring
5. **Phase 5**: Advanced alerting and dashboards

## Next Steps

1. Create `.lighthouserc.js` configuration
2. Set up GitHub Actions workflow
3. Configure performance budgets
4. Implement accessibility testing
5. Set up monitoring alerts