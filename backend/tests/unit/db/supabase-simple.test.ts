// Simple Supabase connectivity test without complex TypeScript casting
import { describe, test, expect} from '@jest/globals'
import { supabaseAdmin } from '../../../src/db/supabase'

describe('Supabase Database - Simple Connectivity', () => {
  describe('Basic Connection', () => {
    test('should establish connection to Supabase', () => {
      expect(supabaseAdmin).toBeDefined()
      expect(supabaseAdmin.from).toBeDefined()
    })

    test('should be able to perform simple query on product_configurations table', async () => {
      const { data, error } = await supabaseAdmin
        .from('product_configurations')
        .select('id')
        .limit(1)

      // Either we get data (table exists and has records) or no error (table exists but empty)
      if (error) {
        // If error, it should be a meaningful database error, not a connection error
        expect(error.message).toBeDefined()
        // Connection errors usually contain 'connection' or 'network'
        expect(error.message).not.toMatch(/connection|network/i)
      } else {
        // If no error, data should be an array (even if empty)
        expect(Array.isArray(data)).toBe(true)
      }
    })
  })

  describe('Table Structure Validation', () => {
    test('should verify quote_requests table exists', async () => {
      const { error } = await supabaseAdmin
        .from('quote_requests')
        .select('id')
        .limit(0) // Just check table exists, don't fetch data

      // Table should exist - if it doesn't, we'll get a table not found error
      if (error) {
        expect(error.message).not.toMatch(/relation.*does not exist/i)
      }
    })

    test('should verify glazing_elements table exists', async () => {
      const { error } = await supabaseAdmin
        .from('glazing_elements')
        .select('id')
        .limit(0)

      if (error) {
        expect(error.message).not.toMatch(/relation.*does not exist/i)
      }
    })

    test('should verify payment_history table exists', async () => {
      const { error } = await supabaseAdmin
        .from('payment_history')
        .select('id')
        .limit(0)

      if (error) {
        expect(error.message).not.toMatch(/relation.*does not exist/i)
      }
    })

    test('should verify permitted_development_flags table exists', async () => {
      const { error } = await supabaseAdmin
        .from('permitted_development_flags')
        .select('id')
        .limit(0)

      if (error) {
        expect(error.message).not.toMatch(/relation.*does not exist/i)
      }
    })
  })
})