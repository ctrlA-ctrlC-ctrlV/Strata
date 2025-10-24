import express from 'express'
import { z } from 'zod'
import { QuoteRequestSchema, ConfiguratorQuoteFormSchema } from '../services/validation.js'
import { sendQuoteEmail } from '../services/mailer.js'
import { QuotesService } from '../services/quotes.js'
import path from 'path'
import type { 
  CreateProductConfigurationInput,
  CreateQuoteRequestInput,
  Customer
} from '../types/entities.js'

const router = express.Router()

// Initialize service layer
const quotesService = new QuotesService()

/**
 * POST /api/quotes
 * Handle quote request submissions (supports both configurator and simple forms)
 */
router.post('/quotes', async (req, res) => {
  try {
    // Check if this is a configurator quote (has configurator-specific fields)
    const isConfiguratorQuote = req.body.hasOwnProperty('includeVat') && 
                               req.body.hasOwnProperty('basePrice') &&
                               req.body.hasOwnProperty('configurationData')
    
    if (isConfiguratorQuote) {
      // Handle configurator quote submission
      return await handleConfiguratorQuote(req, res)
    } else {
      // Handle simple quote form submission
      return await handleSimpleQuote(req, res)
    }
    
  } catch (error) {
    console.error('Quote submission error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred processing your quote request. Please try again.'
    })
  }
})

/**
 * Handle configurator quote submission
 */
async function handleConfiguratorQuote(req: express.Request, res: express.Response) {
  try {
    // Validate configurator quote data
    const quoteData = ConfiguratorQuoteFormSchema.parse(req.body)
    
    // Parse configuration data
    let parsedConfig: any = {}
    try {
      parsedConfig = JSON.parse(quoteData.configurationData)
    } catch (error) {
      console.error('Failed to parse configuration data:', error)
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration data format'
      })
    }

    // Create product configuration
    const configurationInput: CreateProductConfigurationInput = {
      productType: parsedConfig.productType || 'garden-room',
      size: {
        widthM: parsedConfig.size?.widthM || 0,
        depthM: parsedConfig.size?.depthM || 0,
        heightM: parsedConfig.size?.heightM || 2.5
      },
      cladding: {
        areaSqm: parsedConfig.cladding?.areaSqm || 0
      },
      bathroom: {
        half: parsedConfig.bathroom?.half || 0,
        threeQuarter: parsedConfig.bathroom?.threeQuarter || 0
      },
      electrical: {
        switches: parsedConfig.electrical?.switches || 0,
        sockets: parsedConfig.electrical?.sockets || 0,
        downlight: parsedConfig.electrical?.downlight || 0,
        heater: parsedConfig.electrical?.heater,
        undersinkHeater: parsedConfig.electrical?.undersinkHeater,
        elecBoiler: parsedConfig.electrical?.elecBoiler
      },
      internalDoors: parsedConfig.internalDoors || 0,
      internalWall: {
        finish: parsedConfig.internalWall?.finish || 'none',
        areaSqM: parsedConfig.internalWall?.areaSqM
      },
      heaters: parsedConfig.heaters || 0,
      glazing: {
        windows: parsedConfig.glazing?.windows || [],
        externalDoors: parsedConfig.glazing?.externalDoors || [],
        skylights: parsedConfig.glazing?.skylights || []
      },
      floor: {
        type: parsedConfig.floor?.type || 'none',
        areaSqM: parsedConfig.floor?.areaSqM || 0
      },
      delivery: {
        distanceKm: parsedConfig.delivery?.distanceKm,
        cost: parsedConfig.delivery?.cost || 0
      },
      extras: {
        espInsulation: parsedConfig.extras?.espInsulation,
        render: parsedConfig.extras?.render,
        steelDoor: parsedConfig.extras?.steelDoor,
        other: parsedConfig.extras?.other || []
      },
      estimate: {
        currency: 'EUR',
        subtotalExVat: quoteData.basePrice || 0,
        vatRate: quoteData.includeVat ? 0.23 : 0,
        totalIncVat: quoteData.totalPrice || 0
      },
      notes: `Configurator quote - ${quoteData.source || 'web'}`,
      permittedDevelopmentFlags: parsedConfig.permittedDevelopmentFlags || []
    }

    // Create the product configuration
    const configResult = await quotesService.createProductConfiguration(configurationInput)
    
    if (!configResult.success || !configResult.data) {
      console.error('Failed to create product configuration:', configResult.error)
      return res.status(configResult.error?.httpStatus || 500).json({
        success: false,
        message: configResult.error?.message || 'Failed to create configuration'
      })
    }

    // Create customer data
    const customer: Customer = {
      firstName: quoteData.firstName,
      lastName: quoteData.lastName,
      email: quoteData.email,
      phone: { countryPrefix: '+353', phoneNum: quoteData.phone },
      addressLine1: quoteData.address,
      addressLine2: undefined,
      town: quoteData.city,
      county: quoteData.county,
      eircode: quoteData.eircode
    }

    // Create quote request
    const quoteRequestInput: CreateQuoteRequestInput = {
      configurationId: configResult.data.id,
      customer,
      payment: {
        status: 'pre-quote',
        totalPaid: 0,
        expectedInstallments: null
      },
      retention: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      requestedAt: new Date().toISOString()
    }

    // Save quote request to database
    const quoteResult = await quotesService.createQuoteRequest(quoteRequestInput)
    
    if (!quoteResult.success || !quoteResult.data) {
      console.error('Failed to create quote request:', quoteResult.error)
      return res.status(quoteResult.error?.httpStatus || 500).json({
        success: false,
        message: quoteResult.error?.message || 'Failed to create quote request'
      })
    }
    
    // Send confirmation email to customer
    await sendQuoteEmail({
      to: quoteData.email,
      type: 'quote_confirmation',
      data: {
        quoteNumber: quoteResult.data.id.slice(-8).toUpperCase(), // Use last 8 chars of UUID as quote number
        firstName: quoteData.firstName,
        lastName: quoteData.lastName,
        projectType: 'garden-room', // Default for configurator
        sizeWidth: parsedConfig.size?.widthM || 0,
        sizeDepth: parsedConfig.size?.depthM || 0,
        description: `Configurator quote - €${quoteData.totalPrice} ${quoteData.includeVat ? 'inc VAT' : 'ex VAT'}`,
        features: [] // Features will be in configuration data
      }
    })
    
    // Send notification to internal team
    await sendQuoteEmail({
      to: process.env.INTERNAL_EMAIL || 'quotes@stratagarden.ie',
      type: 'quote_notification',
      data: quoteResult.data
    })
    
    // Return JSON response for configurator
    return res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      quoteId: quoteResult.data.id,
      configId: configResult.data.id,
      estimatedResponse: '24-48 hours'
    })
    
  } catch (error) {
    console.error('Configurator quote submission error:', error)
    
    if (error instanceof z.ZodError) {
      // Return validation errors for configurator
      const fieldErrors: Record<string, string> = {}
      error.errors.forEach(err => {
        const fieldName = err.path.join('.')
        fieldErrors[fieldName] = err.message
      })
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed: ' + error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
        errors: fieldErrors
      })
    }
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred processing your quote request. Please try again.'
    })
  }
}

/**
 * Handle simple quote form submission (existing logic)
 */
async function handleSimpleQuote(req: express.Request, res: express.Response) {
  try {
    // Validate request body
    const quoteData = QuoteRequestSchema.parse(req.body)
    
    // Create basic product configuration for simple quote
    const configurationInput: CreateProductConfigurationInput = {
      productType: quoteData.projectType === 'house-extension' ? 'house-extension' :
                   quoteData.projectType === 'house-build' ? 'house-build' : 'garden-room',
      size: {
        widthM: quoteData.sizeWidth || 4,
        depthM: quoteData.sizeDepth || 3,
        heightM: 2.5
      },
      cladding: {
        areaSqm: (quoteData.sizeWidth || 4) * (quoteData.sizeDepth || 3) * 4 // Rough estimate
      },
      bathroom: {
        half: 0,
        threeQuarter: 0
      },
      electrical: {
        switches: 2,
        sockets: 4,
        downlight: 4
      },
      internalDoors: 1,
      internalWall: {
        finish: 'panel',
        areaSqM: 20
      },
      heaters: 1,
      glazing: {
        windows: [{ elementType: 'window', widthM: 1.2, heightM: 1.5 }],
        externalDoors: [{ elementType: 'external_door', widthM: 0.9, heightM: 2.1 }],
        skylights: []
      },
      floor: {
        type: 'wooden',
        areaSqM: (quoteData.sizeWidth || 4) * (quoteData.sizeDepth || 3)
      },
      delivery: {
        distanceKm: 50, // Default estimate
        cost: 500 // Default estimate
      },
      extras: {
        other: []
      },
      estimate: {
        currency: 'EUR',
        subtotalExVat: 25000, // Default estimate
        vatRate: 0.23,
        totalIncVat: 30750 // Default estimate
      },
      notes: `Simple quote request: ${quoteData.description || 'No description provided'}`,
      permittedDevelopmentFlags: []
    }

    // Create the product configuration
    const configResult = await quotesService.createProductConfiguration(configurationInput)
    
    if (!configResult.success || !configResult.data) {
      console.error('Failed to create product configuration:', configResult.error)
      return res.status(configResult.error?.httpStatus || 500).json({
        success: false,
        message: configResult.error?.message || 'Failed to create configuration'
      })
    }

    // Create customer data
    const customer: Customer = {
      firstName: quoteData.firstName,
      lastName: quoteData.lastName,
      email: quoteData.email,
      phone: { countryPrefix: '+353', phoneNum: quoteData.phone },
      addressLine1: quoteData.address || '',
      addressLine2: undefined,
      town: undefined,
      county: quoteData.county,
      eircode: quoteData.eircode
    }

    // Create quote request
    const quoteRequestInput: CreateQuoteRequestInput = {
      configurationId: configResult.data.id,
      customer,
      payment: {
        status: 'pre-quote',
        totalPaid: 0,
        expectedInstallments: null
      },
      retention: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      requestedAt: new Date().toISOString()
    }

    // Save quote request to database
    const quoteResult = await quotesService.createQuoteRequest(quoteRequestInput)
    
    if (!quoteResult.success || !quoteResult.data) {
      console.error('Failed to create quote request:', quoteResult.error)
      return res.status(quoteResult.error?.httpStatus || 500).json({
        success: false,
        message: quoteResult.error?.message || 'Failed to create quote request'
      })
    }
    
    // Send confirmation email to customer
    const quoteNumber = quoteResult.data.id.slice(-8).toUpperCase()
    
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
      data: quoteResult.data
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
        quoteNumber: quoteResult.data.id,
        configId: configResult.data.id,
        estimatedResponse: '24-48 hours'
      })
    }
    
  } catch (error) {
    console.error('Simple quote submission error:', error)
    
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
          error: 'Validation failed: ' + error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', '),
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
}

/**
 * GET /api/quotes/:id
 * Retrieve quote status (for customer reference)
 */
router.get('/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Basic UUID validation - return 400 only for clearly malformed UUIDs
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quote ID format'
      })
    }
    
    const result = await quotesService.getCompleteQuoteRequest(id)
    
    if (!result.success || !result.data) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      })
    }
    
    // Return limited public information
    const quote = result.data.quoteRequest
    return res.json({
      success: true,
      quote: {
        id: quote.id,
        status: quote.payment.status,
        createdAt: quote.requestedAt,
        customer: quote.customer,
        configuration: {
          id: result.data.configuration.id,
          productType: result.data.configuration.productType,
          estimate: result.data.configuration.estimate
        }
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

/**
 * GET /api/quotes/:id/status
 * Get quote status for the frontend API client
 */
router.get('/quotes/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    
    // Basic UUID validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quote ID format'
      })
    }
    
    const result = await quotesService.getQuoteRequest(id)
    
    if (!result.success || !result.data) {
      return res.status(result.error?.httpStatus || 404).json({
        success: false,
        message: result.error?.message || 'Quote not found'
      })
    }
    
    const quote = result.data
    
    // Return status information for API client
    return res.json({
      status: quote.payment.status,
      lastUpdated: quote.payment.updatedAt,
      details: {
        id: quote.id,
        configurationId: quote.configurationId,
        requestedAt: quote.requestedAt
      }
    })
    
  } catch (error) {
    console.error('Quote status lookup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving quote status'
    })
  }
})

export default router