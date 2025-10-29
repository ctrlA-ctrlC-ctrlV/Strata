# Deployment Configuration

This directory contains deployment configurations and scripts for the Strata Garden Rooms application using Supabase.

## Environment Variables Required

### Production Environment

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NODE_ENV=production
PORT=3001

# Email Configuration (Optional)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
MAIL_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
```

### Environment Validation

The application will validate required environment variables on startup. Missing variables will cause the application to fail fast with clear error messages.

## Deployment Scripts

### Basic Node.js Deployment

```bash
#!/bin/bash
# deploy.sh - Basic deployment script

set -e

echo "🚀 Deploying Strata Garden Rooms API..."

# Check required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_ANON_KEY environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build application
echo "🔨 Building application..."
npm run build

# Run health check
echo "🏥 Running health check..."
npm run health-check

# Start application
echo "✅ Starting application..."
npm start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD npm run health-check || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  strata-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - MAIL_SECURE=${MAIL_SECURE}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "npm", "run", "health-check"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
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
        
    - name: Run tests
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: |
        cd backend
        npm test
        
    - name: Build application
      run: |
        cd backend
        npm run build
        
    - name: Run deployment validation
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      run: |
        cd backend
        npm test -- deployment.test.ts
        
    - name: Deploy to production
      # Add your deployment step here
      run: echo "Deploy to your production environment"
```

## Monitoring and Health Checks

### Application Health

The application includes built-in health checks:

```bash
# Manual health check
npm run health-check

# Automated monitoring (add to cron)
*/5 * * * * cd /path/to/app && npm run health-check >> /var/log/health.log 2>&1
```

### Supabase Monitoring

Monitor your Supabase project:

1. **Dashboard**: https://app.supabase.com/project/[project-id]
2. **Logs**: https://app.supabase.com/project/[project-id]/logs
3. **Performance**: https://app.supabase.com/project/[project-id]/reports

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Supabase project set up and accessible
- [ ] Database schema deployed
- [ ] SSL certificates configured
- [ ] Domain name configured

### Deployment

- [ ] Application builds successfully
- [ ] All tests pass
- [ ] Health check passes
- [ ] Database connectivity verified
- [ ] Performance tests pass

### Post-Deployment

- [ ] Application responding to requests
- [ ] Database operations working
- [ ] Email functionality working (if configured)
- [ ] Monitoring alerts configured
- [ ] Backup verification scheduled

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check SUPABASE_URL is correct
   - Verify API keys are valid
   - Ensure Supabase project is active

2. **Permission Denied**
   - Check Row Level Security policies
   - Verify service role key permissions
   - Review authentication configuration

3. **Performance Issues**
   - Monitor Supabase dashboard
   - Check query performance
   - Review connection pooling

### Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Application Logs**: Check application logs for detailed errors
- **Health Check**: Use `npm run health-check` for diagnostics

---

**Last Updated**: October 2025  
**Environment**: Production-ready with Supabase  
**MongoDB Dependencies**: ❌ Removed (Zero MongoDB configuration required)  
**Supabase Dependencies**: ✅ Fully configured