#!/usr/bin/env node

/**
 * Simple Performance Test
 * 
 * Quick test to verify basic query performance
 */

import { supabase } from '../db/supabase.js'

async function simplePerformanceTest(): Promise<void> {
  console.log('🚀 Running Simple Performance Test...\n')

  try {
    // Test 1: Simple connection test
    console.log('📊 Test 1: Connection Test')
    const connectionStart = Date.now()
    const { data: connectionTest } = await supabase
      .from('product_configurations')
      .select('count')
      .limit(1)
    const connectionTime = Date.now() - connectionStart
    console.log(`   Connection: ${connectionTime}ms`)

    // Test 2: Simple select query
    console.log('📊 Test 2: Simple Select Query')
    const selectStart = Date.now()
    const { data: selectTest } = await supabase
      .from('quote_requests')
      .select('id, customer_email')
      .limit(5)
    const selectTime = Date.now() - selectStart
    console.log(`   Select (5 rows): ${selectTime}ms`)

    // Test 3: Join query
    console.log('📊 Test 3: Join Query')
    const joinStart = Date.now()
    const { data: joinTest } = await supabase
      .from('quote_requests')
      .select(`
        id,
        customer_email,
        product_configurations (
          id,
          product_type
        )
      `)
      .limit(3)
    const joinTime = Date.now() - joinStart
    console.log(`   Join (3 rows): ${joinTime}ms`)

    // Test 4: Count query
    console.log('📊 Test 4: Count Query')
    const countStart = Date.now()
    const { count } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
    const countTime = Date.now() - countStart
    console.log(`   Count: ${countTime}ms (total rows: ${count})`)

    // Summary
    console.log('\n🎯 Performance Summary:')
    console.log(`   Connection: ${connectionTime}ms ${connectionTime < 200 ? '✅' : '❌'}`)
    console.log(`   Simple Select: ${selectTime}ms ${selectTime < 200 ? '✅' : '❌'}`)
    console.log(`   Join Query: ${joinTime}ms ${joinTime < 200 ? '✅' : '❌'}`)
    console.log(`   Count Query: ${countTime}ms ${countTime < 200 ? '✅' : '❌'}`)

    const avgTime = (connectionTime + selectTime + joinTime + countTime) / 4
    console.log(`   Average: ${avgTime.toFixed(1)}ms`)
    
    if (avgTime < 200) {
      console.log('   ✅ Overall: PASS (meets <200ms target)')
    } else {
      console.log('   ❌ Overall: FAIL (exceeds 200ms target)')
      console.log('   💡 Suggestion: Check network latency and database indexing')
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error)
    process.exit(1)
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simplePerformanceTest().catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
}

export { simplePerformanceTest }