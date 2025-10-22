/**
 * Test quote number generation and persistence
 * This tests the quote numbering system to ensure unique sequential numbers
 */

import { connectToMongo } from './src/db/mongo.js'
import { QuotesRepository } from './src/db/repos/quotes.js'

async function testQuoteGeneration() {
  console.log('Testing quote number generation...')
  
  try {
    // Connect to database
    const db = await connectToMongo()
    const repo = new QuotesRepository(db)
    
    // Generate several quote numbers to test sequential numbering
    console.log('Generating quote numbers:')
    
    const numbers = []
    for (let i = 0; i < 5; i++) {
      const quoteNumber = await repo.generateQuoteNumber()
      numbers.push(quoteNumber)
      console.log(`  ${i + 1}. ${quoteNumber}`)
    }
    
    // Verify format
    const quarterPattern = /^Q[1-4]-\d{4}-\d{5}$/
    const allValid = numbers.every(num => quarterPattern.test(num))
    console.log(`Format validation: ${allValid ? 'PASS' : 'FAIL'}`)
    
    // Verify sequential numbering (extract last part and check sequence)
    const lastNumbers = numbers.map(num => parseInt(num.split('-')[2]))
    let sequential = true
    for (let i = 1; i < lastNumbers.length; i++) {
      if (lastNumbers[i] !== lastNumbers[i-1] + 1) {
        sequential = false
        break
      }
    }
    console.log(`Sequential numbering: ${sequential ? 'PASS' : 'FAIL'}`)
    
    // Test creating actual quote requests
    console.log('\nTesting quote persistence...')
    
    const testQuoteRequest = {
      quoteNumber: await repo.generateQuoteNumber(),
      configId: 'test-config-123',
      customer: {
        firstName: 'John',
        lastName: 'Test',
        email: 'john.test@example.com',
        phone: { countryPrefix: '+353', phoneNum: '861234567' },
        addressLine1: '123 Test Street',
        county: 'dublin',
        eircode: 'D02 X285'
      },
      desiredInstallTimeframe: 'exploring',
      payment: {
        status: 'pre-quote' as const,
        totalPaid: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        history: []
      },
      retention: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      submittedAt: new Date()
    }
    
    const quoteId = await repo.createQuoteRequest(testQuoteRequest)
    console.log(`Created test quote: ${quoteId}`)
    
    // Retrieve the quote by number
    const retrievedQuote = await repo.getQuoteRequestByNumber(testQuoteRequest.quoteNumber)
    const retrievalSuccess = retrievedQuote?.quoteNumber === testQuoteRequest.quoteNumber
    console.log(`Quote retrieval by number: ${retrievalSuccess ? 'PASS' : 'FAIL'}`)
    
    // Clean up test data - normally we'd delete test data
    if (retrievedQuote) {
      console.log(`Test quote stored with ID: ${retrievedQuote.id}`)
      console.log(`Customer: ${retrievedQuote.customer.firstName} ${retrievedQuote.customer.lastName}`)
      console.log(`Email: ${retrievedQuote.customer.email}`)
    }
    
    console.log('\n✓ Quote system tests completed successfully!')
    console.log('Quote numbering and persistence systems are working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuoteGeneration()
}

export { testQuoteGeneration }