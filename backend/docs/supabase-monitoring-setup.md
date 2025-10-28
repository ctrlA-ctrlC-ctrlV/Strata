# Supabase Monitoring and Alerting Setup

## Dashboard Configuration

### 1. Access Monitoring Dashboard
1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `strata-garden-rooms-prod`
3. Go to **Settings** → **Database** → **Logs**

### 2. Enable Real-time Monitoring

#### Database Performance Monitoring
- **CPU Usage**: Monitor database CPU utilization
- **Memory Usage**: Track memory consumption patterns  
- **Active Connections**: Monitor concurrent connection count
- **Query Performance**: Track slow query logs

#### API Performance Monitoring
- **Request Rate**: Monitor API requests per minute
- **Response Time**: Track API response latencies
- **Error Rate**: Monitor 4xx/5xx error rates
- **Auth Events**: Track authentication activities

### 3. Configure Alerts

#### Critical Alerts (Immediate Response Required)
1. **Database Connection Failures**
   - Threshold: Any connection failure
   - Action: Immediate notification
   
2. **High Error Rate**
   - Threshold: >5% error rate over 5 minutes
   - Action: Team notification
   
3. **Slow Query Performance**
   - Threshold: Queries >2 seconds
   - Action: Performance review

#### Warning Alerts (Monitor and Plan)
1. **High CPU Usage**
   - Threshold: >80% for 10 minutes
   - Action: Capacity planning review
   
2. **Connection Pool Near Limit**
   - Threshold: >80% of max connections
   - Action: Review connection usage

### 4. Custom Monitoring Queries

#### Daily Health Check Query
```sql
-- Monitor daily quote request volume
SELECT 
  date_trunc('day', created_at) as day,
  count(*) as quote_requests,
  avg(estimate_total_inc_vat) as avg_quote_value
FROM quote_requests 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day;
```

#### Performance Monitoring Query
```sql
-- Monitor database performance metrics
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables
WHERE tablename IN ('product_configurations', 'quote_requests');
```

### 5. Log Analysis Setup

#### Enable Enhanced Logging
1. Go to **Settings** → **Logs** → **Configuration**
2. Enable:
   - **Database logs**: For query performance analysis
   - **API logs**: For request tracking
   - **Auth logs**: For security monitoring

#### Log Retention
- **Development**: 7 days (included in free tier)
- **Production**: 90 days (requires Pro plan)

### 6. Performance Baseline Metrics

#### Target Performance Standards
- **API Response Time**: <200ms p95
- **Database Query Time**: <100ms average
- **Connection Time**: <50ms
- **Uptime**: >99.9%

#### Current Baseline (To be established)
Run the health check script weekly to establish performance baselines:

```bash
cd backend
npm run health-check
```

### 7. Incident Response Procedures

#### Database Performance Issues
1. Check Supabase status page: https://status.supabase.com
2. Review recent query performance in dashboard
3. Run health check script to identify specific issues
4. Check connection pool usage
5. Review and optimize slow queries

#### API Rate Limiting
1. Monitor request patterns in dashboard
2. Implement request throttling if needed
3. Review and optimize API endpoints
4. Consider caching strategies

### 8. Weekly Review Process

#### Performance Review Checklist
- [ ] Review weekly performance metrics
- [ ] Check for any alert triggers
- [ ] Analyze query performance trends  
- [ ] Review error logs for patterns
- [ ] Update performance baselines if needed

#### Monthly Capacity Planning
- [ ] Review growth in database size
- [ ] Analyze traffic patterns and trends
- [ ] Plan for capacity scaling if needed
- [ ] Review and adjust alert thresholds

## Integration with Health Check Script

The automated health check script (`backend/src/scripts/health-check.ts`) provides:
- Automated performance monitoring
- Connection validation
- Write/read performance testing
- Error detection and reporting

Run regularly via:
```bash
# Manual execution
npm run health-check

# Automated via cron (production)
# 0 */6 * * * cd /path/to/backend && npm run health-check
```

## Dashboard URLs

- **Project Dashboard**: https://supabase.com/dashboard/project/{project-id}
- **Logs**: https://supabase.com/dashboard/project/{project-id}/logs/explorer  
- **Database**: https://supabase.com/dashboard/project/{project-id}/database/tables
- **API**: https://supabase.com/dashboard/project/{project-id}/api/docs

Replace `{project-id}` with your actual Supabase project ID.