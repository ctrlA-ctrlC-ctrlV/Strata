/**
 * Price calculation utility for garden room configurator
 * Handles live price estimates with VAT toggle
 */

export interface ProductSize {
  widthM: number
  depthM: number
}

export interface ProductConfiguration {
  productType: 'garden-room' | 'house-extension' | 'house-build'
  size: ProductSize
  cladding: {
    areaSqm: number
  }
  bathroom: {
    half: number
    threeQuarter: number
  }
  electrical: {
    switches: number
    sockets: number
    heater?: number
    undersinkHeater?: number
    elecBoiler?: number
  }
  internalDoors: number
  internalWall: {
    finish: 'none' | 'panel' | 'skimPaint'
    areaSqM?: number
  }
  heaters: number
  glazing: {
    windows: Array<{ widthM: number; heightM: number }>
    externalDoors: Array<{ widthM: number; heightM: number }>
    skylights: Array<{ widthM: number; heightM: number }>
  }
  floor: {
    type: 'none' | 'wooden' | 'tile'
    areaSqM: number
  }
  delivery: {
    distanceKm?: number
    cost: number
  }
  extras: {
    espInsulation?: number
    render?: number
    steelDoor?: number
    other: Array<{ title: string; cost: number }>
  }
}

export interface PriceEstimate {
  currency: string
  subtotalExVat: number
  vatRate: number
  vatAmount: number
  totalIncVat: number
  breakdown: {
    base: number
    cladding: number
    bathroom: number
    electrical: number
    glazing: number
    internal: number
    flooring: number
    delivery: number
    extras: number
  }
}

// Default pricing catalog (will be replaced by database values in production)
const DEFAULT_PRICING = {
  currency: 'EUR',
  vatRate: 0.23, // 23% VAT for Ireland
  base: {
    baseRatePerM2: 800,
    fixedCharge: 2000,
    defaultHeightM: 2.4
  },
  cladding: {
    ratePerM2: 150
  },
  bathroom: {
    half: 3500,
    threeQuarter: 6000
  },
  electrical: {
    switch: 45,
    doubleSocket: 65,
    heater: 350
  },
  glazing: {
    window: { charge: 200, ratePerM2: 450 },
    externalDoor: { charge: 300, ratePerM2: 550 },
    skylight: { charge: 400, ratePerM2: 650 }
  },
  internal: {
    internalDoorCharge: 250,
    internalWall: {
      none: 0,
      panel: 85,
      skimPaint: 45
    }
  },
  flooring: {
    none: 0,
    wooden: 65,
    tile: 45
  },
  delivery: {
    freeKm: 25,
    ratePerKm: 2.5
  },
  extras: {
    espInstallRatePerM2: 35,
    renderRatePerM2: 55,
    steelDoorCharge: 850
  }
}

/**
 * Calculate total floor area
 */
export function calculateFloorArea(size: ProductSize): number {
  return size.widthM * size.depthM
}

/**
 * Calculate base cost (structure)
 */
export function calculateBaseCost(size: ProductSize): number {
  const floorArea = calculateFloorArea(size)
  return DEFAULT_PRICING.base.fixedCharge + (floorArea * DEFAULT_PRICING.base.baseRatePerM2)
}

/**
 * Calculate cladding cost
 */
export function calculateCladdingCost(config: ProductConfiguration): number {
  return config.cladding.areaSqm * DEFAULT_PRICING.cladding.ratePerM2
}

/**
 * Calculate bathroom cost
 */
export function calculateBathroomCost(config: ProductConfiguration): number {
  let cost = 0
  cost += config.bathroom.half * DEFAULT_PRICING.bathroom.half
  cost += config.bathroom.threeQuarter * DEFAULT_PRICING.bathroom.threeQuarter
  return cost
}

/**
 * Calculate electrical cost
 */
export function calculateElectricalCost(config: ProductConfiguration): number {
  let cost = 0
  const { electrical } = config
  
  cost += electrical.switches * DEFAULT_PRICING.electrical.switch
  cost += electrical.sockets * DEFAULT_PRICING.electrical.doubleSocket
  cost += (electrical.heater || 0) * DEFAULT_PRICING.electrical.heater
  
  return cost
}

/**
 * Calculate glazing cost (windows, doors, skylights)
 */
export function calculateGlazingCost(config: ProductConfiguration): number {
  let cost = 0
  const { glazing } = config
  
  // Windows
  glazing.windows.forEach(window => {
    const area = window.widthM * window.heightM
    cost += DEFAULT_PRICING.glazing.window.charge + (area * DEFAULT_PRICING.glazing.window.ratePerM2)
  })
  
  // External doors
  glazing.externalDoors.forEach(door => {
    const area = door.widthM * door.heightM
    cost += DEFAULT_PRICING.glazing.externalDoor.charge + (area * DEFAULT_PRICING.glazing.externalDoor.ratePerM2)
  })
  
  // Skylights
  glazing.skylights.forEach(skylight => {
    const area = skylight.widthM * skylight.heightM
    cost += DEFAULT_PRICING.glazing.skylight.charge + (area * DEFAULT_PRICING.glazing.skylight.ratePerM2)
  })
  
  return cost
}

/**
 * Calculate internal work cost (doors, walls)
 */
export function calculateInternalCost(config: ProductConfiguration): number {
  let cost = 0
  
  // Internal doors
  cost += config.internalDoors * DEFAULT_PRICING.internal.internalDoorCharge
  
  // Internal wall finish
  if (config.internalWall.finish !== 'none' && config.internalWall.areaSqM) {
    const rate = DEFAULT_PRICING.internal.internalWall[config.internalWall.finish] || 0
    cost += config.internalWall.areaSqM * rate
  }
  
  return cost
}

/**
 * Calculate flooring cost
 */
export function calculateFlooringCost(config: ProductConfiguration): number {
  if (config.floor.type === 'none') return 0
  
  const rate = DEFAULT_PRICING.flooring[config.floor.type] || 0
  return config.floor.areaSqM * rate
}

/**
 * Calculate delivery cost
 */
export function calculateDeliveryCost(config: ProductConfiguration): number {
  const distance = config.delivery.distanceKm || 0
  if (distance <= DEFAULT_PRICING.delivery.freeKm) return 0
  
  const chargeableKm = distance - DEFAULT_PRICING.delivery.freeKm
  return chargeableKm * DEFAULT_PRICING.delivery.ratePerKm
}

/**
 * Calculate extras cost
 */
export function calculateExtrasCost(config: ProductConfiguration): number {
  let cost = 0
  const { extras } = config
  
  // ESP insulation
  if (extras.espInsulation) {
    const floorArea = calculateFloorArea(config.size)
    cost += floorArea * DEFAULT_PRICING.extras.espInstallRatePerM2
  }
  
  // Render
  if (extras.render) {
    cost += config.cladding.areaSqm * DEFAULT_PRICING.extras.renderRatePerM2
  }
  
  // Steel door
  if (extras.steelDoor) {
    cost += DEFAULT_PRICING.extras.steelDoorCharge
  }
  
  // Other extras
  extras.other.forEach(item => {
    cost += item.cost
  })
  
  return cost
}

/**
 * Calculate complete price estimate
 */
export function calculatePriceEstimate(config: ProductConfiguration, includeVat: boolean = true): PriceEstimate {
  const breakdown = {
    base: calculateBaseCost(config.size),
    cladding: calculateCladdingCost(config),
    bathroom: calculateBathroomCost(config),
    electrical: calculateElectricalCost(config),
    glazing: calculateGlazingCost(config),
    internal: calculateInternalCost(config),
    flooring: calculateFlooringCost(config),
    delivery: calculateDeliveryCost(config),
    extras: calculateExtrasCost(config)
  }
  
  const subtotalExVat = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0)
  const vatAmount = includeVat ? subtotalExVat * DEFAULT_PRICING.vatRate : 0
  const totalIncVat = subtotalExVat + vatAmount
  
  return {
    currency: DEFAULT_PRICING.currency,
    subtotalExVat: Math.round(subtotalExVat * 100) / 100,
    vatRate: DEFAULT_PRICING.vatRate,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalIncVat: Math.round(totalIncVat * 100) / 100,
    breakdown: {
      base: Math.round(breakdown.base * 100) / 100,
      cladding: Math.round(breakdown.cladding * 100) / 100,
      bathroom: Math.round(breakdown.bathroom * 100) / 100,
      electrical: Math.round(breakdown.electrical * 100) / 100,
      glazing: Math.round(breakdown.glazing * 100) / 100,
      internal: Math.round(breakdown.internal * 100) / 100,
      flooring: Math.round(breakdown.flooring * 100) / 100,
      delivery: Math.round(breakdown.delivery * 100) / 100,
      extras: Math.round(breakdown.extras * 100) / 100
    }
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Validate configuration for pricing
 */
export function validateConfiguration(config: ProductConfiguration): string[] {
  const errors: string[] = []
  
  // Size validation
  if (config.size.widthM <= 0 || config.size.depthM <= 0) {
    errors.push('Size dimensions must be greater than 0')
  }
  
  if (config.size.widthM > 15 || config.size.depthM > 15) {
    errors.push('Size dimensions cannot exceed 15m')
  }
  
  // Cladding validation
  if (config.cladding.areaSqm <= 0) {
    errors.push('Cladding area must be greater than 0')
  }
  
  // Floor validation
  if (config.floor.type !== 'none' && config.floor.areaSqM <= 0) {
    errors.push('Floor area must be specified for selected floor type')
  }
  
  return errors
}