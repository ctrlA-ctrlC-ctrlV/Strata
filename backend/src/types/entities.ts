// Entity interfaces for MongoDB to Supabase migration
// These interfaces match the database schema and provide type safety
// Date: 2025-10-23

import type { 
  ProductType, 
  InternalWallFinish, 
  FloorType, 
  ElementType, 
  PaymentStatus, 
  PaymentType,
  ExtrasOther 
} from './supabase.js'

// Product Configuration Entity (maps to product_configurations table)
export interface ProductConfiguration {
  id: string
  productType: ProductType
  size: {
    widthM: number
    depthM: number
    heightM: number
  }
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
    downlight: number
    heater?: number | null
    undersinkHeater?: number | null
    elecBoiler?: number | null
  }
  internalDoors: number
  internalWall: {
    finish: InternalWallFinish
    areaSqM?: number | null
  }
  heaters: number
  glazing: {
    windows: GlazingElement[]
    externalDoors: GlazingElement[]
    skylights: GlazingElement[]
  }
  floor: {
    type: FloorType
    areaSqM: number
  }
  delivery: {
    distanceKm?: number | null
    cost: number
  }
  extras: {
    espInsulation?: number | null
    render?: number | null
    steelDoor?: number | null
    other: ExtraItem[]
  }
  estimate: {
    currency: string
    subtotalExVat: number
    vatRate: number
    totalIncVat: number
  }
  notes: string
  permittedDevelopmentFlags: PermittedDevelopmentFlag[]
  createdAt: string
  updatedAt: string
}

// Create input interface for ProductConfiguration
export interface CreateProductConfigurationInput {
  productType: ProductType
  size: {
    widthM: number
    depthM: number
    heightM: number
  }
  cladding: {
    areaSqm: number
  }
  bathroom: {
    half?: number
    threeQuarter?: number
  }
  electrical: {
    switches?: number
    sockets?: number
    downlight?: number
    heater?: number | null
    undersinkHeater?: number | null
    elecBoiler?: number | null
  }
  internalDoors?: number
  internalWall: {
    finish?: InternalWallFinish
    areaSqM?: number | null
  }
  heaters?: number
  glazing: {
    windows: CreateGlazingElementInput[]
    externalDoors: CreateGlazingElementInput[]
    skylights: CreateGlazingElementInput[]
  }
  floor: {
    type?: FloorType
    areaSqM: number
  }
  delivery: {
    distanceKm?: number | null
    cost: number
  }
  extras?: {
    espInsulation?: number | null
    render?: number | null
    steelDoor?: number | null
    other?: ExtraItem[]
  }
  estimate: {
    currency?: string
    subtotalExVat: number
    vatRate: number
    totalIncVat: number
  }
  notes?: string
  permittedDevelopmentFlags?: CreatePermittedDevelopmentFlagInput[]
}

// Update input interface for ProductConfiguration
export interface UpdateProductConfigurationInput {
  productType?: ProductType
  size?: {
    widthM?: number
    depthM?: number
    heightM?: number
  }
  cladding?: {
    areaSqm?: number
  }
  bathroom?: {
    half?: number
    threeQuarter?: number
  }
  electrical?: {
    switches?: number
    sockets?: number
    downlight?: number
    heater?: number | null
    undersinkHeater?: number | null
    elecBoiler?: number | null
  }
  internalDoors?: number
  internalWall?: {
    finish?: InternalWallFinish
    areaSqM?: number | null
  }
  heaters?: number
  glazing?: {
    windows?: CreateGlazingElementInput[]
    externalDoors?: CreateGlazingElementInput[]
    skylights?: CreateGlazingElementInput[]
  }
  floor?: {
    type?: FloorType
    areaSqM?: number
  }
  delivery?: {
    distanceKm?: number | null
    cost?: number
  }
  extras?: {
    espInsulation?: number | null
    render?: number | null
    steelDoor?: number | null
    other?: ExtraItem[]
  }
  estimate?: {
    currency?: string
    subtotalExVat?: number
    vatRate?: number
    totalIncVat?: number
  }
  notes?: string
  permittedDevelopmentFlags?: CreatePermittedDevelopmentFlagInput[]
}

// Glazing Element (maps to glazing_elements table)
export interface GlazingElement {
  id: string
  configurationId: string
  elementType: ElementType
  widthM: number
  heightM: number
  createdAt: string
}

// Create input for glazing elements
export interface CreateGlazingElementInput {
  elementType: ElementType
  widthM: number
  heightM: number
}

// Permitted Development Flag (maps to permitted_development_flags table)
export interface PermittedDevelopmentFlag {
  id: string
  configurationId: string
  code: string
  label: string
  createdAt: string
}

// Create input for permitted development flags
export interface CreatePermittedDevelopmentFlagInput {
  code: string
  label: string
}

// Extra Item (stored in JSONB extras_other field)
export interface ExtraItem {
  title: string
  cost: number
}

// Customer information interface
export interface Customer {
  firstName: string
  lastName: string
  email: string
  phone: {
    countryPrefix: string
    phoneNum: string
  }
  addressLine1: string
  addressLine2?: string | null
  town?: string | null
  county?: string | null
  eircode: string
}

// Payment information interface
export interface Payment {
  status: PaymentStatus
  totalPaid: number
  expectedInstallments?: number | null
  lastPaymentAt?: string | null
  createdAt: string
  updatedAt: string
  history: PaymentHistoryItem[]
}

// Payment history item (maps to payment_history table)
export interface PaymentHistoryItem {
  id: string
  quoteRequestId: string
  paymentType: PaymentType
  amount: number
  installmentNumber?: number | null
  note?: string | null
  recordedBy?: string | null
  timestamp: string
  createdAt: string
}

// Create input for payment history
export interface CreatePaymentHistoryInput {
  paymentType: PaymentType
  amount: number
  installmentNumber?: number | null
  note?: string | null
  recordedBy?: string | null
}

// Data retention interface
export interface Retention {
  expiresAt: string
}

// Validation interfaces for business rules
export interface ProductConfigurationValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

// Complete configuration with all related data
export interface CompleteProductConfiguration {
  configuration: ProductConfiguration
  glazingElements: GlazingElement[]
  permittedDevelopmentFlags: PermittedDevelopmentFlag[]
}

// Pagination interfaces
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: PaginationInfo
}

// Filter interfaces for queries
export interface ProductConfigurationFilters {
  productType?: ProductType
  minEstimateValue?: number
  maxEstimateValue?: number
  createdAfter?: string
  createdBefore?: string
  hasNotes?: boolean
}

// Repository operation result interfaces
export interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: RepositoryError
}

export interface RepositoryError {
  code: string
  message: string
  details?: unknown
}

// Utility types for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationInfo
  error?: string
  timestamp: string
}

// Type guards for runtime type checking
export function isProductConfiguration(obj: unknown): obj is ProductConfiguration {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).productType === 'string' &&
    (obj as any).size &&
    typeof (obj as any).size.widthM === 'number' &&
    typeof (obj as any).size.depthM === 'number' &&
    typeof (obj as any).estimate === 'object' &&
    typeof (obj as any).estimate.totalIncVat === 'number'
  )
}

export function isGlazingElement(obj: unknown): obj is GlazingElement {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).configurationId === 'string' &&
    typeof (obj as any).elementType === 'string' &&
    typeof (obj as any).widthM === 'number' &&
    typeof (obj as any).heightM === 'number'
  )
}

export function isCustomer(obj: unknown): obj is Customer {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof (obj as any).firstName === 'string' &&
    typeof (obj as any).lastName === 'string' &&
    typeof (obj as any).email === 'string' &&
    (obj as any).phone &&
    typeof (obj as any).phone.countryPrefix === 'string' &&
    typeof (obj as any).phone.phoneNum === 'string' &&
    typeof (obj as any).addressLine1 === 'string' &&
    typeof (obj as any).eircode === 'string'
  )
}

// Quote Request Entity (maps to quote_requests table)
export interface QuoteRequest {
  id: string
  configurationId: string
  customer: Customer
  payment: Payment
  retention: Retention
  requestedAt: string
  createdAt: string
  updatedAt: string
  // Related entities
  configuration?: ProductConfiguration
  glazingElements?: GlazingElement[]
  permittedDevelopmentFlags?: PermittedDevelopmentFlag[]
  paymentHistory?: PaymentHistoryItem[]
}

// Create input for QuoteRequest
export interface CreateQuoteRequestInput {
  configurationId: string
  customer: Customer
  payment?: {
    status?: PaymentStatus
    totalPaid?: number
    expectedInstallments?: number | null
  }
  retention?: {
    expiresAt?: string
  }
  requestedAt?: string
}

// Update input for QuoteRequest
export interface UpdateQuoteRequestInput {
  customer?: Partial<Customer>
  payment?: {
    status?: PaymentStatus
    totalPaid?: number
    expectedInstallments?: number | null
    lastPaymentAt?: string | null
  }
  retention?: {
    expiresAt?: string
  }
}

// Complete quote request with all related data
export interface CompleteQuoteRequest {
  quoteRequest: QuoteRequest
  configuration: ProductConfiguration
  glazingElements: GlazingElement[]
  permittedDevelopmentFlags: PermittedDevelopmentFlag[]
  paymentHistory: PaymentHistoryItem[]
}

// Quote request filters
export interface QuoteRequestFilters {
  customerEmail?: string
  paymentStatus?: PaymentStatus
  configurationId?: string
  requestedAfter?: string
  requestedBefore?: string
  expiresAfter?: string
  expiresBefore?: string
  minTotalValue?: number
  maxTotalValue?: number
  hasPayments?: boolean
}

// Quote request aggregations
export interface QuoteRequestSummary {
  totalRequests: number
  totalValue: number
  averageValue: number
  paymentStatusBreakdown: { [key in PaymentStatus]: number }
  productTypeBreakdown: { [key in ProductType]: number }
}

// Type guard for QuoteRequest
export function isQuoteRequest(obj: unknown): obj is QuoteRequest {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).configurationId === 'string' &&
    isCustomer((obj as any).customer) &&
    (obj as any).payment &&
    typeof (obj as any).payment.status === 'string' &&
    (obj as any).retention &&
    typeof (obj as any).retention.expiresAt === 'string' &&
    typeof (obj as any).requestedAt === 'string'
  )
}