# Database Log Aggregation and Error Tracking

This document describes the configuration for centralized logging and error tracking for database operations.

## Overview

Comprehensive logging strategy for database operations includes:

- **Structured Logging**: Consistent log format across all database operations
- **Error Categorization**: Classification of errors by severity and type
- **Performance Logging**: Query timing and performance metrics
- **Audit Logging**: User actions and data changes
- **Centralized Collection**: Aggregation of logs from multiple sources

## Log Structure

### Standard Log Format

```typescript
interface DatabaseLogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  operation: string
  table?: string
  query_time_ms?: number
  user_id?: string
  request_id?: string
  error?: {
    code: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}
```

### Example Log Entries

```json
{
  "timestamp": "2025-10-28T14:30:00.000Z",
  "level": "info",
  "operation": "quote_request_create",
  "table": "quote_requests",
  "query_time_ms": 45,
  "user_id": "anonymous",
  "request_id": "req_abc123",
  "metadata": {
    "product_type": "garden-room",
    "estimate_total": 18450.0
  }
}

{
  "timestamp": "2025-10-28T14:31:00.000Z",
  "level": "error",
  "operation": "product_config_update",
  "table": "product_configurations",
  "query_time_ms": 1200,
  "user_id": "user_xyz789",
  "request_id": "req_def456",
  "error": {
    "code": "23505",
    "message": "duplicate key value violates unique constraint",
    "stack": "Error: duplicate key..."
  }
}
```

## Implementation

### Database Logger Class

Create `backend/src/utils/database-logger.ts`:

```typescript
import winston from 'winston'
import { supabase } from '../db/supabase'

interface DatabaseLogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  operation: string
  table?: string
  query_time_ms?: number
  user_id?: string
  request_id?: string
  error?: {
    code: string
    message: string
    stack?: string
  }
  metadata?: Record<string, any>
}

class DatabaseLogger {
  private logger: winston.Logger
  private requestId: string | null = null

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File output for production
        new winston.transports.File({
          filename: 'logs/database-error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/database-combined.log'
        })
      ]
    })

    // Add external logging services if configured
    if (process.env.DATADOG_API_KEY) {
      this.logger.add(new winston.transports.Http({
        host: 'http-intake.logs.datadoghq.com',
        path: `/v1/input/${process.env.DATADOG_API_KEY}`,
        ssl: true
      }))
    }
  }

  setRequestId(requestId: string) {
    this.requestId = requestId
  }

  private createLogEntry(
    level: DatabaseLogEntry['level'],
    operation: string,
    details: Partial<DatabaseLogEntry> = {}
  ): DatabaseLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      operation,
      request_id: this.requestId || undefined,
      ...details
    }
  }

  logQuery(
    operation: string,
    table: string,
    queryTimeMs: number,
    metadata?: Record<string, any>
  ) {
    const entry = this.createLogEntry('info', operation, {
      table,
      query_time_ms: queryTimeMs,
      metadata
    })
    
    this.logger.info(entry)
    
    // Log to Supabase for centralized storage (optional)
    this.logToSupabase(entry).catch(err => 
      console.error('Failed to log to Supabase:', err)
    )
  }

  logError(
    operation: string,
    error: Error,
    table?: string,
    metadata?: Record<string, any>
  ) {
    const entry = this.createLogEntry('error', operation, {
      table,
      error: {
        code: (error as any).code || 'UNKNOWN',
        message: error.message,
        stack: error.stack
      },
      metadata
    })
    
    this.logger.error(entry)
    this.logToSupabase(entry).catch(err => 
      console.error('Failed to log error to Supabase:', err)
    )
  }

  logPerformanceWarning(
    operation: string,
    table: string,
    queryTimeMs: number,
    threshold: number = 1000
  ) {
    if (queryTimeMs > threshold) {
      const entry = this.createLogEntry('warn', 'slow_query', {
        table,
        query_time_ms: queryTimeMs,
        metadata: {
          original_operation: operation,
          threshold_ms: threshold,
          exceeded_by_ms: queryTimeMs - threshold
        }
      })
      
      this.logger.warn(entry)
      this.logToSupabase(entry).catch(err => 
        console.error('Failed to log performance warning:', err)
      )
    }
  }

  private async logToSupabase(entry: DatabaseLogEntry) {
    try {
      // Store logs in a dedicated table for analysis
      await supabase
        .from('application_logs')
        .insert({
          timestamp: entry.timestamp,
          log_level: entry.level,
          operation: entry.operation,
          table_name: entry.table,
          query_time_ms: entry.query_time_ms,
          user_id: entry.user_id,
          request_id: entry.request_id,
          error_code: entry.error?.code,
          error_message: entry.error?.message,
          metadata: entry.metadata
        })
    } catch (error) {
      // Silently fail to avoid recursive logging
      console.error('Failed to store log in Supabase:', error)
    }
  }
}

// Singleton instance
export const dbLogger = new DatabaseLogger()

// Middleware for Express to set request ID
export function requestIdMiddleware(req: any, res: any, next: any) {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  req.requestId = requestId
  dbLogger.setRequestId(requestId)
  res.setHeader('X-Request-ID', requestId)
  next()
}
```

### Enhanced Repository with Logging

Update `backend/src/db/repos/quotes.ts` to include logging:

```typescript
import { dbLogger } from '../../utils/database-logger'

export class QuotesRepository {
  // ... existing code ...

  async createQuoteRequest(quoteData: Omit<QuoteRequest, 'id' | 'created_at' | 'updated_at'>): Promise<QuoteRequest> {
    const startTime = Date.now()
    
    try {
      dbLogger.logQuery(
        'quote_request_create_start',
        'quote_requests',
        0,
        { product_type: quoteData.product_configuration?.product_type }
      )

      const { data, error } = await this.supabase
        .from('quote_requests')
        .insert(quoteData)
        .select('*')
        .single()

      const queryTime = Date.now() - startTime

      if (error) {
        dbLogger.logError('quote_request_create_failed', error, 'quote_requests', quoteData)
        throw error
      }

      dbLogger.logQuery('quote_request_create_success', 'quote_requests', queryTime, {
        quote_id: data.id,
        estimate_total: data.product_configuration?.estimate_total_inc_vat
      })

      dbLogger.logPerformanceWarning('quote_request_create', 'quote_requests', queryTime)

      return data
    } catch (error) {
      const queryTime = Date.now() - startTime
      dbLogger.logError('quote_request_create_error', error as Error, 'quote_requests', {
        query_time_ms: queryTime,
        ...quoteData
      })
      throw error
    }
  }

  // Similar logging for other methods...
}
```

### Application Logs Table Schema

Add to `backend/supabase/migrations/20251023002000_application_logs.sql`:

```sql
-- Create application logs table for centralized logging
CREATE TABLE application_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp timestamptz NOT NULL DEFAULT NOW(),
    log_level text NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    operation text NOT NULL,
    table_name text,
    query_time_ms integer,
    user_id text,
    request_id text,
    error_code text,
    error_message text,
    metadata jsonb,
    created_at timestamptz DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_application_logs_timestamp ON application_logs(timestamp DESC);
CREATE INDEX idx_application_logs_level ON application_logs(log_level);
CREATE INDEX idx_application_logs_operation ON application_logs(operation);
CREATE INDEX idx_application_logs_table ON application_logs(table_name);
CREATE INDEX idx_application_logs_request_id ON application_logs(request_id);

-- Row Level Security
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (backend operations)
CREATE POLICY "Service role full access" ON application_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Deny direct access for anonymous users
CREATE POLICY "No anonymous access" ON application_logs
  FOR ALL USING (false);

-- Auto-cleanup old logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM application_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs();');
```

## Log Analysis and Monitoring

### Log Analysis Queries

Create `backend/src/scripts/log-analysis.ts`:

```typescript
import { supabase } from '../db/supabase'

// Error rate analysis
export async function getErrorRate(hours: number = 24) {
  const { data, error } = await supabase
    .from('application_logs')
    .select('log_level')
    .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
  
  if (error) throw error
  
  const total = data.length
  const errors = data.filter(log => log.log_level === 'error').length
  
  return {
    total_requests: total,
    error_count: errors,
    error_rate: total > 0 ? (errors / total) * 100 : 0
  }
}

// Slow query analysis
export async function getSlowQueries(thresholdMs: number = 1000, hours: number = 24) {
  const { data, error } = await supabase
    .from('application_logs')
    .select('operation, table_name, query_time_ms, timestamp, metadata')
    .gte('query_time_ms', thresholdMs)
    .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('query_time_ms', { ascending: false })
    .limit(20)
  
  if (error) throw error
  return data
}

// Error pattern analysis
export async function getErrorPatterns(hours: number = 24) {
  const { data, error } = await supabase
    .from('application_logs')
    .select('error_code, error_message, operation, table_name')
    .eq('log_level', 'error')
    .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
  
  if (error) throw error
  
  // Group by error code and message
  const patterns = data.reduce((acc, log) => {
    const key = `${log.error_code}_${log.operation}`
    if (!acc[key]) {
      acc[key] = {
        error_code: log.error_code,
        operation: log.operation,
        table_name: log.table_name,
        sample_message: log.error_message,
        count: 0
      }
    }
    acc[key].count++
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(patterns).sort((a: any, b: any) => b.count - a.count)
}

// Performance trends
export async function getPerformanceTrends(hours: number = 24) {
  const { data, error } = await supabase
    .from('application_logs')
    .select('operation, query_time_ms, timestamp')
    .not('query_time_ms', 'is', null)
    .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
  
  if (error) throw error
  
  const trends = data.reduce((acc, log) => {
    if (!acc[log.operation]) {
      acc[log.operation] = {
        operation: log.operation,
        count: 0,
        total_time: 0,
        min_time: Infinity,
        max_time: 0
      }
    }
    
    const op = acc[log.operation]
    op.count++
    op.total_time += log.query_time_ms
    op.min_time = Math.min(op.min_time, log.query_time_ms)
    op.max_time = Math.max(op.max_time, log.query_time_ms)
    
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(trends).map((trend: any) => ({
    ...trend,
    avg_time: trend.total_time / trend.count
  })).sort((a: any, b: any) => b.avg_time - a.avg_time)
}
```

### Monitoring Dashboard Integration

Update `backend/src/api/server.ts`:

```typescript
import { requestIdMiddleware, dbLogger } from './utils/database-logger'
import { getErrorRate, getSlowQueries, getErrorPatterns, getPerformanceTrends } from './scripts/log-analysis'

// Add middleware
app.use(requestIdMiddleware)

// Add monitoring endpoints
app.get('/api/monitoring/error-rate', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24
    const errorRate = await getErrorRate(hours)
    res.json(errorRate)
  } catch (error) {
    dbLogger.logError('monitoring_error_rate_failed', error as Error)
    res.status(500).json({ error: 'Failed to get error rate' })
  }
})

app.get('/api/monitoring/slow-queries', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 1000
    const hours = parseInt(req.query.hours as string) || 24
    const slowQueries = await getSlowQueries(threshold, hours)
    res.json(slowQueries)
  } catch (error) {
    dbLogger.logError('monitoring_slow_queries_failed', error as Error)
    res.status(500).json({ error: 'Failed to get slow queries' })
  }
})

app.get('/api/monitoring/error-patterns', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24
    const patterns = await getErrorPatterns(hours)
    res.json(patterns)
  } catch (error) {
    dbLogger.logError('monitoring_error_patterns_failed', error as Error)
    res.status(500).json({ error: 'Failed to get error patterns' })
  }
})

app.get('/api/monitoring/performance-trends', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24
    const trends = await getPerformanceTrends(hours)
    res.json(trends)
  } catch (error) {
    dbLogger.logError('monitoring_performance_trends_failed', error as Error)
    res.status(500).json({ error: 'Failed to get performance trends' })
  }
})
```

## External Log Aggregation

### Datadog Integration

Add to `backend/.env`:

```bash
DATADOG_API_KEY=your_datadog_api_key
DATADOG_SERVICE_NAME=strata-backend
DATADOG_ENV=production
```

Install Datadog client:

```bash
npm install dd-trace winston-transport-datadog
```

### ELK Stack Integration

Create `docker-compose.elk.yml`:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### Cloud Logging Integration

#### Google Cloud Logging

```typescript
import { Logging } from '@google-cloud/logging'

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
})

const log = logging.log('strata-database-logs')

export function logToCloudLogging(entry: DatabaseLogEntry) {
  const metadata = {
    resource: { type: 'global' },
    severity: entry.level.toUpperCase(),
    labels: {
      operation: entry.operation,
      table: entry.table || 'unknown'
    }
  }

  const logEntry = log.entry(metadata, entry)
  log.write(logEntry)
}
```

#### AWS CloudWatch

```typescript
import AWS from 'aws-sdk'

const cloudWatchLogs = new AWS.CloudWatchLogs({
  region: process.env.AWS_REGION
})

export async function logToCloudWatch(entry: DatabaseLogEntry) {
  const params = {
    logGroupName: '/strata/database-logs',
    logStreamName: `${new Date().toISOString().split('T')[0]}-database`,
    logEvents: [{
      timestamp: new Date(entry.timestamp).getTime(),
      message: JSON.stringify(entry)
    }]
  }

  try {
    await cloudWatchLogs.putLogEvents(params).promise()
  } catch (error) {
    console.error('Failed to log to CloudWatch:', error)
  }
}
```

## Alert Configuration

### Error Rate Alerts

Create `backend/src/monitoring/alerts.ts`:

```typescript
import { getErrorRate } from '../scripts/log-analysis'
import { sendSlackAlert } from '../utils/alert-manager'

export async function checkErrorRateAlert() {
  const errorRate = await getErrorRate(1) // Last hour
  
  if (errorRate.error_rate > 5) { // More than 5% error rate
    await sendSlackAlert(
      {
        webhook_url: process.env.SLACK_WEBHOOK || '',
        channel: '#database-alerts',
        username: 'Database Monitor'
      },
      'critical',
      `🚨 High error rate detected: ${errorRate.error_rate.toFixed(2)}%`,
      errorRate
    )
  }
}

export async function checkSlowQueryAlert() {
  const slowQueries = await getSlowQueries(2000, 1) // >2s queries in last hour
  
  if (slowQueries.length > 10) {
    await sendSlackAlert(
      {
        webhook_url: process.env.SLACK_WEBHOOK || '',
        channel: '#database-alerts', 
        username: 'Database Monitor'
      },
      'warning',
      `⚠️ High number of slow queries: ${slowQueries.length} queries >2s`,
      { count: slowQueries.length, samples: slowQueries.slice(0, 5) }
    )
  }
}
```

## Package.json Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "logs:analysis": "tsx src/scripts/log-analysis.ts",
    "logs:error-rate": "tsx -e \"import('./src/scripts/log-analysis.js').then(m => m.getErrorRate(24).then(console.log))\"",
    "logs:slow-queries": "tsx -e \"import('./src/scripts/log-analysis.js').then(m => m.getSlowQueries(1000, 24).then(console.log))\"",
    "logs:cleanup": "tsx -e \"import('./src/db/supabase.js').then(m => m.supabase.rpc('cleanup_old_logs').then(console.log))\""
  }
}
```

## Production Deployment

### Environment Variables

```bash
# Logging Configuration
LOG_LEVEL=info
LOG_TO_SUPABASE=true
LOG_RETENTION_DAYS=90

# External Logging Services (optional)
DATADOG_API_KEY=your_datadog_key
GOOGLE_CLOUD_PROJECT_ID=your_project
AWS_CLOUDWATCH_LOG_GROUP=/strata/database-logs

# Alert Configuration
SLACK_WEBHOOK=your_slack_webhook
ERROR_RATE_THRESHOLD=5
SLOW_QUERY_THRESHOLD=1000
```

### Log Rotation

Create `/etc/logrotate.d/strata-logs`:

```bash
/path/to/strata/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload strata-backend
    endscript
}
```

## Monitoring and Maintenance

### Daily Tasks

1. **Check Error Rates**: Monitor for spikes in error rates
2. **Review Slow Queries**: Identify performance bottlenecks  
3. **Analyze Error Patterns**: Look for recurring issues
4. **Verify Log Storage**: Ensure logs are being collected properly

### Weekly Tasks

1. **Performance Trend Analysis**: Review query performance trends
2. **Error Pattern Review**: Investigate recurring error patterns
3. **Log Cleanup**: Verify old logs are being cleaned up
4. **Alert Configuration Review**: Adjust thresholds based on patterns

### Monthly Tasks

1. **Log Storage Analysis**: Monitor log storage usage and costs
2. **Alert Effectiveness Review**: Evaluate alert accuracy and usefulness
3. **Documentation Updates**: Update procedures based on findings
4. **Tool Evaluation**: Assess effectiveness of logging tools and services

---

**Last Updated**: October 2025  
**Next Review**: January 2026  
**Document Owner**: Development Team