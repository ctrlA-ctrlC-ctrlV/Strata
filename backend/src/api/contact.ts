import express from 'express'
import { z } from 'zod'
import { ContactRequestSchema } from '../services/validation.js'
import { sendContactEmail } from '../services/mailer.js'
import path from 'path'

const router = express.Router()

/**
 * POST /api/contact
 * Handle contact form submissions
 */
router.post('/contact', async (req, res) => {
  try {
    // Validate request body
    const contactData = ContactRequestSchema.parse(req.body)
    
    // Send confirmation email to user
    await sendContactEmail({
      to: contactData.email,
      type: 'contact_confirmation',
      data: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        projectType: contactData.projectType,
        message: contactData.message
      }
    })
    
    // Send notification email to internal team
    await sendContactEmail({
      to: process.env.INTERNAL_EMAIL || 'team@stratagarden.ie',
      type: 'contact_notification',
      data: contactData
    })
    
    // Handle different response types based on request
    const acceptsHTML = req.headers.accept?.includes('text/html')
    const isFormSubmission = req.headers['content-type']?.includes('application/x-www-form-urlencoded')
    
    if (acceptsHTML && isFormSubmission) {
      // Server-rendered success page for no-JS fallback
      return res.sendFile(path.join(__dirname, 'views', 'contact-success.html'))
    } else {
      // JSON response for AJAX requests
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We\'ll get back to you within 24 hours.',
        contactId: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    }
    
  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error instanceof z.ZodError) {
      const acceptsHTML = req.headers.accept?.includes('text/html')
      
      if (acceptsHTML) {
        // Redirect back to form with error for no-JS
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Form Error - Strata Garden Rooms</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .back-link { display: inline-block; background: #2D5A3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="error">
              <h2>Please check your form</h2>
              <p>There were some errors with your submission:</p>
              <ul>
                ${error.errors.map(err => `<li>${err.path.join('.')}: ${err.message}</li>`).join('')}
              </ul>
            </div>
            <a href="/contact.html" class="back-link">← Back to Contact Form</a>
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
            <p>We're sorry, but there was an error processing your message. Please try again or contact us directly.</p>
          </div>
          <a href="/contact.html" class="back-link">← Back to Contact Form</a>
        </body>
        </html>
      `)
    } else {
      return res.status(500).json({
        success: false,
        message: 'An error occurred processing your request. Please try again.'
      })
    }
  }
})

export default router