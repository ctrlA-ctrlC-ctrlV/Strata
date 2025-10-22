/**
 * Price Integration Utility
 * Connects price calculation with configurator components
 */

import { PriceDisplay } from '../components/price-display.js'
import type { ProductConfiguration, PriceEstimate } from './price.js'

/**
 * Configuration State Manager
 * Manages the current configuration state and notifies price display
 */
export class ConfigurationState {
  private config: ProductConfiguration
  private priceDisplay: PriceDisplay | null = null
  private listeners: Array<(config: ProductConfiguration) => void> = []

  constructor() {
    // Initialize with default configuration
    this.config = {
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

  /**
   * Set price display instance
   */
  public setPriceDisplay(priceDisplay: PriceDisplay): void {
    this.priceDisplay = priceDisplay
    this.updatePriceDisplay()
  }

  /**
   * Update configuration and notify listeners
   */
  public updateConfiguration(updates: Partial<ProductConfiguration>): void {
    this.config = { ...this.config, ...updates }
    this.notifyListeners()
    this.updatePriceDisplay()
  }

  /**
   * Update specific section of configuration
   */
  public updateSection<K extends keyof ProductConfiguration>(
    section: K, 
    value: ProductConfiguration[K]
  ): void {
    this.config[section] = value
    this.notifyListeners()
    this.updatePriceDisplay()
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): ProductConfiguration {
    return { ...this.config }
  }

  /**
   * Subscribe to configuration changes
   */
  public subscribe(listener: (config: ProductConfiguration) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Update price display
   */
  private updatePriceDisplay(): void {
    if (this.priceDisplay) {
      this.priceDisplay.updatePrice(this.config)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config))
  }
}

/**
 * Price Integration Manager
 * Coordinates between configurator components and price calculation
 */
export class PriceIntegration {
  private configState: ConfigurationState
  private priceDisplay: PriceDisplay
  private initialized = false

  constructor(priceContainer: HTMLElement) {
    this.configState = new ConfigurationState()
    this.priceDisplay = new PriceDisplay({
      container: priceContainer,
      vatToggle: true,
      showBreakdown: true,
      showVatToggle: true,
      onPriceUpdate: (estimate: PriceEstimate) => {
        // Emit custom event for other components to listen
        document.dispatchEvent(new CustomEvent('priceUpdated', { 
          detail: estimate 
        }))
      }
    })
    
    this.configState.setPriceDisplay(this.priceDisplay)
  }

  /**
   * Initialize integration with configurator
   */
  public initialize(): void {
    if (this.initialized) return

    this.setupEventListeners()
    this.setupConfigurationExtraction()
    this.initialized = true
  }

  /**
   * Get configuration state manager
   */
  public getConfigState(): ConfigurationState {
    return this.configState
  }

  /**
   * Get price display instance
   */
  public getPriceDisplay(): PriceDisplay {
    return this.priceDisplay
  }

  /**
   * Update configuration from component data
   */
  public updateFromComponent(componentId: string, data: any): void {
    switch (componentId) {
      case 'size':
        this.updateSizeConfiguration(data)
        break
      case 'openings':
        this.updateOpeningsConfiguration(data)
        break
      case 'cladding':
        this.updateCladdingConfiguration(data)
        break
      case 'bathroom':
        this.updateBathroomConfiguration(data)
        break
      case 'floor':
        this.updateFloorConfiguration(data)
        break
      case 'extras':
        this.updateExtrasConfiguration(data)
        break
      default:
        console.warn(`Unknown component ID: ${componentId}`)
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Listen for configurator component updates
    document.addEventListener('configuratorUpdate', (event: any) => {
      const { componentId, data } = event.detail
      this.updateFromComponent(componentId, data)
    })

    // Listen for size changes
    document.addEventListener('sizeChange', (event: any) => {
      this.updateFromComponent('size', event.detail)
    })

    // Listen for options changes
    document.addEventListener('optionChange', (event: any) => {
      const { category, data } = event.detail
      this.updateFromComponent(category, data)
    })
  }

  /**
   * Setup configuration extraction from form inputs
   */
  private setupConfigurationExtraction(): void {
    // Find all configurator inputs and add change listeners
    const configuratorContainer = document.querySelector('.configurator-container')
    if (!configuratorContainer) return

    const inputs = configuratorContainer.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.extractAndUpdateConfiguration()
      })
    })
  }

  /**
   * Extract configuration from current DOM state
   */
  private extractAndUpdateConfiguration(): void {
    const config: Partial<ProductConfiguration> = {}

    // Extract size configuration
    const widthInput = document.querySelector('[data-config="width"]') as HTMLInputElement
    const depthInput = document.querySelector('[data-config="depth"]') as HTMLInputElement
    if (widthInput?.value && depthInput?.value) {
      config.size = {
        widthM: parseFloat(widthInput.value),
        depthM: parseFloat(depthInput.value)
      }
    }

    // Extract bathroom configuration
    const halfBathrooms = document.querySelectorAll('[data-bathroom="half"]:checked').length
    const threeQuarterBathrooms = document.querySelectorAll('[data-bathroom="three-quarter"]:checked').length
    if (halfBathrooms > 0 || threeQuarterBathrooms > 0) {
      config.bathroom = {
        half: halfBathrooms,
        threeQuarter: threeQuarterBathrooms
      }
    }

    // Extract floor configuration
    const floorType = document.querySelector('[name="floor-type"]:checked') as HTMLInputElement
    if (floorType?.value) {
      const currentConfig = this.configState.getConfiguration()
      config.floor = {
        type: floorType.value as 'none' | 'wooden' | 'tile',
        areaSqM: currentConfig.floor.areaSqM // Keep existing area
      }
    }

    // Update configuration if we found changes
    if (Object.keys(config).length > 0) {
      this.configState.updateConfiguration(config)
    }
  }

  /**
   * Update size configuration
   */
  private updateSizeConfiguration(data: any): void {
    const size = {
      widthM: data.width || data.widthM || 4,
      depthM: data.depth || data.depthM || 3
    }
    
    // Calculate cladding area based on size
    const floorArea = size.widthM * size.depthM
    const wallArea = 2 * (size.widthM + size.depthM) * 2.4 // Assuming 2.4m height
    const claddingArea = wallArea * 1.2 // Add 20% for gables/overlaps

    this.configState.updateConfiguration({
      size,
      cladding: { areaSqm: claddingArea },
      floor: { 
        ...this.configState.getConfiguration().floor,
        areaSqM: floorArea 
      }
    })
  }

  /**
   * Update openings configuration
   */
  private updateOpeningsConfiguration(data: any): void {
    const glazing = {
      windows: data.windows || [],
      externalDoors: data.doors || data.externalDoors || [],
      skylights: data.skylights || []
    }

    this.configState.updateSection('glazing', glazing)
  }

  /**
   * Update cladding configuration
   */
  private updateCladdingConfiguration(data: any): void {
    const cladding = {
      areaSqm: data.areaSqm || this.configState.getConfiguration().cladding.areaSqm
    }

    this.configState.updateSection('cladding', cladding)
  }

  /**
   * Update bathroom configuration
   */
  private updateBathroomConfiguration(data: any): void {
    const bathroom = {
      half: data.half || 0,
      threeQuarter: data.threeQuarter || 0
    }

    this.configState.updateSection('bathroom', bathroom)
  }

  /**
   * Update floor configuration
   */
  private updateFloorConfiguration(data: any): void {
    const floor = {
      type: data.type || 'none',
      areaSqM: data.areaSqM || this.configState.getConfiguration().floor.areaSqM
    }

    this.configState.updateSection('floor', floor)
  }

  /**
   * Update extras configuration
   */
  private updateExtrasConfiguration(data: any): void {
    const extras = {
      espInsulation: data.espInsulation,
      render: data.render,
      steelDoor: data.steelDoor,
      other: data.other || []
    }

    this.configState.updateSection('extras', extras)
  }
}

/**
 * Initialize price integration for a configurator page
 */
export function initializePriceIntegration(priceContainerSelector: string = '#price-display'): PriceIntegration | null {
  const priceContainer = document.querySelector(priceContainerSelector) as HTMLElement
  if (!priceContainer) {
    console.warn(`Price container not found: ${priceContainerSelector}`)
    return null
  }

  const integration = new PriceIntegration(priceContainer)
  integration.initialize()
  
  // Make integration available globally for components
  ;(window as any).priceIntegration = integration
  
  return integration
}

/**
 * Helper functions for components to trigger price updates
 */
export const PriceHelpers = {
  /**
   * Trigger price update from component
   */
  updatePrice(componentId: string, data: any): void {
    document.dispatchEvent(new CustomEvent('configuratorUpdate', {
      detail: { componentId, data }
    }))
  },

  /**
   * Get current price integration instance
   */
  getIntegration(): PriceIntegration | null {
    return (window as any).priceIntegration || null
  },

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
}