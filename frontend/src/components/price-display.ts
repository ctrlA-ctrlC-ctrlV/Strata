/**
 * Price Display Component
 * Real-time price calculation with VAT toggle for configurator
 */

import { calculatePriceEstimate, type ProductConfiguration, type PriceEstimate } from '../lib/price.js'

export interface PriceDisplayConfig {
  container: HTMLElement
  vatToggle: boolean
  showBreakdown: boolean
  showVatToggle: boolean
  onPriceUpdate?: (estimate: PriceEstimate) => void
}

/**
 * Price Display Component
 * Manages real-time price updates and VAT toggle
 */
export class PriceDisplay {
  private container: HTMLElement
  private config: PriceDisplayConfig
  private currentEstimate: PriceEstimate | null = null
  private includeVat: boolean

  constructor(config: PriceDisplayConfig) {
    this.container = config.container
    this.config = config
    this.includeVat = config.vatToggle
    this.render()
    this.attachEventListeners()
  }

  /**
   * Update price based on new configuration
   */
  public updatePrice(productConfig: ProductConfiguration): void {
    try {
      this.currentEstimate = calculatePriceEstimate(productConfig, this.includeVat)
      this.render()
      
      if (this.config.onPriceUpdate) {
        this.config.onPriceUpdate(this.currentEstimate)
      }
    } catch (error) {
      console.error('Error calculating price:', error)
      this.renderError()
    }
  }

  /**
   * Toggle VAT inclusion
   */
  public toggleVat(includeVat: boolean): void {
    this.includeVat = includeVat
    if (this.currentEstimate) {
      // Recalculate with new VAT setting
      this.render()
    }
  }

  /**
   * Get current price estimate
   */
  public getCurrentEstimate(): PriceEstimate | null {
    return this.currentEstimate
  }

  /**
   * Get display total based on VAT setting
   */
  public getDisplayTotal(): number {
    if (!this.currentEstimate) return 0
    return this.includeVat ? this.currentEstimate.totalIncVat : this.currentEstimate.subtotalExVat
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Render the price display
   */
  private render(): void {
    if (!this.currentEstimate) {
      this.container.innerHTML = `
        <div class="price-display" aria-live="polite">
          <div class="price-display__placeholder">
            <div class="price-display__label">Estimated Price</div>
            <div class="price-display__amount">Configure options to see price</div>
          </div>
        </div>
      `
      return
    }

    const displayAmount = this.getDisplayTotal()
    const vatLabel = this.includeVat ? 'inc. VAT' : 'ex. VAT'
    const vatInfo = this.includeVat 
      ? `Includes €${this.formatCurrency(this.currentEstimate.vatAmount).replace('€', '')} VAT (${Math.round(this.currentEstimate.vatRate * 100)}%)`
      : `Plus €${this.formatCurrency(this.currentEstimate.vatAmount).replace('€', '')} VAT (${Math.round(this.currentEstimate.vatRate * 100)}%)`

    const html = `
      <div class="price-display" aria-live="polite">
        <div class="price-display__main">
          <div class="price-display__label">Estimated Price</div>
          <div class="price-display__amount">${this.formatCurrency(displayAmount)}</div>
          <div class="price-display__vat-info">${vatLabel}</div>
        </div>
        
        ${this.config.showVatToggle ? this.renderVatToggle() : ''}
        
        <div class="price-display__details">
          <div class="price-display__vat-breakdown">${vatInfo}</div>
          ${this.includeVat ? 
            `<div class="price-display__subtotal">Subtotal: ${this.formatCurrency(this.currentEstimate.subtotalExVat)}</div>` : 
            `<div class="price-display__total">Total inc. VAT: ${this.formatCurrency(this.currentEstimate.totalIncVat)}</div>`
          }
        </div>

        ${this.config.showBreakdown ? this.renderBreakdown() : ''}
      </div>
    `

    this.container.innerHTML = html
    this.attachEventListeners()
  }

  /**
   * Render VAT toggle control
   */
  private renderVatToggle(): string {
    return `
      <div class="price-display__vat-toggle">
        <div class="vat-toggle" role="radiogroup" aria-labelledby="vat-toggle-label">
          <div id="vat-toggle-label" class="vat-toggle__label">Price Display</div>
          <div class="vat-toggle__options">
            <label class="vat-toggle__option">
              <input type="radio" name="vat-mode" value="inclusive" 
                     ${this.includeVat ? 'checked' : ''} 
                     aria-describedby="vat-inclusive-desc">
              <span class="vat-toggle__text">Inc. VAT</span>
              <span id="vat-inclusive-desc" class="sr-only">Show prices including VAT</span>
            </label>
            <label class="vat-toggle__option">
              <input type="radio" name="vat-mode" value="exclusive" 
                     ${!this.includeVat ? 'checked' : ''} 
                     aria-describedby="vat-exclusive-desc">
              <span class="vat-toggle__text">Ex. VAT</span>
              <span id="vat-exclusive-desc" class="sr-only">Show prices excluding VAT</span>
            </label>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render price breakdown
   */
  private renderBreakdown(): string {
    if (!this.currentEstimate) return ''

    const breakdown = this.currentEstimate.breakdown
    const items = [
      { label: 'Base Structure', amount: breakdown.base },
      { label: 'Cladding', amount: breakdown.cladding },
      { label: 'Windows & Doors', amount: breakdown.glazing },
      { label: 'Bathroom', amount: breakdown.bathroom },
      { label: 'Electrical', amount: breakdown.electrical },
      { label: 'Internal Finishes', amount: breakdown.internal },
      { label: 'Flooring', amount: breakdown.flooring },
      { label: 'Delivery', amount: breakdown.delivery },
      { label: 'Extras', amount: breakdown.extras }
    ].filter(item => item.amount > 0)

    return `
      <div class="price-display__breakdown">
        <button class="price-breakdown-toggle" aria-expanded="false" aria-controls="breakdown-details">
          <span>Price Breakdown</span>
          <svg class="breakdown-chevron" viewBox="0 0 16 16" width="16" height="16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        <div id="breakdown-details" class="price-breakdown-details" hidden>
          <div class="breakdown-items">
            ${items.map(item => `
              <div class="breakdown-item">
                <span class="breakdown-label">${item.label}</span>
                <span class="breakdown-amount">${this.formatCurrency(item.amount)}</span>
              </div>
            `).join('')}
            <div class="breakdown-item breakdown-subtotal">
              <span class="breakdown-label">Subtotal (ex. VAT)</span>
              <span class="breakdown-amount">${this.formatCurrency(this.currentEstimate.subtotalExVat)}</span>
            </div>
            <div class="breakdown-item breakdown-vat">
              <span class="breakdown-label">VAT (${Math.round(this.currentEstimate.vatRate * 100)}%)</span>
              <span class="breakdown-amount">${this.formatCurrency(this.currentEstimate.vatAmount)}</span>
            </div>
            <div class="breakdown-item breakdown-total">
              <span class="breakdown-label">Total (inc. VAT)</span>
              <span class="breakdown-amount">${this.formatCurrency(this.currentEstimate.totalIncVat)}</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render error state
   */
  private renderError(): void {
    this.container.innerHTML = `
      <div class="price-display price-display--error" aria-live="assertive">
        <div class="price-display__error">
          <svg class="error-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
          <div class="error-content">
            <div class="error-title">Unable to calculate price</div>
            <div class="error-message">Please check your configuration and try again</div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // VAT toggle listeners
    const vatRadios = this.container.querySelectorAll('input[name="vat-mode"]')
    vatRadios.forEach(radio => {
      radio.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement
        const includeVat = target.value === 'inclusive'
        this.toggleVat(includeVat)
      })
    })

    // Breakdown toggle listener
    const breakdownToggle = this.container.querySelector('.price-breakdown-toggle')
    if (breakdownToggle) {
      breakdownToggle.addEventListener('click', () => {
        const details = this.container.querySelector('#breakdown-details')
        const isExpanded = breakdownToggle.getAttribute('aria-expanded') === 'true'
        
        if (details) {
          details.toggleAttribute('hidden')
          breakdownToggle.setAttribute('aria-expanded', (!isExpanded).toString())
          breakdownToggle.classList.toggle('expanded', !isExpanded)
        }
      })
    }
  }
}

/**
 * Price Watcher
 * Observes configuration changes and updates price display
 */
export class PriceWatcher {
  private priceDisplay: PriceDisplay
  private observers: MutationObserver[] = []

  constructor(priceDisplay: PriceDisplay) {
    this.priceDisplay = priceDisplay
  }

  /**
   * Start watching configuration inputs for changes
   */
  public watchConfigInputs(configContainer: HTMLElement): void {
    // Watch for input changes
    configContainer.addEventListener('input', this.handleConfigChange.bind(this))
    configContainer.addEventListener('change', this.handleConfigChange.bind(this))
    
    // Watch for dynamic content changes
    const observer = new MutationObserver(this.handleMutation.bind(this))
    observer.observe(configContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-selected', 'checked', 'value']
    })
    
    this.observers.push(observer)
  }

  /**
   * Stop watching for changes
   */
  public stopWatching(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * Handle configuration input changes
   */
  private handleConfigChange(_event: Event): void {
    // Debounce updates to avoid excessive calculations
    clearTimeout((this as any).updateTimeout)
    ;(this as any).updateTimeout = setTimeout(() => {
      this.updatePriceFromInputs()
    }, 300)
  }

  /**
   * Handle DOM mutations
   */
  private handleMutation(mutations: MutationRecord[]): void {
    let shouldUpdate = false
    
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' || 
          (mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
        shouldUpdate = true
      }
    })
    
    if (shouldUpdate) {
      this.handleConfigChange(new Event('mutation'))
    }
  }

  /**
   * Extract configuration from form inputs and update price
   */
  private updatePriceFromInputs(): void {
    try {
      const config = this.extractConfigurationFromDOM()
      this.priceDisplay.updatePrice(config)
    } catch (error) {
      console.error('Error extracting configuration:', error)
    }
  }

  /**
   * Extract product configuration from DOM inputs
   */
  private extractConfigurationFromDOM(): ProductConfiguration {
    // This would be implemented based on the actual form structure
    // For now, return a basic configuration - this needs to be customized
    // based on how the configurator components store their state
    
    return {
      productType: 'garden-room',
      size: { widthM: 4, depthM: 3 },
      cladding: { areaSqm: 28.8 },
      bathroom: { half: 0, threeQuarter: 0 },
      electrical: { switches: 1, sockets: 2 },
      internalDoors: 0,
      internalWall: { finish: 'none' },
      heaters: 0,
      glazing: { windows: [], externalDoors: [], skylights: [] },
      floor: { type: 'none', areaSqM: 12 },
      delivery: { cost: 0 },
      extras: { other: [] }
    }
  }
}

/**
 * Utility functions for price integration
 */
export const PriceUtils = {
  /**
   * Create a price display with common settings
   */
  createStandardPriceDisplay(container: HTMLElement): PriceDisplay {
    return new PriceDisplay({
      container,
      vatToggle: true,
      showBreakdown: true,
      showVatToggle: true
    })
  },

  /**
   * Create a simple price display without breakdown
   */
  createSimplePriceDisplay(container: HTMLElement): PriceDisplay {
    return new PriceDisplay({
      container,
      vatToggle: true,
      showBreakdown: false,
      showVatToggle: true
    })
  },

  /**
   * Format price for quick display
   */
  formatQuickPrice(amount: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount)
  }
}

// Types are already exported above with interface declarations