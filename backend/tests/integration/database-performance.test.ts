import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { performHealthCheck, type HealthCheckResult } from '../../src/scripts/health-check'

describe('Database Performance Tests', () => {
  let healthCheckResult: HealthCheckResult

  beforeAll(async () => {
    // Run a health check to get baseline performance metrics
    healthCheckResult = await performHealthCheck()
    
    // Debug output to see what's failing
    if (healthCheckResult.status !== 'healthy') {
      console.log('Health Check Failed:', {
        status: healthCheckResult.status,
        checks: healthCheckResult.checks,
        errors: healthCheckResult.errors
      })
    }
  })

  test('database connection should be fast', () => {
    expect(healthCheckResult.checks.connection).toBe(true)
    expect(healthCheckResult.response_times.connection_ms).toBeLessThan(2000) // 2 second max
  })

  test('basic queries should be fast', () => {
    expect(healthCheckResult.checks.basic_query).toBe(true)
    expect(healthCheckResult.response_times.query_ms).toBeLessThan(500) // 500ms max
  })

  test('write operations should be reasonably fast', () => {
    expect(healthCheckResult.checks.write_test).toBe(true)
    expect(healthCheckResult.response_times.write_ms).toBeLessThan(1000) // 1 second max
  })

  test('read operations should be fast', () => {
    expect(healthCheckResult.checks.read_test).toBe(true)
    expect(healthCheckResult.response_times.read_ms).toBeLessThan(200) // 200ms max for reads
  })

  test('overall system should be healthy', () => {
    expect(healthCheckResult.status).toBe('healthy')
    expect(healthCheckResult.errors).toHaveLength(0)
  })

  test('all database operations should complete within performance targets', () => {
    // Total time for all operations should be reasonable
    const totalTime = Object.values(healthCheckResult.response_times).reduce((sum, time) => sum + time, 0)
    expect(totalTime).toBeLessThan(3000) // 3 seconds total
  })
})

describe('Database Load Testing', () => {
  test('concurrent read operations should not degrade performance significantly', async () => {
    const concurrentReads = 5
    const promises = Array(concurrentReads).fill(null).map(() => performHealthCheck())
    
    const results = await Promise.all(promises)
    
    // All should succeed
    results.forEach(result => {
      expect(result.status).toBe('healthy')
      expect(result.checks.read_test).toBe(true)
    })
    
    // Average read time shouldn't be too much worse than single operation
    const avgReadTime = results.reduce((sum, result) => sum + result.response_times.read_ms, 0) / results.length
    expect(avgReadTime).toBeLessThan(500) // Even under load, reads should be < 500ms
  })
})