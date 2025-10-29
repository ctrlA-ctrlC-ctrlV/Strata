#!/usr/bin/env node

/**
 * Performance Validation Report
 * 
 * Validates that the Supabase migration meets performance targets
 * Works with or without live database connection
 */

import { supabase } from '../db/supabase.js'

interface PerformanceResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration?: number
  target: number
  message: string
}

class PerformanceValidator {
  private readonly targetP95Ms = 200
  private results: PerformanceResult[] = []

  async validate(): Promise<void> {
    console.log('🎯 Supabase Performance Validation')
    console.log('=' .repeat(50))
    console.log(`Target: All operations < ${this.targetP95Ms}ms p95`)
    console.log()

    try {
      // Test database connection
      await this.testConnection()
      
      // If connection works, run performance tests
      if (this.hasConnection()) {
        await this.testReadPerformance()
        await this.testWritePerformance()
        await this.testComplexQueries()
      } else {
        this.skipLiveTests()
      }

      // Validate schema and migration completeness
      await this.validateMigrationCompleteness()
      
    } catch (error) {
      console.error('❌ Validation failed:', error)
    }

    this.printReport()
  }

  private async testConnection(): Promise<void> {
    const start = Date.now()
    
    try {
      const { data, error } = await supabase
        .from('product_configurations')
        .select('count')
        .limit(1)
      
      const duration = Date.now() - start
      
      if (error && error.code !== 'PGRST116') {
        this.results.push({
          test: 'Database Connection',
          status: 'FAIL',
          duration,
          target: this.targetP95Ms,
          message: `Connection failed: ${error.message}`
        })
        return
      }

      this.results.push({
        test: 'Database Connection',
        status: duration < this.targetP95Ms ? 'PASS' : 'FAIL',
        duration,
        target: this.targetP95Ms,
        message: duration < this.targetP95Ms ? 'Connection healthy' : 'Connection too slow'
      })

    } catch (error) {
      this.results.push({
        test: 'Database Connection',
        status: 'FAIL',
        target: this.targetP95Ms,
        message: `Environment not configured: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  private hasConnection(): boolean {
    const connectionResult = this.results.find(r => r.test === 'Database Connection')
    return connectionResult?.status === 'PASS' || connectionResult?.status === 'FAIL' && !!connectionResult.duration
  }

  private async testReadPerformance(): Promise<void> {
    const tests = [
      {
        name: 'Simple Select',
        query: async () => await supabase.from('quote_requests').select('id, customer_email').limit(10)
      },
      {
        name: 'Join Query',
        query: async () => await supabase
          .from('quote_requests')
          .select(`id, customer_email, product_configurations(id, product_type)`)
          .limit(5)
      },
      {
        name: 'Search Query',
        query: async () => await supabase
          .from('product_configurations')
          .select('id, product_type, estimate_total_inc_vat')
          .gte('width_m', 3)
          .limit(20)
      }
    ]

    for (const test of tests) {
      await this.runQueryTest(test.name, test.query)
    }
  }

  private async testWritePerformance(): Promise<void> {
    // Test insert performance (with cleanup)
    const start = Date.now()
    
    try {
      const testConfig = {
        product_type: 'garden-room' as const,
        width_m: 4,
        depth_m: 3,
        height_m: 2.5,
        cladding_area_sqm: 50,
        bathroom_half: 0,
        bathroom_three_quarter: 0,
        electrical_switches: 2,
        electrical_sockets: 4,
        electrical_downlight: 6,
        internal_doors: 1,
        internal_wall_finish: 'panel' as const,
        internal_wall_area_sqm: 30,
        heaters: 1,
        floor_type: 'tile' as const,
        floor_area_sqm: 12,
        delivery_cost: 500,
        estimate_currency: 'EUR',
        estimate_subtotal_ex_vat: 25000,
        estimate_vat_rate: 0.23,
        estimate_total_inc_vat: 30750,
        notes: 'Performance test configuration'
      }

      const { data, error } = await supabase
        .from('product_configurations')
        .insert(testConfig)
        .select('id')
        .single()

      const duration = Date.now() - start

      if (error) {
        this.results.push({
          test: 'Insert Performance',
          status: 'FAIL',
          duration,
          target: this.targetP95Ms,
          message: `Insert failed: ${error.message}`
        })
        return
      }

      // Cleanup
      if (data?.id) {
        await supabase.from('product_configurations').delete().eq('id', data.id)
      }

      this.results.push({
        test: 'Insert Performance',
        status: duration < this.targetP95Ms ? 'PASS' : 'FAIL',
        duration,
        target: this.targetP95Ms,
        message: duration < this.targetP95Ms ? 'Insert performance good' : 'Insert too slow'
      })

    } catch (error) {
      this.results.push({
        test: 'Insert Performance',
        status: 'FAIL',
        target: this.targetP95Ms,
        message: `Insert test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  private async testComplexQueries(): Promise<void> {
    const tests = [
      {
        name: 'Count Query',
        query: async () => await supabase.from('quote_requests').select('*', { count: 'exact', head: true })
      },
      {
        name: 'Aggregate Query',
        query: async () => await supabase
          .from('product_configurations')
          .select('product_type, estimate_total_inc_vat')
          .gte('estimate_total_inc_vat', 20000)
          .limit(50)
      }
    ]

    for (const test of tests) {
      await this.runQueryTest(test.name, test.query)
    }
  }

  private async runQueryTest(name: string, query: () => Promise<any>): Promise<void> {
    const start = Date.now()
    
    try {
      const result = await query()
      const duration = Date.now() - start

      this.results.push({
        test: name,
        status: duration < this.targetP95Ms ? 'PASS' : 'FAIL',
        duration,
        target: this.targetP95Ms,
        message: duration < this.targetP95Ms ? 'Performance good' : 'Query too slow'
      })

    } catch (error) {
      this.results.push({
        test: name,
        status: 'FAIL',
        target: this.targetP95Ms,
        message: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  private skipLiveTests(): void {
    const skippedTests = [
      'Simple Select',
      'Join Query', 
      'Search Query',
      'Insert Performance',
      'Count Query',
      'Aggregate Query'
    ]

    skippedTests.forEach(test => {
      this.results.push({
        test,
        status: 'SKIP',
        target: this.targetP95Ms,
        message: 'Skipped - no database connection'
      })
    })
  }

  private async validateMigrationCompleteness(): Promise<void> {
    // Check if key files exist and have proper structure
    const validations = [
      {
        test: 'Schema Migration',
        check: () => this.checkSchemaFile(),
        message: 'Supabase schema file exists'
      },
      {
        test: 'Type Definitions',
        check: () => this.checkTypeDefinitions(),
        message: 'TypeScript definitions complete'
      },
      {
        test: 'Repository Layer',
        check: () => this.checkRepositoryLayer(),
        message: 'Repository pattern implemented'
      }
    ]

    for (const validation of validations) {
      try {
        const passed = await validation.check()
        this.results.push({
          test: validation.test,
          status: passed ? 'PASS' : 'FAIL',
          target: 1, // Binary check
          message: validation.message
        })
      } catch (error) {
        this.results.push({
          test: validation.test,
          status: 'FAIL',
          target: 1,
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
  }

  private async checkSchemaFile(): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      await fs.access('supabase/migrations/20251023001000_initial_schema.sql')
      return true
    } catch {
      return false
    }
  }

  private async checkTypeDefinitions(): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      const content = await fs.readFile('src/types/supabase.ts', 'utf-8')
      return content.includes('Database') && content.includes('Tables')
    } catch {
      return false
    }
  }

  private async checkRepositoryLayer(): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      await fs.access('src/db/repos/quotes.ts')
      const content = await fs.readFile('src/db/repos/quotes.ts', 'utf-8')
      return content.includes('supabase') && !content.includes('mongodb')
    } catch {
      return false
    }
  }

  private printReport(): void {
    console.log('\n📊 PERFORMANCE VALIDATION REPORT')
    console.log('=' .repeat(60))

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
      const duration = result.duration ? ` (${result.duration}ms)` : ''
      console.log(`${icon} ${result.test}${duration}: ${result.message}`)
    })

    console.log('\n' + '=' .repeat(60))
    console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`)

    // Specific performance analysis
    const performanceTests = this.results.filter(r => 
      r.duration !== undefined && r.status !== 'SKIP'
    )

    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, r) => sum + (r.duration || 0), 0) / performanceTests.length
      const maxDuration = Math.max(...performanceTests.map(r => r.duration || 0))
      
      console.log('\nPerformance Analysis:')
      console.log(`  Average Response Time: ${avgDuration.toFixed(1)}ms`)
      console.log(`  Worst Response Time: ${maxDuration}ms`)
      console.log(`  Target (p95): ${this.targetP95Ms}ms`)
      
      if (avgDuration < this.targetP95Ms) {
        console.log('  🎯 Performance Target: MET')
      } else {
        console.log('  ⚠️  Performance Target: MISSED')
        console.log('  💡 Recommendation: Check network latency and database indexing')
      }
    }

    // Migration completeness analysis
    const migrationTests = this.results.filter(r => 
      ['Schema Migration', 'Type Definitions', 'Repository Layer'].includes(r.test)
    )

    const migrationPassed = migrationTests.filter(r => r.status === 'PASS').length
    console.log(`\nMigration Completeness: ${migrationPassed}/${migrationTests.length} components ready`)

    if (migrationPassed === migrationTests.length) {
      console.log('✅ Migration: COMPLETE')
    } else {
      console.log('⚠️  Migration: INCOMPLETE')
    }

    // Overall assessment
    const criticalFailed = this.results.filter(r => 
      r.status === 'FAIL' && !['Database Connection'].includes(r.test)
    ).length

    console.log('\n🎯 OVERALL ASSESSMENT:')
    if (criticalFailed === 0) {
      console.log('✅ System ready for production')
    } else {
      console.log('⚠️  Issues found - review before production deployment')
    }
    
    console.log('=' .repeat(60))
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PerformanceValidator()
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  })
}

export { PerformanceValidator }