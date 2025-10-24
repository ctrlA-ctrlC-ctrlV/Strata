/**
 * Validation schemas using Zod for type safety and runtime validation
 */

import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'

// Irish Eircode validation pattern
const EIRCODE_PATTERN = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i

// Phone number validation (supports international formats)
const PHONE_PATTERN = /^[\+]?[1-9][\d\s\-\(\)]{6,15}$/

// Common validation schemas
export const EmailSchema = z.string().email('Invalid email address')

export const PhoneSchema = z.object({
  countryPrefix: z.string().min(1, 'Country prefix is required'),
  phoneNum: z.string().regex(PHONE_PATTERN, 'Invalid phone number format')
})

export const EircodeSchema = z.string()
  .regex(EIRCODE_PATTERN, 'Invalid Eircode format. Expected format: A65 F4E2')
  .transform(eircode => eircode.toUpperCase().replace(/\s/g, '').replace(/^(.{3})(.{4})$/, '$1 $2'))

// County validation for served areas
export const CountySchema = z.enum(['dublin', 'wicklow', 'kildare'], {
  errorMap: () => ({ message: 'We currently only serve Dublin, Wicklow, and Kildare counties' })
})

// Enhanced Eircode validation with county cross-checking
export const EircodeWithCountySchema = z.object({
  eircode: EircodeSchema,
  county: CountySchema
}).refine((data) => {
  const eircode = data.eircode.replace(/\s/g, '').toUpperCase()
  const firstChar = eircode.charAt(0)
  
  // County-specific Eircode prefixes based on actual Irish postal system
  const countyPrefixes: Record<string, string[]> = {
    'dublin': ['D', 'K'], // Dublin and some Kildare areas
    'wicklow': ['A', 'Y'], // Wicklow uses A and Y prefixes
    'kildare': ['R', 'W'], // Kildare uses R and W prefixes (plus some K for border areas)
  }
  
  const validPrefixes = countyPrefixes[data.county.toLowerCase()]
  if (!validPrefixes) {
    return false
  }
  
  return validPrefixes.includes(firstChar)
}, {
  message: "Eircode doesn't match the selected county. Dublin uses D/K prefixes, Wicklow uses A/Y prefixes, Kildare uses R/W prefixes.",
  path: ['eircode']
})

// Product configuration validation
export const ProductSizeSchema = z.object({
  widthM: z.number().min(2, 'Width must be at least 2m').max(15, 'Width cannot exceed 15m'),
  depthM: z.number().min(2, 'Depth must be at least 2m').max(15, 'Depth cannot exceed 15m')
})

export const ProductTypeSchema = z.enum(['garden-room', 'house-extension', 'house-build'])

export const CladdingSchema = z.object({
  areaSqm: z.number().min(1, 'Cladding area must be positive')
})

export const BathroomSchema = z.object({
  half: z.number().min(0, 'Half bathroom count cannot be negative').max(2, 'Maximum 2 half bathrooms'),
  threeQuarter: z.number().min(0, 'Three quarter bathroom count cannot be negative').max(2, 'Maximum 2 three quarter bathrooms')
})

export const ElectricalSchema = z.object({
  switches: z.number().min(0, 'Switch count cannot be negative').max(50, 'Maximum 50 switches'),
  sockets: z.number().min(0, 'Socket count cannot be negative').max(50, 'Maximum 50 sockets'),
  heater: z.number().min(0, 'Heater count cannot be negative').max(10, 'Maximum 10 heaters').optional(),
  undersinkHeater: z.number().min(0).max(5).optional(),
  elecBoiler: z.number().min(0).max(2).optional()
})

export const GlazingItemSchema = z.object({
  widthM: z.number().min(0.3, 'Minimum width 0.3m').max(5, 'Maximum width 5m'),
  heightM: z.number().min(0.3, 'Minimum height 0.3m').max(3, 'Maximum height 3m')
})

export const GlazingSchema = z.object({
  windows: z.array(GlazingItemSchema).max(20, 'Maximum 20 windows'),
  externalDoors: z.array(GlazingItemSchema).max(5, 'Maximum 5 external doors'),
  skylights: z.array(GlazingItemSchema).max(10, 'Maximum 10 skylights')
})

export const InternalWallSchema = z.object({
  finish: z.enum(['none', 'panel', 'skimPaint']),
  areaSqM: z.number().min(0, 'Area cannot be negative').optional()
})

export const FloorSchema = z.object({
  type: z.enum(['none', 'wooden', 'tile']),
  areaSqM: z.number().min(0, 'Floor area cannot be negative')
})

export const DeliverySchema = z.object({
  distanceKm: z.number().min(0, 'Distance cannot be negative').max(200, 'Maximum delivery distance 200km').optional(),
  cost: z.number().min(0, 'Delivery cost cannot be negative')
})

export const ExtraItemSchema = z.object({
  title: z.string().min(1, 'Extra item title is required').max(100, 'Title too long'),
  cost: z.number().min(0, 'Cost cannot be negative')
})

export const ExtrasSchema = z.object({
  espInsulation: z.number().min(0).optional(),
  render: z.number().min(0).optional(),
  steelDoor: z.number().min(0).optional(),
  other: z.array(ExtraItemSchema).max(20, 'Maximum 20 extra items')
})

export const PriceEstimateSchema = z.object({
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  subtotalExVat: z.number().min(0, 'Subtotal cannot be negative'),
  vatRate: z.number().min(0, 'VAT rate cannot be negative').max(1, 'VAT rate cannot exceed 100%'),
  totalIncVat: z.number().min(0, 'Total cannot be negative')
})

export const PermittedDevelopmentFlagSchema = z.object({
  code: z.string().min(1, 'Flag code is required'),
  label: z.string().min(1, 'Flag label is required')
})

// Complete product configuration schema
export const ProductConfigurationSchema = z.object({
  productType: ProductTypeSchema,
  size: ProductSizeSchema,
  cladding: CladdingSchema,
  bathroom: BathroomSchema,
  electrical: ElectricalSchema,
  internalDoors: z.number().min(0, 'Internal door count cannot be negative').max(20, 'Maximum 20 internal doors'),
  internalWall: InternalWallSchema,
  heaters: z.number().min(0, 'Heater count cannot be negative').max(20, 'Maximum 20 heaters'),
  glazing: GlazingSchema,
  floor: FloorSchema,
  delivery: DeliverySchema,
  extras: ExtrasSchema,
  estimate: PriceEstimateSchema,
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').default(''),
  permittedDevelopmentFlags: z.array(PermittedDevelopmentFlagSchema).max(10, 'Maximum 10 PD flags')
})

// Customer information validation
export const CustomerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: EmailSchema,
  phone: PhoneSchema,
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 too long'),
  addressLine2: z.string().max(100, 'Address line 2 too long').optional(),
  town: z.string().max(50, 'Town name too long').optional(),
  county: CountySchema,
  eircode: EircodeSchema
})

// Quote request validation (original complex version for configurator)
export const ConfiguratorQuoteRequestSchema = z.object({
  config: ProductConfigurationSchema,
  customer: CustomerInfoSchema,
  desiredInstallTimeframe: z.string().min(1, 'Install timeframe is required').max(200, 'Timeframe description too long'),
  geography: z.object({
    county: CountySchema,
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional()
  }).optional()
})

// Contact form validation for simple contact page
export const ContactRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: EmailSchema,
  phone: z.string().regex(PHONE_PATTERN, 'Invalid phone number format'),
  county: CountySchema,
  eircode: EircodeSchema.optional(),
  projectType: z.enum(['garden-room', 'house-extension', 'house-build', 'consultation', 'other']),
  timeframe: z.enum(['asap', '3-months', '6-months', '12-months', 'exploring']).optional(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  consent: z.literal('true', { errorMap: () => ({ message: 'Consent is required' }) }),
  newsletter: z.string().optional(),
  source: z.string().optional(),
  formType: z.string().optional()
}).refine((data) => {
  // If county is provided with eircode, validate they match
  if (data.county && data.eircode) {
    const eircode = data.eircode.replace(/\s/g, '').toUpperCase()
    const firstChar = eircode.charAt(0)
    
    const countyPrefixes: Record<string, string[]> = {
      'dublin': ['D', 'K'],
      'wicklow': ['A', 'Y'], 
      'kildare': ['R', 'W'],
    }
    
    const validPrefixes = countyPrefixes[data.county.toLowerCase()]
    if (validPrefixes && !validPrefixes.includes(firstChar)) {
      return false
    }
  }
  return true
}, {
  message: "Eircode doesn't match selected county. Dublin: D/K, Wicklow: A/Y, Kildare: R/W",
  path: ['eircode']
})

// Configurator quote form validation (from the configurator component)
export const ConfiguratorQuoteFormSchema = z.object({
  // Customer information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: EmailSchema,
  phone: z.string().regex(PHONE_PATTERN, 'Invalid phone number format'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  county: CountySchema,
  eircode: EircodeSchema,
  
  // Configuration and pricing
  includeVat: z.boolean(),
  basePrice: z.number().min(0, 'Base price cannot be negative'),
  vatAmount: z.number().min(0, 'VAT amount cannot be negative'),
  totalPrice: z.number().min(0, 'Total price cannot be negative'),
  configurationData: z.string().min(1, 'Configuration data is required'), // JSON string
  
  // Additional info
  desiredInstallTimeframe: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  
  // Metadata
  source: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional()
}).refine((data) => {
  // Validate eircode matches county
  const eircode = data.eircode.replace(/\s/g, '').toUpperCase()
  const firstChar = eircode.charAt(0)
  
  const countyPrefixes: Record<string, string[]> = {
    'dublin': ['D', 'K'],
    'wicklow': ['A', 'Y'], 
    'kildare': ['R', 'W'],
  }
  
  const validPrefixes = countyPrefixes[data.county.toLowerCase()]
  if (!validPrefixes) {
    return false
  }
  
  return validPrefixes.includes(firstChar)
}, {
  message: "Eircode doesn't match selected county. Dublin: D/K, Wicklow: A/Y, Kildare: R/W",
  path: ['eircode']
})

// Enhanced quote request validation for quote page
export const QuoteRequestSchema = z.object({
  // Project details
  projectType: z.enum(['garden-room', 'house-extension', 'house-build']),
  sizeWidth: z.number().min(2, 'Width must be at least 2m').max(20, 'Width cannot exceed 20m'),
  sizeDepth: z.number().min(2, 'Depth must be at least 2m').max(20, 'Depth cannot exceed 20m'),
  features: z.array(z.enum(['bathroom', 'kitchenette', 'insulation', 'heating', 'electrical', 'bifold'])).optional(),
  description: z.string().min(1, 'Project description is required').max(2000, 'Description too long'),
  
  // Contact information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: EmailSchema,
  phone: z.string().regex(PHONE_PATTERN, 'Invalid phone number format'),
  
  // Location
  county: CountySchema,
  eircode: EircodeSchema,
  address: z.string().max(200, 'Address too long').optional(),
  timeframe: z.enum(['asap', '3-months', '6-months', '12-months', 'exploring']).optional(),
  
  // Consent
  consent: z.literal('true', { errorMap: () => ({ message: 'Consent is required' }) }),
  newsletter: z.string().optional(),
  siteSurvey: z.string().optional(),
  source: z.string().optional(),
  formType: z.string().optional()
}).refine((data) => {
  // Validate eircode matches county
  const eircode = data.eircode.replace(/\s/g, '').toUpperCase()
  const firstChar = eircode.charAt(0)
  
  const countyPrefixes: Record<string, string[]> = {
    'dublin': ['D', 'K'],
    'wicklow': ['A', 'Y'], 
    'kildare': ['R', 'W'],
  }
  
  const validPrefixes = countyPrefixes[data.county.toLowerCase()]
  if (!validPrefixes) {
    return false
  }
  
  return validPrefixes.includes(firstChar)
}, {
  message: "Eircode doesn't match selected county. Dublin: D/K, Wicklow: A/Y, Kildare: R/W",
  path: ['eircode']
})

// Admin asset validation
export const AdminAssetSchema = z.object({
  kind: z.enum(['logo', 'banner', 'gallery', 'other']),
  url: z.string().url('Invalid URL'),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text too long'),
  metadata: z.record(z.string().max(500)).optional(),
  published: z.boolean().default(false)
})

// Gallery item validation
export const GalleryItemSchema = z.object({
  quoteNumber: z.string().min(1, 'Quote number is required'),
  featured: z.boolean().default(false),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long'),
  category: z.enum(['garden-rooms', 'house-extensions', 'house-builds']),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text too long')
  })).min(1, 'At least one image is required').max(20, 'Maximum 20 images'),
  locationRegion: z.string().max(100, 'Location region too long').optional(),
  tags: z.array(z.string().max(50, 'Tag too long')).max(10, 'Maximum 10 tags')
})

// Testimonial validation
export const TestimonialSchema = z.object({
  published: z.boolean().default(false),
  quote: z.string().min(1, 'Quote text is required').max(1000, 'Quote too long'),
  author: z.string().min(1, 'Author name is required').max(100, 'Author name too long'),
  context: z.object({
    projectType: z.string().max(50, 'Project type too long').optional(),
    location: z.string().max(100, 'Location too long').optional()
  }).optional()
})

// Validation utility functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = validateRequest(schema, req.body)
    
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      })
      return
    }
    
    ;(req as any).validatedBody = validation.data
    next()
  }
}

export const validators = {
  email: EmailSchema,
  phone: PhoneSchema,
  eircode: EircodeSchema,
  county: CountySchema,
  eircodeWithCounty: EircodeWithCountySchema,
  productConfiguration: ProductConfigurationSchema,
  customerInfo: CustomerInfoSchema,
  configuratorQuoteRequest: ConfiguratorQuoteRequestSchema,
  configuratorQuoteForm: ConfiguratorQuoteFormSchema,
  quoteRequest: QuoteRequestSchema,
  contactRequest: ContactRequestSchema,
  adminAsset: AdminAssetSchema,
  galleryItem: GalleryItemSchema,
  testimonial: TestimonialSchema
}

export type ProductConfiguration = z.infer<typeof ProductConfigurationSchema>
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>
export type ConfiguratorQuoteRequest = z.infer<typeof ConfiguratorQuoteRequestSchema>
export type ConfiguratorQuoteForm = z.infer<typeof ConfiguratorQuoteFormSchema>
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>
export type ContactRequest = z.infer<typeof ContactRequestSchema>
export type AdminAsset = z.infer<typeof AdminAssetSchema>
export type GalleryItem = z.infer<typeof GalleryItemSchema>
export type Testimonial = z.infer<typeof TestimonialSchema>