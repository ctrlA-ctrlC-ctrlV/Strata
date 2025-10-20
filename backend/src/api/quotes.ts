import express from 'express'
import { z } from 'zod'
import { QuoteRequestSchema } from '../services/validation.js'
import { sendQuoteEmail } from '../services/mailer.js'
import { QuotesRepository } from '../db/repos/quotes.js'
import { connectToMongo } from '../db/mongo.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Initialize repository with database connection
let quotesRepo: QuotesRepository

async function initializeRepo() {
  if (!quotesRepo) {
    const db = await connectToMongo()
    quotesRepo = new QuotesRepository(db)
  }
  return quotesRepo
}

/**
 * POST /api/quotes
 * Handle quote request submissions
 */
router.post('/quotes', async (req, res) => {
  try {
    // Initialize repository
    const repo = await initializeRepo()
    
    // Validate request body
    const quoteData = QuoteRequestSchema.parse(req.body)
    
    // Generate quote number
    const quoteNumber = `STR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create simplified quote request object for basic quote form
    const quoteRequest = {
      quoteNumber,
      configId: '', // Simple quote doesn't have a full config yet - will be generated later
      customer: {
        firstName: quoteData.firstName,
        lastName: quoteData.lastName,
        email: quoteData.email,
        phone: { countryPrefix: '+353', phoneNum: quoteData.phone },
        addressLine1: quoteData.address || '',
        county: quoteData.county,
        eircode: quoteData.eircode
      },
      desiredInstallTimeframe: quoteData.timeframe || 'exploring',
      payment: {
        status: 'pre-quote' as const,
        totalPaid: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        history: []
      },
      retention: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
      submittedAt: new Date()
    }
    
    // Save to database
    await repo.createQuoteRequest(quoteRequest)
    
    // Send confirmation email to customer
    await sendQuoteEmail({
      to: quoteData.email,
      type: 'quote_confirmation',
      data: {
        quoteNumber,
        firstName: quoteData.firstName,
        lastName: quoteData.lastName,
        projectType: quoteData.projectType,
        sizeWidth: quoteData.sizeWidth,
        sizeDepth: quoteData.sizeDepth,
        description: quoteData.description,
        features: quoteData.features || []
      }
    })
    
    // Send notification to internal team
    await sendQuoteEmail({
      to: process.env.INTERNAL_EMAIL || 'quotes@stratagarden.ie',
      type: 'quote_notification',
      data: quoteRequest
    })
    
    // Handle response based on request type
    const acceptsHTML = req.headers.accept?.includes('text/html')
    const isFormSubmission = req.headers['content-type']?.includes('application/x-www-form-urlencoded')
    
    if (acceptsHTML && isFormSubmission) {
      // Server-rendered success page for no-JS fallback
      return res.sendFile(path.join(__dirname, 'views', 'quote-success.html'))
    } else {
      // JSON response for AJAX requests
      return res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully',
        quoteNumber,
        estimatedResponse: '24-48 hours'
      })
    }
    
  } catch (error) {
    console.error('Quote submission error:', error)
    
    if (error instanceof z.ZodError) {
      const acceptsHTML = req.headers.accept?.includes('text/html')
      
      if (acceptsHTML) {
        // Error page for no-JS
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quote Form Error - Strata Garden Rooms</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .back-link { display: inline-block; background: #2D5A3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
              ul { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="error">
              <h2>Please check your quote form</h2>
              <p>There were some errors with your submission:</p>
              <ul>
                ${error.errors.map(err => `<li><strong>${err.path.join('.')}</strong>: ${err.message}</li>`).join('')}
              </ul>
            </div>
            <a href="/quote.html" class="back-link">← Back to Quote Form</a>
          </body>
          </html>
        `)
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please check your form data',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
    }
    
    // Generic error response
    const acceptsHTML = req.headers.accept?.includes('text/html')
    
    if (acceptsHTML) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Strata Garden Rooms</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .back-link { display: inline-block; background: #2D5A3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Something went wrong</h2>
            <p>We're sorry, but there was an error processing your quote request. Please try again or contact us directly.</p>
            <p><strong>Phone:</strong> +353 1 234 5678<br>
            <strong>Email:</strong> quotes@stratagarden.ie</p>
          </div>
          <a href="/quote.html" class="back-link">← Back to Quote Form</a>
        </body>
        </html>
      `)
    } else {
      return res.status(500).json({
        success: false,
        message: 'An error occurred processing your quote request. Please try again.'
      })
    }
  }
})

/**
 * GET /api/quotes/:quoteNumber
 * Retrieve quote status (for customer reference)
 */
router.get('/quotes/:quoteNumber', async (req, res) => {
  try {
    // Initialize repository
    const repo = await initializeRepo()
    
    const { quoteNumber } = req.params
    
    // Basic format validation
    if (!/^STR-\d+-[A-Z0-9]{4}$/.test(quoteNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quote number format'
      })
    }
    
    const quote = await repo.getQuoteRequestByNumber(quoteNumber)
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      })
    }
    
    // Return limited public information
    return res.json({
      success: true,
      quote: {
        quoteNumber: quote.quoteNumber,
        status: quote.payment.status,
        createdAt: quote.submittedAt,
        // Basic quote info - detailed project info would be in the associated config
        hasConfig: !!quote.configId
      }
    })
    
  } catch (error) {
    console.error('Quote lookup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving quote information'
    })
  }
})

export default router