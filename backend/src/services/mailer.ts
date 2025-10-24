/**
 * Email service for sending quotes, confirmations, and contact submissions
 */

import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'
import { dirname, join, resolve } from 'path'

// Use __dirname for CommonJS compatibility
const currentDir = resolve(dirname(''))

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

interface PriceBreakdownItem {
  category: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unit?: string
  notes?: string
}

interface PriceBreakdown {
  subtotal: number
  vatAmount: number
  vatRate: number
  total: number
  items: PriceBreakdownItem[]
  discounts?: Array<{
    description: string
    amount: number
    type: 'fixed' | 'percentage'
  }>
}

interface QuoteEmailData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerPostcode: string
  quoteNumber: string
  productType: string
  estimatedTotal: string
  configSummary: string
  priceBreakdown?: PriceBreakdown
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
        timestamp: data.timestamp,
        priceBreakdownHtml: data.priceBreakdown ? this.generateBreakdownHtml(data.priceBreakdown) : '',
        priceBreakdownText: data.priceBreakdown ? this.generateBreakdownText(data.priceBreakdown) : ''
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
        customerPhone: data.customerPhone || 'Not provided',
        customerPostcode: data.customerPostcode,
        quoteNumber: data.quoteNumber,
        productType: data.productType,
        estimatedTotal: data.estimatedTotal,
        configSummary: data.configSummary,
        priceBreakdownHtml: data.priceBreakdown ? this.generateBreakdownHtml(data.priceBreakdown) : '',
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
          .breakdown-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; overflow: hidden; }
          .breakdown-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e5e7eb; }
          .breakdown-items { padding: 0; }
          .breakdown-category { border-bottom: 1px solid #f3f4f6; }
          .category-header { background: #f9fafb; padding: 10px 15px; font-weight: 600; color: #374151; }
          .breakdown-item { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #f9fafb; }
          .item-description { flex: 2; }
          .item-quantity { flex: 1; text-align: center; }
          .item-price { flex: 1; text-align: right; font-weight: 500; }
          .breakdown-summary { background: #f8f9fa; padding: 15px; }
          .summary-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .summary-total { font-weight: 600; font-size: 1.1em; border-top: 1px solid #d1d5db; padding-top: 10px; margin-top: 10px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Garden Room Quote</h1>
            <p>Detailed Breakdown & Next Steps</p>
          </div>
          
          <div class="content">
            <p>Dear {{customerName}},</p>
            
            <p>Thank you for your interest in Strata Garden Rooms. Below is your personalized quote breakdown based on your configuration.</p>
            
            <div class="quote-details">
              <h3>Quote Summary</h3>
              <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
              <p><strong>Product Type:</strong> {{productType}}</p>
              <p><strong>Total Investment:</strong> {{estimatedTotal}}</p>
              <p><strong>Configuration:</strong> {{configSummary}}</p>
              <p><strong>Generated:</strong> {{timestamp}}</p>
            </div>

            {{priceBreakdownHtml}}
            
            <h3>What's Included</h3>
            <ul>
              <li>Complete design and planning service</li>
              <li>All materials and components as specified</li>
              <li>Professional installation by certified teams</li>
              <li>Building regulation compliance support</li>
              <li>12-month comprehensive warranty</li>
              <li>Ongoing support and maintenance guidance</li>
            </ul>

            <h3>Important Notes</h3>
            <ul>
              <li>Prices are estimates based on your configuration</li>
              <li>Final pricing may vary based on site conditions</li>
              <li>Installation and delivery charges may apply</li>
              <li>Prices valid for 30 days from quote date</li>
              <li>Planning permission may be required (we can advise)</li>
            </ul>
            
            <h3>Next Steps</h3>
            <ol>
              <li><strong>Site Survey:</strong> We'll arrange a free site visit to confirm details</li>
              <li><strong>Final Quote:</strong> Receive your confirmed pricing and timeline</li>
              <li><strong>Planning Support:</strong> We'll help with any required permissions</li>
              <li><strong>Installation:</strong> Professional build by our certified teams</li>
            </ol>
            
            <p>Our team will contact you within 1 business day to discuss your project and answer any questions.</p>
            
            <p style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
              <strong>Ready to proceed?</strong> Simply reply to this email or call us to schedule your free site survey.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Strata Garden Rooms</strong></p>
            <p>📞 +353 1 XXX XXXX | ✉️ info@stratagarden.ie</p>
            <p>🌐 www.stratagarden.ie</p>
            <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
              Quote Reference: {{quoteNumber}} | Keep this reference for all communications
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getQuoteCustomerTemplateText(): string {
    return `
Your Garden Room Quote - Strata Garden Rooms

Dear {{customerName}},

Thank you for your interest in Strata Garden Rooms. Below is your personalized quote breakdown based on your configuration.

Quote Summary:
- Quote Number: {{quoteNumber}}
- Product Type: {{productType}}
- Total Investment: {{estimatedTotal}}
- Configuration: {{configSummary}}
- Generated: {{timestamp}}

{{priceBreakdownText}}

What's Included:
- Complete design and planning service
- All materials and components as specified
- Professional installation by certified teams
- Building regulation compliance support
- 12-month comprehensive warranty
- Ongoing support and maintenance guidance

Important Notes:
- Prices are estimates based on your configuration
- Final pricing may vary based on site conditions
- Installation and delivery charges may apply
- Prices valid for 30 days from quote date
- Planning permission may be required (we can advise)

Next Steps:
1. Site Survey: We'll arrange a free site visit to confirm details
2. Final Quote: Receive your confirmed pricing and timeline
3. Planning Support: We'll help with any required permissions
4. Installation: Professional build by our certified teams

Our team will contact you within 1 business day to discuss your project and answer any questions.

Ready to proceed? Simply reply to this email or call us to schedule your free site survey.

Strata Garden Rooms
Phone: +353 1 XXX XXXX | Email: info@stratagarden.ie
Website: www.stratagarden.ie

Quote Reference: {{quoteNumber}} | Keep this reference for all communications
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
              <p><strong>Phone:</strong> {{customerPhone}}</p>
              <p><strong>Postcode:</strong> {{customerPostcode}}</p>
              
              <h3>Quote Details</h3>
              <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
              <p><strong>Product Type:</strong> {{productType}}</p>
              <p><strong>Estimated Total:</strong> {{estimatedTotal}}</p>
              <p><strong>Configuration:</strong> {{configSummary}}</p>
              <p><strong>Submitted:</strong> {{timestamp}}</p>
            </div>

            {{priceBreakdownHtml}}
            
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

  private generateBreakdownHtml(breakdown: PriceBreakdown): string {
    if (!breakdown.items || breakdown.items.length === 0) {
      return ''
    }

    // Group items by category
    const categorizedItems = breakdown.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, PriceBreakdownItem[]>)

    const categoryHtml = Object.entries(categorizedItems).map(([category, items]) => {
      const categorySubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
      
      const itemsHtml = items.map(item => `
        <div class="breakdown-item">
          <div class="item-description">
            <strong>${item.description}</strong>
            ${item.notes ? `<br><small style="color: #6b7280;">${item.notes}</small>` : ''}
          </div>
          <div class="item-quantity">${item.quantity} ${item.unit || 'item(s)'}</div>
          <div class="item-price">£${item.totalPrice.toLocaleString()}</div>
        </div>
      `).join('')

      return `
        <div class="breakdown-category">
          <div class="category-header">${category}</div>
          ${itemsHtml}
          <div class="breakdown-item" style="font-weight: 600; background: #f9fafb;">
            <div class="item-description">${category} Subtotal</div>
            <div class="item-quantity"></div>
            <div class="item-price">£${categorySubtotal.toLocaleString()}</div>
          </div>
        </div>
      `
    }).join('')

    const discountsHtml = breakdown.discounts && breakdown.discounts.length > 0 
      ? breakdown.discounts.map(discount => `
          <div class="summary-line" style="color: #dc2626;">
            <span>${discount.description}</span>
            <span>-£${discount.amount.toLocaleString()}</span>
          </div>
        `).join('')
      : ''

    return `
      <div class="breakdown-section">
        <div class="breakdown-header">
          <h3 style="margin: 0;">Detailed Price Breakdown</h3>
        </div>
        <div class="breakdown-items">
          ${categoryHtml}
        </div>
        <div class="breakdown-summary">
          <div class="summary-line">
            <span>Subtotal (ex VAT)</span>
            <span>£${breakdown.subtotal.toLocaleString()}</span>
          </div>
          ${discountsHtml}
          <div class="summary-line">
            <span>VAT (${(breakdown.vatRate * 100).toFixed(0)}%)</span>
            <span>£${breakdown.vatAmount.toLocaleString()}</span>
          </div>
          <div class="summary-line summary-total">
            <span><strong>Total Investment</strong></span>
            <span><strong>£${breakdown.total.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>
    `
  }

  private generateBreakdownText(breakdown: PriceBreakdown): string {
    if (!breakdown.items || breakdown.items.length === 0) {
      return 'Detailed breakdown not available'
    }

    // Group items by category
    const categorizedItems = breakdown.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, PriceBreakdownItem[]>)

    let text = 'DETAILED PRICE BREAKDOWN:\n\n'

    // Add each category
    Object.entries(categorizedItems).forEach(([category, items]) => {
      text += `${category.toUpperCase()}:\n`
      text += ''.padEnd(category.length + 1, '-') + '\n'
      
      items.forEach(item => {
        const qty = `${item.quantity} ${item.unit || 'item(s)'}`
        const price = `£${item.totalPrice.toLocaleString()}`
        text += `  ${item.description.padEnd(30)} ${qty.padStart(8)} ${price.padStart(12)}\n`
        if (item.notes) {
          text += `    (${item.notes})\n`
        }
      })

      const categorySubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
      text += `  ${''.padEnd(30)} ${''.padStart(8)} ${''.padStart(12, '-')}\n`
      text += `  ${(category + ' Subtotal').padEnd(30)} ${''.padStart(8)} £${categorySubtotal.toLocaleString().padStart(11)}\n\n`
    })

    // Add summary
    text += 'SUMMARY:\n'
    text += '--------\n'
    text += `Subtotal (ex VAT): £${breakdown.subtotal.toLocaleString()}\n`
    
    if (breakdown.discounts && breakdown.discounts.length > 0) {
      breakdown.discounts.forEach(discount => {
        text += `${discount.description}: -£${discount.amount.toLocaleString()}\n`
      })
    }
    
    text += `VAT (${(breakdown.vatRate * 100).toFixed(0)}%): £${breakdown.vatAmount.toLocaleString()}\n`
    text += ''.padEnd(40, '=') + '\n'
    text += `TOTAL INVESTMENT: £${breakdown.total.toLocaleString()}\n`

    return text
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

// Export interfaces for use in other modules
export type { PriceBreakdown, PriceBreakdownItem, QuoteEmailData }

// Export singleton instance
export const mailerService = new MailerService()
export default mailerService