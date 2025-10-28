# Production Health Check Automation

This document describes how to set up automated database health checks in production environment.

## Overview

Automated health checks ensure continuous monitoring of database performance and availability. The system includes:

- **Scheduled Health Checks**: Regular execution of health check scripts
- **Alert Integration**: Automated notifications for issues
- **Performance Baselines**: Tracking and alerting on performance degradation
- **Incident Response**: Automated escalation procedures

## Implementation Options

### Option 1: GitHub Actions (Recommended for GitHub-hosted projects)

Create `.github/workflows/health-check.yml`:

```yaml
name: Database Health Check

on:
  schedule:
    # Run every 15 minutes during business hours (UTC)
    - cron: '*/15 8-18 * * 1-5'
    # Run every hour outside business hours
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run health check
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: |
        cd backend
        npm run health-check
        
    - name: Run backup verification
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: |
        cd backend
        npm run verify-backups
        
    - name: Run performance monitoring
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: |
        cd backend
        npm run performance-monitor
        
    - name: Notify on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#alerts'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        text: '🚨 Database health check failed! Please investigate immediately.'
```

### Option 2: Cron Jobs (Linux/Unix servers)

Create `/etc/cron.d/strata-health-check`:

```bash
# Strata Database Health Check
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=admin@yourdomain.com

# Run health check every 15 minutes during business hours
*/15 8-18 * * 1-5 www-data cd /path/to/strata/backend && npm run health-check >> /var/log/strata-health.log 2>&1

# Run health check every hour outside business hours  
0 * * * * www-data cd /path/to/strata/backend && npm run health-check >> /var/log/strata-health.log 2>&1

# Run backup verification daily at 2 AM
0 2 * * * www-data cd /path/to/strata/backend && npm run verify-backups >> /var/log/strata-backups.log 2>&1

# Run performance monitoring every 4 hours
0 */4 * * * www-data cd /path/to/strata/backend && npm run performance-monitor >> /var/log/strata-performance.log 2>&1
```

### Option 3: Docker with Health Checks

Create `docker-compose.healthcheck.yml`:

```yaml
version: '3.8'

services:
  health-checker:
    build:
      context: ./backend
      dockerfile: Dockerfile.healthcheck
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SLACK_WEBHOOK=${SLACK_WEBHOOK}
      - CHECK_INTERVAL=900 # 15 minutes
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "npm", "run", "health-check"]
      interval: 15m
      timeout: 30s
      retries: 3
      start_period: 10s
```

Create `backend/Dockerfile.healthcheck`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install tsx for TypeScript execution
RUN npm install -g tsx

# Create logs directory
RUN mkdir -p logs

# Health check script
COPY scripts/docker-health-check.sh ./
RUN chmod +x docker-health-check.sh

CMD ["./docker-health-check.sh"]
```

## Alert Integration

### Slack Integration

Create `backend/src/utils/alert-manager.ts`:

```typescript
export interface AlertConfig {
  webhook_url: string
  channel: string
  username: string
}

export async function sendSlackAlert(
  config: AlertConfig,
  severity: 'info' | 'warning' | 'critical',
  message: string,
  details?: any
) {
  const colors = {
    info: '#36a64f',
    warning: '#ff9500', 
    critical: '#ff0000'
  }

  const payload = {
    channel: config.channel,
    username: config.username,
    attachments: [{
      color: colors[severity],
      title: `Database Health Alert - ${severity.toUpperCase()}`,
      text: message,
      fields: details ? [{
        title: 'Details',
        value: JSON.stringify(details, null, 2),
        short: false
      }] : [],
      ts: Math.floor(Date.now() / 1000)
    }]
  }

  try {
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.statusText)
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error)
  }
}
```

### Email Integration

Create `backend/src/utils/email-alerts.ts`:

```typescript
import nodemailer from 'nodemailer'

export interface EmailAlertConfig {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  from_email: string
  alert_recipients: string[]
}

export async function sendEmailAlert(
  config: EmailAlertConfig,
  severity: 'info' | 'warning' | 'critical',
  subject: string,
  message: string,
  details?: any
) {
  const transporter = nodemailer.createTransporter({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_port === 465,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_password
    }
  })

  const emailBody = `
${message}

${details ? `Details:\n${JSON.stringify(details, null, 2)}` : ''}

---
Strata Database Health Monitoring System
Timestamp: ${new Date().toISOString()}
  `.trim()

  const mailOptions = {
    from: config.from_email,
    to: config.alert_recipients.join(','),
    subject: `[${severity.toUpperCase()}] ${subject}`,
    text: emailBody
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email alert sent successfully')
  } catch (error) {
    console.error('Failed to send email alert:', error)
  }
}
```

## Enhanced Health Check Script

Update `backend/src/scripts/health-check.ts` to include alerting:

```typescript
// Add to existing health-check.ts

import { sendSlackAlert, type AlertConfig } from '../utils/alert-manager'

async function checkAndAlert(result: HealthCheckResult) {
  const alertConfig: AlertConfig = {
    webhook_url: process.env.SLACK_WEBHOOK || '',
    channel: '#database-alerts',
    username: 'Strata Health Bot'
  }

  if (result.status === 'failed') {
    await sendSlackAlert(
      alertConfig,
      'critical',
      '🚨 Database health check FAILED! Immediate attention required.',
      {
        errors: result.errors,
        response_times: result.response_times,
        failed_checks: Object.entries(result.checks)
          .filter(([_, passed]) => !passed)
          .map(([check, _]) => check)
      }
    )
  } else if (result.status === 'degraded') {
    await sendSlackAlert(
      alertConfig,
      'warning',
      '⚠️ Database performance degraded. Investigation recommended.',
      {
        errors: result.errors,
        response_times: result.response_times
      }
    )
  }

  // Check for performance thresholds
  if (result.response_times.query_ms > 1000) {
    await sendSlackAlert(
      alertConfig,
      'warning',
      `🐌 Slow query performance detected: ${result.response_times.query_ms}ms`,
      { response_times: result.response_times }
    )
  }
}
```

## Performance Baseline Tracking

Create `backend/src/scripts/baseline-tracker.ts`:

```typescript
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { performHealthCheck } from './health-check'

interface PerformanceBaseline {
  created_at: string
  avg_connection_ms: number
  avg_query_ms: number
  avg_write_ms: number
  avg_read_ms: number
  sample_count: number
}

const BASELINE_FILE = 'performance-baseline.json'

export async function updateBaseline() {
  const result = await performHealthCheck()
  
  if (result.status !== 'healthy') {
    console.log('Skipping baseline update - system not healthy')
    return
  }

  let baseline: PerformanceBaseline

  if (existsSync(BASELINE_FILE)) {
    const existing = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
    
    // Rolling average calculation
    const count = existing.sample_count + 1
    baseline = {
      created_at: new Date().toISOString(),
      avg_connection_ms: (existing.avg_connection_ms * existing.sample_count + result.response_times.connection_ms) / count,
      avg_query_ms: (existing.avg_query_ms * existing.sample_count + result.response_times.query_ms) / count,
      avg_write_ms: (existing.avg_write_ms * existing.sample_count + result.response_times.write_ms) / count,
      avg_read_ms: (existing.avg_read_ms * existing.sample_count + result.response_times.read_ms) / count,
      sample_count: Math.min(count, 100) // Cap at 100 samples
    }
  } else {
    baseline = {
      created_at: new Date().toISOString(),
      avg_connection_ms: result.response_times.connection_ms,
      avg_query_ms: result.response_times.query_ms,
      avg_write_ms: result.response_times.write_ms,
      avg_read_ms: result.response_times.read_ms,
      sample_count: 1
    }
  }

  writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2))
  console.log('Performance baseline updated')
}
```

## Monitoring Dashboard

Create a simple monitoring dashboard at `backend/monitoring/dashboard.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Strata Database Health Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .healthy { background-color: #d4edda; color: #155724; }
        .degraded { background-color: #fff3cd; color: #856404; }
        .failed { background-color: #f8d7da; color: #721c24; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🏥 Strata Database Health Dashboard</h1>
    
    <div id="status-container">
        <p>Loading health status...</p>
    </div>
    
    <h2>📊 Real-time Metrics</h2>
    <div id="metrics-container">
        <p>Loading metrics...</p>
    </div>
    
    <h2>🔗 Quick Links</h2>
    <ul>
        <li><a href="https://app.supabase.com/project/[project-id]" target="_blank">Supabase Dashboard</a></li>
        <li><a href="https://app.supabase.com/project/[project-id]/logs" target="_blank">Database Logs</a></li>
        <li><a href="https://status.supabase.com" target="_blank">Supabase Status</a></li>
    </ul>
    
    <script>
        async function loadHealthStatus() {
            try {
                // This would connect to your health check API endpoint
                const response = await fetch('/api/health-check')
                const data = await response.json()
                
                const container = document.getElementById('status-container')
                container.innerHTML = `
                    <div class="status ${data.status}">
                        <h3>Overall Status: ${data.status.toUpperCase()}</h3>
                        <p>Last Check: ${new Date(data.timestamp).toLocaleString()}</p>
                    </div>
                `
                
                const metricsContainer = document.getElementById('metrics-container')
                metricsContainer.innerHTML = `
                    <div class="metric">
                        <strong>Connection Time</strong><br>
                        ${data.response_times.connection_ms}ms
                    </div>
                    <div class="metric">
                        <strong>Query Time</strong><br>
                        ${data.response_times.query_ms}ms
                    </div>
                    <div class="metric">
                        <strong>Write Time</strong><br>
                        ${data.response_times.write_ms}ms
                    </div>
                    <div class="metric">
                        <strong>Read Time</strong><br>
                        ${data.response_times.read_ms}ms
                    </div>
                `
            } catch (error) {
                console.error('Failed to load health status:', error)
                document.getElementById('status-container').innerHTML = 
                    '<div class="status failed">❌ Unable to load health status</div>'
            }
        }
        
        // Load status on page load and refresh every 30 seconds
        loadHealthStatus()
        setInterval(loadHealthStatus, 30000)
    </script>
</body>
</html>
```

## Package.json Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "health-check": "tsx src/scripts/health-check.ts",
    "verify-backups": "tsx src/scripts/verify-backups.ts", 
    "performance-monitor": "tsx src/scripts/performance-monitor.ts",
    "update-baseline": "tsx src/scripts/baseline-tracker.ts"
  }
}
```

## Deployment Checklist

### Production Setup:

1. **Environment Variables**:
   - [ ] `SUPABASE_URL` configured
   - [ ] `SUPABASE_ANON_KEY` configured  
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
   - [ ] `SLACK_WEBHOOK` configured (optional)
   - [ ] Email SMTP settings configured (optional)

2. **Automation**:
   - [ ] Health check automation deployed (GitHub Actions/cron/Docker)
   - [ ] Alert integration tested
   - [ ] Performance baseline established
   - [ ] Log rotation configured

3. **Monitoring**:
   - [ ] Supabase dashboard alerts configured
   - [ ] Team notification channels set up
   - [ ] Escalation procedures documented
   - [ ] Recovery procedures tested

4. **Testing**:
   - [ ] Manual health check execution verified
   - [ ] Alert notifications tested
   - [ ] Performance baseline collection verified
   - [ ] Incident response procedures tested

## Troubleshooting

### Common Issues:

1. **Script Permission Errors**: Ensure proper file permissions for cron jobs
2. **Environment Variables**: Verify all required variables are set in production
3. **Network Access**: Ensure production environment can reach Supabase endpoints
4. **Alert Delivery**: Test Slack/email integration before deploying

### Logs Locations:

- **Health Check Logs**: `/var/log/strata-health.log`
- **Backup Verification**: `/var/log/strata-backups.log`
- **Performance Monitoring**: `/var/log/strata-performance.log`
- **Application Logs**: Check your application's standard log location

---

**Last Updated**: October 2025  
**Next Review**: January 2026  
**Document Owner**: DevOps Team