/**
 * Email service for sending quotes, confirmations, and contact submissions
 */

import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface EmailConfig {
  provider: 'smtp' | 'postmark'
  smtp?: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }
  postmark?: {
    apiKey: string
  }
  from: string
  adminEmail: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface QuoteEmailData {
  customerName: string
  customerEmail: string
  quoteNumber: string
  productType: string
  estimatedTotal: string
  configSummary: string
  timestamp: string
}

interface EmailOptions {
  to: string
  type: 'contact_confirmation' | 'contact_notification' | 'quote_confirmation' | 'quote_notification'
  data: any
}

interface ContactEmailData {
  name: string
  email: string
  phone?: string
  address?: string
  message: string
  timestamp: string
  referenceId: string
}

class MailerService {
  private static instance: MailerService | null = null
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig
  private templates: Map<string, EmailTemplate> = new Map()

  constructor() {
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'postmark') || 'smtp',
      smtp: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      postmark: {
        apiKey: process.env.POSTMARK_API_KEY || ''
      },
      from: process.env.EMAIL_FROM || 'noreply@stratagarden.ie',
      adminEmail: process.env.EMAIL_ADMIN || 'admin@stratagarden.ie'
    }

    this.initializeTransporter()
    this.loadTemplates()
  }

  static getInstance(): MailerService {
    if (!MailerService.instance) {
      MailerService.instance = new MailerService()
    }
    return MailerService.instance
  }

  private initializeTransporter(): void {
    if (this.config.provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtp!.host,
        port: this.config.smtp!.port,
        secure: this.config.smtp!.secure,
        auth: {
          user: this.config.smtp!.user,
          pass: this.config.smtp!.pass
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      })
    } else if (this.config.provider === 'postmark') {
      // Postmark configuration would go here
      console.warn('Postmark provider not yet implemented, falling back to SMTP')
      this.initializeTransporter()
    }
  }

  private loadTemplates(): void {
    // Load email templates from files or define inline
    this.templates.set('quote-confirmation-customer', {
      subject: 'Your Garden Room Quote - {{quoteNumber}}',
      html: this.getQuoteCustomerTemplate(),
      text: this.getQuoteCustomerTemplateText()
    })

    this.templates.set('quote-notification-admin', {
      subject: 'New Quote Request - {{quoteNumber}}',
      html: this.getQuoteAdminTemplate(),
      text: this.getQuoteAdminTemplateText()
    })

    this.templates.set('contact-confirmation-customer', {
      subject: 'We\'ve Received Your Message - Strata Garden Rooms',
      html: this.getContactCustomerTemplate(),
      text: this.getContactCustomerTemplateText()
    })

    this.templates.set('contact-notification-admin', {
      subject: 'New Contact Form Submission',
      html: this.getContactAdminTemplate(),
      text: this.getContactAdminTemplateText()
    })
  }

  private replaceTemplateVariables(template: string, data: Record<string, string>): string {
    let result = template
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    switch (options.type) {
      case 'contact_confirmation':
        return this.sendContactConfirmation(options.data)
      case 'contact_notification':
        return this.sendContactNotificationToAdmin(options.data)
      case 'quote_confirmation':
        return this.sendQuoteConfirmation(options.data)
      case 'quote_notification':
        return this.sendQuoteNotificationToAdmin(options.data)
      default:
        throw new Error(`Unknown email type: ${options.type}`)
    }
  }

  async sendQuoteConfirmation(data: QuoteEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const template = this.templates.get('quote-confirmation-customer')
      if (!template) {
        throw new Error('Quote confirmation template not found')
      }

      const templateData = {
        customerName: data.customerName,
        quoteNumber: data.quoteNumber,
        productType: data.productType,
        estimatedTotal: data.estimatedTotal,
        configSummary: data.configSummary,
        timestamp: data.timestamp
      }

      const mailOptions = {
        from: this.config.from,
        to: data.customerEmail,
        subject: this.replaceTemplateVariables(template.subject, templateData),
        html: this.replaceTemplateVariables(template.html, templateData),
        text: this.replaceTemplateVariables(template.text, templateData)
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      // Also send notification to admin
      await this.sendQuoteNotificationToAdmin(data)

      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send quote confirmation:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async sendQuoteNotificationToAdmin(data: QuoteEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const template = this.templates.get('quote-notification-admin')
      if (!template) {
        throw new Error('Quote admin template not found')
      }

      const templateData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        quoteNumber: data.quoteNumber,
        productType: data.productType,
        estimatedTotal: data.estimatedTotal,
        configSummary: data.configSummary,
        timestamp: data.timestamp
      }

      const mailOptions = {
        from: this.config.from,
        to: this.config.adminEmail,
        subject: this.replaceTemplateVariables(template.subject, templateData),
        html: this.replaceTemplateVariables(template.html, templateData),
        text: this.replaceTemplateVariables(template.text, templateData)
      }

      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send quote notification to admin:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async sendContactConfirmation(data: ContactEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const template = this.templates.get('contact-confirmation-customer')
      if (!template) {
        throw new Error('Contact confirmation template not found')
      }

      const templateData = {
        name: data.name,
        referenceId: data.referenceId,
        timestamp: data.timestamp
      }

      const mailOptions = {
        from: this.config.from,
        to: data.email,
        subject: this.replaceTemplateVariables(template.subject, templateData),
        html: this.replaceTemplateVariables(template.html, templateData),
        text: this.replaceTemplateVariables(template.text, templateData)
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      // Also send notification to admin
      await this.sendContactNotificationToAdmin(data)

      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send contact confirmation:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async sendContactNotificationToAdmin(data: ContactEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const template = this.templates.get('contact-notification-admin')
      if (!template) {
        throw new Error('Contact admin template not found')
      }

      const templateData = {
        name: data.name,
        email: data.email,
        phone: data.phone || 'Not provided',
        address: data.address || 'Not provided',
        message: data.message,
        referenceId: data.referenceId,
        timestamp: data.timestamp
      }

      const mailOptions = {
        from: this.config.from,
        to: this.config.adminEmail,
        subject: this.replaceTemplateVariables(template.subject, templateData),
        html: this.replaceTemplateVariables(template.html, templateData),
        text: this.replaceTemplateVariables(template.text, templateData)
      }

      const result = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send contact notification to admin:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false
      }
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email connection test failed:', error)
      return false
    }
  }

  // Template methods
  private getQuoteCustomerTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quote Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .quote-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quote Confirmation</h1>
            <p>Thank you for your interest in Strata Garden Rooms</p>
          </div>
          
          <div class="content">
            <p>Dear {{customerName}},</p>
            
            <p>Thank you for submitting your garden room configuration. We've received your request and our team will prepare a detailed quote for you.</p>
            
            <div class="quote-details">
              <h3>Quote Details</h3>
              <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
              <p><strong>Product Type:</strong> {{productType}}</p>
              <p><strong>Estimated Total:</strong> {{estimatedTotal}}</p>
              <p><strong>Configuration:</strong> {{configSummary}}</p>
              <p><strong>Submitted:</strong> {{timestamp}}</p>
            </div>
            
            <h3>What Happens Next?</h3>
            <ul>
              <li>We'll review your configuration and prepare a detailed quote</li>
              <li>Our team will contact you within 1 business day</li>
              <li>We'll discuss your requirements and answer any questions</li>
              <li>We can arrange a site survey if needed</li>
            </ul>
            
            <p>If you have any immediate questions, please don't hesitate to contact us.</p>
          </div>
          
          <div class="footer">
            <p><strong>Strata Garden Rooms</strong></p>
            <p>Phone: +353 1 XXX XXXX | Email: info@stratagarden.ie</p>
            <p>Your quote reference: {{quoteNumber}}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getQuoteCustomerTemplateText(): string {
    return `
Quote Confirmation - Strata Garden Rooms

Dear {{customerName}},

Thank you for submitting your garden room configuration. We've received your request and our team will prepare a detailed quote for you.

Quote Details:
- Quote Number: {{quoteNumber}}
- Product Type: {{productType}}
- Estimated Total: {{estimatedTotal}}
- Configuration: {{configSummary}}
- Submitted: {{timestamp}}

What Happens Next?
- We'll review your configuration and prepare a detailed quote
- Our team will contact you within 1 business day
- We'll discuss your requirements and answer any questions
- We can arrange a site survey if needed

If you have any immediate questions, please contact us at +353 1 XXX XXXX or info@stratagarden.ie.

Your quote reference: {{quoteNumber}}

Strata Garden Rooms
    `
  }

  private getQuoteAdminTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Quote Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .quote-details { background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Quote Request</h1>
            <p>Quote #{{quoteNumber}}</p>
          </div>
          
          <div class="content">
            <div class="quote-details">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> {{customerName}}</p>
              <p><strong>Email:</strong> {{customerEmail}}</p>
              
              <h3>Quote Details</h3>
              <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
              <p><strong>Product Type:</strong> {{productType}}</p>
              <p><strong>Estimated Total:</strong> {{estimatedTotal}}</p>
              <p><strong>Configuration:</strong> {{configSummary}}</p>
              <p><strong>Submitted:</strong> {{timestamp}}</p>
            </div>
            
            <p><strong>Action Required:</strong> Please review this quote request and contact the customer within 1 business day.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getQuoteAdminTemplateText(): string {
    return `
New Quote Request - Quote #{{quoteNumber}}

Customer Information:
- Name: {{customerName}}
- Email: {{customerEmail}}

Quote Details:
- Quote Number: {{quoteNumber}}
- Product Type: {{productType}}
- Estimated Total: {{estimatedTotal}}
- Configuration: {{configSummary}}
- Submitted: {{timestamp}}

Action Required: Please review this quote request and contact the customer within 1 business day.
    `
  }

  private getContactCustomerTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Message Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .contact-details { background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Message Received</h1>
            <p>Thank you for contacting Strata Garden Rooms</p>
          </div>
          
          <div class="content">
            <p>Dear {{name}},</p>
            
            <p>Thank you for your message. We've received your inquiry and will respond as soon as possible.</p>
            
            <div class="contact-details">
              <h3>Submission Details</h3>
              <p><strong>Reference ID:</strong> {{referenceId}}</p>
              <p><strong>Submitted:</strong> {{timestamp}}</p>
            </div>
            
            <p>Our team typically responds within 1 business day. If you have an urgent inquiry, please call us directly.</p>
          </div>
          
          <div class="footer">
            <p><strong>Strata Garden Rooms</strong></p>
            <p>Phone: +353 1 XXX XXXX | Email: info@stratagarden.ie</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getContactCustomerTemplateText(): string {
    return `
Message Received - Strata Garden Rooms

Dear {{name}},

Thank you for your message. We've received your inquiry and will respond as soon as possible.

Submission Details:
- Reference ID: {{referenceId}}
- Submitted: {{timestamp}}

Our team typically responds within 1 business day. If you have an urgent inquiry, please call us at +353 1 XXX XXXX.

Strata Garden Rooms
    `
  }

  private getContactAdminTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .contact-details { background: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>Reference: {{referenceId}}</p>
          </div>
          
          <div class="content">
            <div class="contact-details">
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> {{name}}</p>
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Phone:</strong> {{phone}}</p>
              <p><strong>Address:</strong> {{address}}</p>
              
              <h3>Message</h3>
              <p>{{message}}</p>
              
              <h3>Submission Details</h3>
              <p><strong>Reference ID:</strong> {{referenceId}}</p>
              <p><strong>Submitted:</strong> {{timestamp}}</p>
            </div>
            
            <p><strong>Action Required:</strong> Please respond to this inquiry within 1 business day.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getContactAdminTemplateText(): string {
    return `
New Contact Form Submission - Reference: {{referenceId}}

Contact Information:
- Name: {{name}}
- Email: {{email}}
- Phone: {{phone}}
- Address: {{address}}

Message:
{{message}}

Submission Details:
- Reference ID: {{referenceId}}
- Submitted: {{timestamp}}

Action Required: Please respond to this inquiry within 1 business day.
    `
  }
}

/**
 * Send contact form emails
 */
export async function sendContactEmail(options: EmailOptions): Promise<void> {
  const mailer = MailerService.getInstance()
  await mailer.sendEmail(options)
}

/**
 * Send quote request emails  
 */
export async function sendQuoteEmail(options: EmailOptions): Promise<void> {
  const mailer = MailerService.getInstance()
  await mailer.sendEmail(options)
}

// Export singleton instance
export const mailerService = new MailerService()
export default mailerService