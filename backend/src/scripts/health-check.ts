#!/usr/bin/env tsx

/**
 * Database Health Check Script
 * Validates Supabase connection and basic operations
 */

import { supabase } from '../db/supabase.js'

interface HealthCheckResult {
  timestamp: string
  status: 'healthy' | 'degraded' | 'failed'
  checks: {
    connection: boolean
    basic_query: boolean
    write_test: boolean
    read_test: boolean
  }
  response_times: {
    connection_ms: number
    query_ms: number
    write_ms: number
    read_ms: number
  }
  errors: string[]
}

async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      connection: false,
      basic_query: false,
      write_test: false,
      read_test: false
    },
    response_times: {
      connection_ms: 0,
      query_ms: 0,
      write_ms: 0,
      read_ms: 0
    },
    errors: []
  }

  try {
    // Test 1: Connection Check
    const connectionStart = Date.now()
    const { error: connectionError } = await supabase
      .from('product_configurations')
      .select('count', { count: 'exact', head: true })
    
    result.response_times.connection_ms = Date.now() - connectionStart
    
    if (connectionError) {
      result.errors.push(`Connection failed: ${connectionError.message}`)
    } else {
      result.checks.connection = true
    }

    // Test 2: Basic Query
    const queryStart = Date.now()
    const { data: queryData, error: queryError } = await supabase
      .from('product_configurations')
      .select('id')
      .limit(1)
    
    result.response_times.query_ms = Date.now() - queryStart
    
    if (queryError) {
      result.errors.push(`Query failed: ${queryError.message}`)
    } else {
      result.checks.basic_query = true
    }

    // Test 3: Write Test (Create temporary record)
    const writeStart = Date.now()
    const testConfig = {
      product_type: 'garden-room' as const,
      width_m: 4.0,
      depth_m: 3.0,
      height_m: 2.5,
      cladding_area_sqm: 35.0,
      floor_area_sqm: 12.0,
      delivery_cost: 500.0,
      estimate_currency: 'EUR',
      estimate_subtotal_ex_vat: 15000.0,
      estimate_vat_rate: 0.23,
      estimate_total_inc_vat: 18450.0,
      notes: 'Health check test record'
    }

    const { data: writeData, error: writeError } = await supabase
      .from('product_configurations')
      .insert(testConfig)
      .select('id')
      .single()
    
    result.response_times.write_ms = Date.now() - writeStart
    
    if (writeError) {
      result.errors.push(`Write test failed: ${writeError.message}`)
    } else {
      result.checks.write_test = true

      // Test 4: Read Test (Read back the record we just created)
      const readStart = Date.now()
      const { data: readData, error: readError } = await supabase
        .from('product_configurations')
        .select('*')
        .eq('id', writeData.id)
        .single()
      
      result.response_times.read_ms = Date.now() - readStart
      
      if (readError) {
        result.errors.push(`Read test failed: ${readError.message}`)
      } else {
        result.checks.read_test = true
      }

      // Cleanup: Delete the test record
      await supabase
        .from('product_configurations')
        .delete()
        .eq('id', writeData.id)
    }

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
  }

  // Determine overall status
  const allChecks = Object.values(result.checks)
  const passedChecks = allChecks.filter(Boolean).length
  
  if (passedChecks === allChecks.length) {
    result.status = 'healthy'
  } else if (passedChecks >= allChecks.length / 2) {
    result.status = 'degraded'
  } else {
    result.status = 'failed'
  }

  return result
}

async function main() {
  try {
    console.log('Running Supabase Health Check...')
    console.log('=' .repeat(50))
    
    const result = await performHealthCheck()
    
    // Output results
    console.log(`Health Check Results (${result.timestamp})`)
    console.log(`Overall Status: ${result.status.toUpperCase()}`)
    console.log('')
    
    console.log('Component Health:')
    Object.entries(result.checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌'
      console.log(`  ${icon} ${check.replace('_', ' ')}: ${passed ? 'PASS' : 'FAIL'}`)
    })
    
    console.log('')
    console.log('Response Times:')
    Object.entries(result.response_times).forEach(([operation, time]) => {
      const status = time < 100 ? '🟢' : time < 500 ? '🟡' : '🔴'
      console.log(`  ${status} ${operation.replace('_', ' ')}: ${time}ms`)
    })
    
    if (result.errors.length > 0) {
      console.log('')
      console.log('Errors:')
      result.errors.forEach(error => console.log(`  ❌ ${error}`))
    }
    
    console.log('')
    console.log('=' .repeat(50))
    
    // Exit with appropriate code
    const exitCode = result.status === 'healthy' ? 0 : result.status === 'degraded' ? 1 : 2
    process.exit(exitCode)
    
  } catch (error) {
    console.error('💥 Health check script failed:', error)
    process.exit(3)
  }
}

// Only run if this file is executed directly
// For ES modules, always run main when script is executed
main()

export { performHealthCheck, type HealthCheckResult }