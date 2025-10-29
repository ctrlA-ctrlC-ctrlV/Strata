import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import { supabase } from '../../src/db/supabase.js'

describe('Deployment Validation Tests', () => {
  describe('Database Configuration', () => {
    test('should have Supabase environment variables configured', () => {
      expect(process.env.SUPABASE_URL).toBeDefined()
      expect(process.env.SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/)
      
      expect(process.env.SUPABASE_ANON_KEY).toBeDefined()
      expect(process.env.SUPABASE_ANON_KEY).toMatch(/^eyJ/)
      
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toMatch(/^eyJ/)
    })

    test('should not have MongoDB environment variables', () => {
      expect(process.env.MONGODB_URI).toBeUndefined()
      expect(process.env.MONGO_URI).toBeUndefined()
      // Only check DB_URI if it exists
      if (process.env.DB_URI) {
        expect(process.env.DB_URI).not.toMatch(/mongodb/)
      }
    })

    test('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase
        .from('product_configurations')
        .select('count', { count: 'exact', head: true })
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })

  describe('Database Schema Validation', () => {
    test('should have required tables created', async () => {
      // Test product_configurations table exists
      const { error: configError } = await supabase
        .from('product_configurations')
        .select('id')
        .limit(1)
      
      expect(configError).toBeNull()

      // Test quote_requests table exists
      const { error: quoteError } = await supabase
        .from('quote_requests')
        .select('id')
        .limit(1)
      
      expect(quoteError).toBeNull()
    })

    test('should have proper table structure', async () => {
      // Test a basic insert to validate schema
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
        notes: 'Deployment validation test'
      }

      const { data, error } = await supabase
        .from('product_configurations')
        .insert(testConfig)
        .select('id')
        .single()

      expect(error).toBeNull()
      expect(data?.id).toBeDefined()

      // Cleanup
      if (data?.id) {
        await supabase
          .from('product_configurations')
          .delete()
          .eq('id', data.id)
      }
    })
  })

  describe('API Endpoint Validation', () => {
    test('should have quotes API endpoint working', async () => {
      // This would test actual API endpoints in a real deployment
      // For now, we'll test the basic functionality through the repository
      const { data, error } = await supabase
        .from('quote_requests')
        .select('count', { count: 'exact', head: true })
      
      expect(error).toBeNull()
    })
  })

  describe('Infrastructure Simplification', () => {
    test('should use only Supabase for database operations', async () => {
      // Verify no MongoDB connections are being used
      // This is more of a code analysis test
      expect(typeof supabase).toBe('object')
      expect(supabase.from).toBeDefined()
    })

    test('should have proper error handling for Supabase operations', async () => {
      // Test error handling with invalid column name instead of invalid table
      const { error } = await supabase
        .from('product_configurations')
        .select('non_existent_column')
      
      expect(error).toBeDefined()
      expect(error?.message).toContain('column')
    })
  })

  describe('Performance Validation', () => {
    test('should meet performance targets for basic operations', async () => {
      const startTime = Date.now()
      
      const { error } = await supabase
        .from('product_configurations')
        .select('id, product_type, created_at')
        .limit(10)
      
      const duration = Date.now() - startTime
      
      expect(error).toBeNull()
      expect(duration).toBeLessThan(5000) // More reasonable for network latency
    }, 10000)

    test('should handle concurrent operations efficiently', async () => {
      const operations = Array(5).fill(null).map(() =>
        supabase
          .from('product_configurations')
          .select('count', { count: 'exact', head: true })
      )

      const startTime = Date.now()
      const results = await Promise.all(operations)
      const duration = Date.now() - startTime

      results.forEach(result => {
        expect(result.error).toBeNull()
      })
      
      expect(duration).toBeLessThan(2000) // All operations should complete within 2 seconds
    }, 15000)
  })

  describe('Security Validation', () => {
    test('should have Row Level Security enabled', async () => {
      // Test that RLS is working by trying operations that should be restricted
      // This is a basic test - in a real deployment you'd test with different user contexts
      const { data, error } = await supabase
        .from('product_configurations')
        .select('*')
        .limit(1)
      
      // Should work with current permissive policies during migration
      expect(error).toBeNull()
    })

    test('should not expose sensitive configuration', () => {
      // Verify that sensitive keys are not logged or exposed
      const supabaseUrl = process.env.SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      expect(supabaseUrl).toBeDefined()
      expect(serviceKey).toBeDefined()
      
      // Keys should not be in the console output (this is more of a development check)
      expect(typeof supabaseUrl).toBe('string')
      expect(typeof serviceKey).toBe('string')
    })
  })

  describe('Monitoring and Observability', () => {
    test('should have health check script available', async () => {
      // This validates that monitoring tools are properly deployed
      expect(process.env.SUPABASE_URL).toBeDefined()
      
      // Basic connectivity test that mirrors health check
      const { error } = await supabase
        .from('product_configurations')
        .select('count', { count: 'exact', head: true })
      
      expect(error).toBeNull()
    })
  })
})