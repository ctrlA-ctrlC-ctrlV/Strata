/**
 * Analytics events dispatcher wrapper
 * Provides privacy-friendly analytics with PII scrubbing
 */

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean
  endpoint?: string
  debug: boolean
  scrubPii: boolean
}

// Event types and their allowed properties
interface BaseEvent {
  event: string
  timestamp: number
  sessionId: string
  pageUrl: string
  userAgent: string
}

interface PageViewEvent extends BaseEvent {
  event: 'page_view'
  page: string
  referrer?: string
}

interface ConfiguratorEvent extends BaseEvent {
  event: 'configurator_step' | 'configurator_complete' | 'configurator_abandon'
  step?: string
  productType?: string
  configurationId?: string
  estimatedValue?: number
  progress?: number
}

interface QuoteEvent extends BaseEvent {
  event: 'quote_request' | 'quote_submit' | 'quote_error'
  quoteNumber?: string
  productType?: string
  estimatedValue?: number
  errorType?: string
}

interface ContactEvent extends BaseEvent {
  event: 'contact_submit' | 'contact_error'
  source?: string
  errorType?: string
}

interface GalleryEvent extends BaseEvent {
  event: 'gallery_view' | 'gallery_filter' | 'gallery_overlay'
  category?: string
  imageId?: string
}

type AnalyticsEvent = PageViewEvent | ConfiguratorEvent | QuoteEvent | ContactEvent | GalleryEvent

// PII patterns to scrub
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{10,15}\b/g, // Phone numbers
  /\b[A-Z]\d{2}\s?\w{4}\b/g, // Irish Eircode
  /\b\d{1,5}\s+\w+\s+(?:street|st|road|rd|avenue|ave|lane|ln)\b/gi, // Addresses
  /\b(?:visa|mastercard|amex)\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/gi // Credit cards
]

// Block list fields that should never be sent
const BLOCKED_FIELDS = [
  'password', 'creditCard', 'ssn', 'personalId', 'bankAccount',
  'email', 'phone', 'address', 'name', 'firstName', 'lastName'
]

class AnalyticsDispatcher {
  private config: AnalyticsConfig
  private sessionId: string
  private eventQueue: AnalyticsEvent[] = []
  private initialized = false

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      scrubPii: true,
      ...config
    }
    
    this.sessionId = this.generateSessionId()
    
    if (this.config.enabled) {
      this.initialize()
    }
  }

  private initialize(): void {
    if (this.initialized) return
    
    // Check for consent (basic implementation)
    const hasConsent = this.checkConsent()
    if (!hasConsent) {
      this.config.enabled = false
      return
    }

    // Set up periodic flush
    setInterval(() => this.flush(), 30000) // Flush every 30 seconds
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush())
    
    this.initialized = true
    
    if (this.config.debug) {
      console.log('Analytics dispatcher initialized', this.config)
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    return `${timestamp}-${random}`
  }

  private checkConsent(): boolean {
    // Basic consent check - in production, integrate with cookie consent solution
    const consent = localStorage.getItem('analytics-consent')
    return consent === 'granted'
  }

  private scrubPiiFromValue(value: any): any {
    if (typeof value !== 'string') return value
    
    let scrubbed = value
    PII_PATTERNS.forEach(pattern => {
      scrubbed = scrubbed.replace(pattern, '[REDACTED]')
    })
    
    return scrubbed
  }

  private scrubEvent(event: any): any {
    const scrubbed = { ...event }
    
    // Remove blocked fields
    BLOCKED_FIELDS.forEach(field => {
      if (field in scrubbed) {
        delete scrubbed[field]
      }
    })
    
    // Scrub PII from all string values
    if (this.config.scrubPii) {
      Object.keys(scrubbed).forEach(key => {
        scrubbed[key] = this.scrubPiiFromValue(scrubbed[key])
      })
    }
    
    return scrubbed
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.enabled || events.length === 0) return
    
    try {
      // In production, send to actual analytics endpoint
      if (this.config.endpoint) {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events })
        })
        
        if (!response.ok) {
          console.warn('Analytics send failed:', response.status)
        }
      }
      
      if (this.config.debug) {
        console.log('Analytics events sent:', events)
      }
    } catch (error) {
      console.warn('Analytics send error:', error)
    }
  }

  private createBaseEvent(): BaseEvent {
    return {
      event: '',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent
    }
  }

  // Public API methods

  track(event: Omit<AnalyticsEvent, keyof BaseEvent>): void {
    if (!this.config.enabled) return
    
    const fullEvent = {
      ...this.createBaseEvent(),
      ...event
    } as AnalyticsEvent
    
    const scrubbedEvent = this.scrubEvent(fullEvent)
    this.eventQueue.push(scrubbedEvent)
    
    if (this.config.debug) {
      console.log('Analytics event queued:', scrubbedEvent)
    }
    
    // Auto-flush for important events
    if (['quote_submit', 'contact_submit', 'configurator_complete'].includes(fullEvent.event)) {
      this.flush()
    }
  }

  pageView(page: string, referrer?: string): void {
    this.track({
      event: 'page_view',
      page,
      referrer
    })
  }

  configuratorStep(step: string, productType?: string, progress?: number): void {
    this.track({
      event: 'configurator_step',
      step,
      productType,
      progress
    })
  }

  configuratorComplete(productType: string, configurationId: string, estimatedValue: number): void {
    this.track({
      event: 'configurator_complete',
      productType,
      configurationId,
      estimatedValue
    })
  }

  configuratorAbandon(step: string, productType?: string, progress?: number): void {
    this.track({
      event: 'configurator_abandon',
      step,
      productType,
      progress
    })
  }

  quoteRequest(productType: string, estimatedValue: number): void {
    this.track({
      event: 'quote_request',
      productType,
      estimatedValue
    })
  }

  quoteSubmit(quoteNumber: string, productType: string, estimatedValue: number): void {
    this.track({
      event: 'quote_submit',
      quoteNumber,
      productType,
      estimatedValue
    })
  }

  quoteError(errorType: string): void {
    this.track({
      event: 'quote_error',
      errorType
    })
  }

  contactSubmit(source?: string): void {
    this.track({
      event: 'contact_submit',
      source
    })
  }

  contactError(errorType: string): void {
    this.track({
      event: 'contact_error',
      errorType
    })
  }

  galleryView(category?: string): void {
    this.track({
      event: 'gallery_view',
      category
    })
  }

  galleryFilter(category: string): void {
    this.track({
      event: 'gallery_filter',
      category
    })
  }

  galleryOverlay(imageId: string, category?: string): void {
    this.track({
      event: 'gallery_overlay',
      imageId,
      category
    })
  }

  flush(): void {
    if (this.eventQueue.length === 0) return
    
    const events = [...this.eventQueue]
    this.eventQueue = []
    
    this.sendEvents(events)
  }

  setConsent(granted: boolean): void {
    localStorage.setItem('analytics-consent', granted ? 'granted' : 'denied')
    this.config.enabled = granted
    
    if (!granted) {
      this.eventQueue = []
    }
  }

  destroy(): void {
    this.flush()
    this.config.enabled = false
    this.eventQueue = []
  }
}

// Global instance
let analyticsInstance: AnalyticsDispatcher | null = null

export function initializeAnalytics(config?: Partial<AnalyticsConfig>): AnalyticsDispatcher {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsDispatcher(config)
  }
  return analyticsInstance
}

export function getAnalytics(): AnalyticsDispatcher | null {
  return analyticsInstance
}

// Convenience functions for common events
export const analytics = {
  pageView: (page: string, referrer?: string) => analyticsInstance?.pageView(page, referrer),
  configuratorStep: (step: string, productType?: string, progress?: number) => 
    analyticsInstance?.configuratorStep(step, productType, progress),
  configuratorComplete: (productType: string, configId: string, value: number) => 
    analyticsInstance?.configuratorComplete(productType, configId, value),
  configuratorAbandon: (step: string, productType?: string, progress?: number) => 
    analyticsInstance?.configuratorAbandon(step, productType, progress),
  quoteRequest: (productType: string, value: number) => 
    analyticsInstance?.quoteRequest(productType, value),
  quoteSubmit: (quoteNumber: string, productType: string, value: number) => 
    analyticsInstance?.quoteSubmit(quoteNumber, productType, value),
  quoteError: (errorType: string) => analyticsInstance?.quoteError(errorType),
  contactSubmit: (source?: string) => analyticsInstance?.contactSubmit(source),
  contactError: (errorType: string) => analyticsInstance?.contactError(errorType),
  galleryView: (category?: string) => analyticsInstance?.galleryView(category),
  galleryFilter: (category: string) => analyticsInstance?.galleryFilter(category),
  galleryOverlay: (imageId: string, category?: string) => 
    analyticsInstance?.galleryOverlay(imageId, category),
  setConsent: (granted: boolean) => analyticsInstance?.setConsent(granted),
  flush: () => analyticsInstance?.flush()
}

export default AnalyticsDispatcher