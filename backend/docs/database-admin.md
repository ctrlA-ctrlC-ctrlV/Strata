# Database Administration Guide

**Project**: Strata Garden Rooms  
**Database**: Supabase (PostgreSQL)  
**Date**: October 2025  
**Status**: Production Ready

## Overview

This guide provides comprehensive instructions for administering the Supabase PostgreSQL database used by the Strata Garden Rooms application.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Database Access](#database-access)
3. [Monitoring & Health Checks](#monitoring--health-checks)
4. [Backup & Recovery](#backup--recovery)
5. [Performance Optimization](#performance-optimization)
6. [Security Management](#security-management)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Procedures](#emergency-procedures)

## Quick Reference

### Essential Commands

```bash
# Health check
npm run health-check

# Backup verification
npm run verify-backups

# Database performance test
npm test -- database-performance.test.ts

# TypeScript compilation check
npm run type-check
```

### Key URLs

- **Supabase Dashboard**: https://app.supabase.com/project/[project-id]
- **Database Tab**: https://app.supabase.com/project/[project-id]/editor
- **Logs Tab**: https://app.supabase.com/project/[project-id]/logs
- **Settings**: https://app.supabase.com/project/[project-id]/settings/database

## Database Access

### Supabase Dashboard Access

1. **Login**: Use Supabase account credentials
2. **Project Selection**: Select "strata-garden-rooms-prod"
3. **Database Tab**: Access SQL editor and table browser
4. **API Tab**: View and test database API endpoints

### Direct PostgreSQL Access

```bash
# Using psql (requires connection string from Supabase settings)
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Using Supabase CLI
supabase db connect
```

### Connection Parameters

- **Host**: Available in Supabase project settings
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres
- **Password**: Available in Supabase project settings

## Monitoring & Health Checks

### Automated Health Checks

**Script Location**: `backend/src/scripts/health-check.ts`

```bash
# Run health check
npm run health-check

# Expected output:
# 🏥 Running Supabase Health Check...
# 📊 Health Check Results
# 🚦 Overall Status: HEALTHY
# ✅ Component Health: [all checks passing]
# ⏱️ Response Times: [performance metrics]
```

**Health Check Components**:
- ✅ Database connection
- ✅ Basic query execution
- ✅ Write operations
- ✅ Read operations
- ✅ Performance benchmarks

### Key Metrics to Monitor

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Connection Time | < 100ms | > 500ms | > 2000ms |
| Query Response | < 200ms | > 500ms | > 1000ms |
| Write Operations | < 500ms | > 1000ms | > 2000ms |
| CPU Usage | < 70% | > 80% | > 90% |
| Memory Usage | < 80% | > 90% | > 95% |
| Storage Usage | < 80% | > 90% | > 95% |

### Supabase Dashboard Monitoring

1. **Go to Logs Tab**: View real-time database logs
2. **Performance Tab**: Monitor query performance
3. **Usage Tab**: Track API calls and storage usage
4. **Reports Tab**: View daily/weekly performance reports

## Backup & Recovery

### Automated Backups

**Supabase provides automatic backups**:
- **Point-in-Time Recovery**: 7 days (Free tier) / 30+ days (Paid tiers)
- **Daily Backups**: Retained for backup retention period
- **Backup Encryption**: Automatic encryption at rest

### Backup Verification

**Script Location**: `backend/src/scripts/verify-backups.ts`

```bash
# Verify backup configuration
npm run verify-backups

# Expected output:
# 💾 Supabase Backup Verification
# 📊 Backup Status Report
# ✅ Backup Features: [all enabled]
# 🧪 Testing Recovery Scenario: [success]
```

### Manual Backup Creation

```sql
-- Create manual snapshot via Supabase dashboard
-- Go to Settings > Database > Create Backup

-- Export specific table data
\copy product_configurations TO 'product_configurations_backup.csv' CSV HEADER;
\copy quote_requests TO 'quote_requests_backup.csv' CSV HEADER;
```

### Recovery Procedures

#### Point-in-Time Recovery

1. **Access Supabase Dashboard**
2. **Go to Settings > Database**
3. **Select "Backups" tab**
4. **Choose recovery point**
5. **Initiate restore process**

⚠️ **Warning**: Point-in-time recovery creates a new database instance

#### Table-Level Recovery

```sql
-- Restore from backup file
\copy product_configurations FROM 'product_configurations_backup.csv' CSV HEADER;

-- Restore specific records
INSERT INTO product_configurations 
SELECT * FROM backup_table 
WHERE created_at >= '2025-01-01';
```

## Performance Optimization

### Query Performance

#### Analyze Slow Queries

```sql
-- Enable query logging (via Supabase dashboard settings)
-- View slow queries in Logs tab

-- Analyze specific query
EXPLAIN ANALYZE SELECT * FROM quote_requests 
WHERE customer_email = 'test@example.com';
```

#### Index Management

```sql
-- View existing indexes
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Create performance indexes
CREATE INDEX idx_quote_requests_created_at_desc 
ON quote_requests(created_at DESC);

CREATE INDEX idx_product_configurations_product_type_created 
ON product_configurations(product_type, created_at);
```

### Database Maintenance

```sql
-- Update table statistics
ANALYZE product_configurations;
ANALYZE quote_requests;

-- Vacuum tables (automatic in Supabase, but can be manual)
VACUUM ANALYZE product_configurations;
```

### Performance Monitoring

```bash
# Run performance tests
npm test -- database-performance.test.ts

# Monitor via dashboard
# Go to Supabase > Performance tab
```

## Security Management

### Row Level Security (RLS)

**Current Policies** (permissive during migration):

```sql
-- View current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Example: Restrictive policy for production
CREATE POLICY "Users can only access their quotes" 
ON quote_requests FOR ALL 
USING (customer_email = auth.jwt() ->> 'email');
```

### Access Control

```sql
-- Create read-only user for reporting
CREATE ROLE readonly_user;
GRANT CONNECT ON DATABASE postgres TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### Environment Security

- ✅ **API Keys**: Stored in environment variables
- ✅ **Connection Strings**: Not committed to git
- ✅ **HTTPS**: Enforced for all connections
- ✅ **Authentication**: Supabase JWT tokens

## Troubleshooting

### Common Issues

#### Connection Failures

```bash
# Test connection
npm run health-check

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

**Solutions**:
1. Verify environment variables are set
2. Check Supabase project status
3. Validate API keys in Supabase dashboard
4. Test network connectivity

#### Slow Query Performance

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Solutions**:
1. Add appropriate indexes
2. Optimize query structure
3. Review table statistics
4. Consider query rewriting

#### High Memory Usage

**Check via Supabase Dashboard > Usage tab**

**Solutions**:
1. Optimize query patterns
2. Add database indexes
3. Review connection pooling
4. Consider upgrading database tier

### Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `connection refused` | Database not accessible | Check credentials and network |
| `permission denied` | Insufficient privileges | Review RLS policies |
| `relation does not exist` | Table/column missing | Verify schema migration |
| `timeout` | Query taking too long | Optimize query or add indexes |

## Emergency Procedures

### Database Outage

1. **Check Supabase Status**: https://status.supabase.com/
2. **Verify Network**: Test connection from multiple locations
3. **Review Logs**: Check application and database logs
4. **Enable Maintenance Mode**: If necessary, serve static content
5. **Contact Support**: Submit Supabase support ticket

### Data Corruption

1. **Stop Write Operations**: Prevent further damage
2. **Assess Scope**: Identify affected tables/records
3. **Restore from Backup**: Use point-in-time recovery
4. **Validate Data**: Run integrity checks
5. **Resume Operations**: Gradually restore service

### Security Incident

1. **Immediate Response**: Change API keys and passwords
2. **Audit Access**: Review access logs and user activities
3. **Assess Impact**: Identify potentially compromised data
4. **Notify Stakeholders**: Follow incident response plan
5. **Strengthen Security**: Implement additional safeguards

### Performance Degradation

1. **Monitor Metrics**: Check CPU, memory, storage usage
2. **Identify Bottlenecks**: Review slow query logs
3. **Scale Resources**: Consider database tier upgrade
4. **Optimize Queries**: Add indexes, rewrite problematic queries
5. **Load Balancing**: Consider read replicas if available

## Contacts & Resources

### Support Contacts

- **Primary DBA**: [Your Name] - [email@domain.com]
- **Backup DBA**: [Backup Name] - [backup@domain.com]
- **Supabase Support**: https://app.supabase.com/support/new

### External Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Performance Tuning Guide**: https://supabase.com/docs/guides/platform/performance
- **Security Best Practices**: https://supabase.com/docs/guides/auth/security

### Internal Documentation

- **API Documentation**: `/specs/main/contracts/openapi.yaml`
- **Data Model**: `/specs/main/data-model.md`
- **Migration Scripts**: `/backend/src/migrations/`
- **Test Documentation**: `/backend/tests/README.md`

---

**Last Updated**: October 2025  
**Next Review**: January 2026  
**Document Owner**: Development Team