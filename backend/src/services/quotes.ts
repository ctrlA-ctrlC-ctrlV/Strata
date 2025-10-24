// Quotes service layer for MongoDB to Supabase migration
// Business logic layer that coordinates between API and repository
// Date: 2025-10-23

import { QuotesRepository } from '../db/repos/quotes.js'
import type {
  ProductConfiguration,
  CreateProductConfigurationInput,
  UpdateProductConfigurationInput,
  QuoteRequest,
  CreateQuoteRequestInput,
  UpdateQuoteRequestInput,
  CompleteQuoteRequest,
  CompleteProductConfiguration,
  PaymentHistoryItem,
  CreatePaymentHistoryInput,
  PaginationOptions,
  PaginatedResult,
  ProductConfigurationFilters,
  QuoteRequestFilters,
  QuoteRequestSummary,
  RepositoryResult,
  RepositoryError,
  ProductConfigurationValidation,
  ValidationError,
  ValidationWarning,
  Customer
} from '../types/entities.js'

// Service layer error types
export interface ServiceError {
  code: string
  message: string
  httpStatus: number
  details?: unknown
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: ServiceError
}

export class QuotesService {
  private quotesRepository: QuotesRepository

  constructor(quotesRepository?: QuotesRepository) {
    this.quotesRepository = quotesRepository || new QuotesRepository()
  }

  // Product Configuration Services

  async createProductConfiguration(
    input: CreateProductConfigurationInput
  ): Promise<ServiceResult<ProductConfiguration>> {
    try {
      // Validate input
      const validation = this.validateProductConfiguration(input)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product configuration validation failed',
            httpStatus: 400,
            details: validation.errors
          }
        }
      }

      // Create configuration
      const result = await this.quotesRepository.createProductConfiguration(input)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error creating product configuration: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async getProductConfiguration(id: string): Promise<ServiceResult<ProductConfiguration>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid configuration ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.getProductConfiguration(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching product configuration: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async getCompleteProductConfiguration(id: string): Promise<ServiceResult<CompleteProductConfiguration>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid configuration ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.getCompleteProductConfiguration(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching complete configuration: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async updateProductConfiguration(
    id: string,
    updates: UpdateProductConfigurationInput
  ): Promise<ServiceResult<ProductConfiguration>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid configuration ID format',
            httpStatus: 400
          }
        }
      }

      // Validate updates
      const validation = this.validateProductConfigurationUpdates(updates)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product configuration update validation failed',
            httpStatus: 400,
            details: validation.errors
          }
        }
      }

      const result = await this.quotesRepository.updateProductConfiguration(id, updates)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error updating product configuration: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async deleteProductConfiguration(id: string): Promise<ServiceResult<void>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid configuration ID format',
            httpStatus: 400
          }
        }
      }

      // Check if configuration is referenced by any quote requests
      const usageCheck = await this.checkProductConfigurationUsage(id)
      if (!usageCheck.success) {
        return usageCheck
      }

      const result = await this.quotesRepository.deleteProductConfiguration(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error deleting product configuration: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async listProductConfigurations(
    options: PaginationOptions & { filters?: ProductConfigurationFilters } = { page: 1, limit: 20 }
  ): Promise<ServiceResult<PaginatedResult<ProductConfiguration>>> {
    try {
      // Validate pagination parameters
      const paginationValidation = this.validatePaginationOptions(options)
      if (!paginationValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid pagination options',
            httpStatus: 400,
            details: paginationValidation.errors
          }
        }
      }

      const result = await this.quotesRepository.listProductConfigurations(options)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error listing product configurations: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  // Quote Request Services

  async createQuoteRequest(input: CreateQuoteRequestInput): Promise<ServiceResult<QuoteRequest>> {
    try {
      // Validate input
      const validation = this.validateQuoteRequest(input)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quote request validation failed',
            httpStatus: 400,
            details: validation.errors
          }
        }
      }

      // Verify configuration exists
      const configExists = await this.quotesRepository.getProductConfiguration(input.configurationId)
      if (!configExists.success || !configExists.data) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Referenced product configuration not found',
            httpStatus: 404
          }
        }
      }

      const result = await this.quotesRepository.createQuoteRequest(input)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error creating quote request: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async getQuoteRequest(id: string): Promise<ServiceResult<QuoteRequest>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.getQuoteRequest(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching quote request: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async getCompleteQuoteRequest(id: string): Promise<ServiceResult<CompleteQuoteRequest>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.getCompleteQuoteRequest(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching complete quote request: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async updateQuoteRequest(
    id: string,
    updates: UpdateQuoteRequestInput
  ): Promise<ServiceResult<QuoteRequest>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      // Validate updates
      const validation = this.validateQuoteRequestUpdates(updates)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Quote request update validation failed',
            httpStatus: 400,
            details: validation.errors
          }
        }
      }

      const result = await this.quotesRepository.updateQuoteRequest(id, updates)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error updating quote request: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async deleteQuoteRequest(id: string): Promise<ServiceResult<void>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.deleteQuoteRequest(id)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error deleting quote request: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async listQuoteRequests(
    options: PaginationOptions & { filters?: QuoteRequestFilters } = { page: 1, limit: 20 }
  ): Promise<ServiceResult<PaginatedResult<QuoteRequest>>> {
    try {
      // Validate pagination parameters
      const paginationValidation = this.validatePaginationOptions(options)
      if (!paginationValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid pagination options',
            httpStatus: 400,
            details: paginationValidation.errors
          }
        }
      }

      const result = await this.quotesRepository.listQuoteRequests(options)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error listing quote requests: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  // Payment Services

  async addPaymentHistory(
    quoteRequestId: string,
    payment: CreatePaymentHistoryInput
  ): Promise<ServiceResult<PaymentHistoryItem>> {
    try {
      if (!this.isValidUUID(quoteRequestId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      // Validate payment data
      const validation = this.validatePaymentHistory(payment)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment history validation failed',
            httpStatus: 400,
            details: validation.errors
          }
        }
      }

      // Verify quote request exists
      const quoteExists = await this.quotesRepository.getQuoteRequest(quoteRequestId)
      if (!quoteExists.success || !quoteExists.data) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Quote request not found',
            httpStatus: 404
          }
        }
      }

      const result = await this.quotesRepository.addPaymentHistory(quoteRequestId, payment)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error adding payment history: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  async getPaymentHistoryForQuoteRequest(quoteRequestId: string): Promise<ServiceResult<PaymentHistoryItem[]>> {
    try {
      if (!this.isValidUUID(quoteRequestId)) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid quote request ID format',
            httpStatus: 400
          }
        }
      }

      const result = await this.quotesRepository.getPaymentHistoryForQuoteRequest(quoteRequestId)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data || []
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching payment history: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  // Analytics and Reporting Services

  async getQuoteRequestSummary(filters?: QuoteRequestFilters): Promise<ServiceResult<QuoteRequestSummary>> {
    try {
      const result = await this.quotesRepository.getQuoteRequestSummary(filters)
      
      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Unexpected error fetching quote request summary: ${error}`,
          httpStatus: 500,
          details: error
        }
      }
    }
  }

  // Validation Methods

  private validateProductConfiguration(input: CreateProductConfigurationInput): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Required fields validation
    if (!input.productType || !['garden-room', 'house-extension', 'house-build'].includes(input.productType)) {
      errors.push({
        field: 'productType',
        message: 'Valid product type is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!input.size || input.size.widthM <= 0 || input.size.depthM <= 0 || input.size.heightM <= 0) {
      errors.push({
        field: 'size',
        message: 'Valid size dimensions are required (all must be > 0)',
        code: 'INVALID_SIZE'
      })
    }

    if (!input.cladding || input.cladding.areaSqm < 0) {
      errors.push({
        field: 'cladding.areaSqm',
        message: 'Cladding area must be >= 0',
        code: 'INVALID_AREA'
      })
    }

    if (!input.floor || input.floor.areaSqM <= 0) {
      errors.push({
        field: 'floor.areaSqM',
        message: 'Floor area must be > 0',
        code: 'INVALID_AREA'
      })
    }

    if (!input.delivery || input.delivery.cost < 0) {
      errors.push({
        field: 'delivery.cost',
        message: 'Delivery cost must be >= 0',
        code: 'INVALID_COST'
      })
    }

    if (!input.estimate || input.estimate.totalIncVat <= 0) {
      errors.push({
        field: 'estimate.totalIncVat',
        message: 'Total estimate must be > 0',
        code: 'INVALID_ESTIMATE'
      })
    }

    // Business rule warnings
    if (input.size && input.size.widthM * input.size.depthM > 50) {
      warnings.push({
        field: 'size',
        message: 'Large floor area may require planning permission',
        code: 'LARGE_SIZE_WARNING'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateProductConfigurationUpdates(updates: UpdateProductConfigurationInput): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate only provided fields
    if (updates.size) {
      if (updates.size.widthM !== undefined && updates.size.widthM <= 0) {
        errors.push({
          field: 'size.widthM',
          message: 'Width must be > 0',
          code: 'INVALID_DIMENSION'
        })
      }
      if (updates.size.depthM !== undefined && updates.size.depthM <= 0) {
        errors.push({
          field: 'size.depthM',
          message: 'Depth must be > 0',
          code: 'INVALID_DIMENSION'
        })
      }
      if (updates.size.heightM !== undefined && updates.size.heightM <= 0) {
        errors.push({
          field: 'size.heightM',
          message: 'Height must be > 0',
          code: 'INVALID_DIMENSION'
        })
      }
    }

    if (updates.estimate?.totalIncVat !== undefined && updates.estimate.totalIncVat <= 0) {
      errors.push({
        field: 'estimate.totalIncVat',
        message: 'Total estimate must be > 0',
        code: 'INVALID_ESTIMATE'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateQuoteRequest(input: CreateQuoteRequestInput): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate configuration ID
    if (!input.configurationId || !this.isValidUUID(input.configurationId)) {
      errors.push({
        field: 'configurationId',
        message: 'Valid configuration ID is required',
        code: 'REQUIRED_FIELD'
      })
    }

    // Validate customer information
    const customerValidation = this.validateCustomer(input.customer)
    if (!customerValidation.isValid) {
      errors.push(...customerValidation.errors)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateQuoteRequestUpdates(updates: UpdateQuoteRequestInput): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate customer updates if provided
    if (updates.customer) {
      const customerValidation = this.validateCustomer(updates.customer as Customer)
      if (!customerValidation.isValid) {
        errors.push(...customerValidation.errors)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateCustomer(customer: Customer): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!customer.firstName || customer.firstName.trim().length === 0) {
      errors.push({
        field: 'customer.firstName',
        message: 'First name is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!customer.lastName || customer.lastName.trim().length === 0) {
      errors.push({
        field: 'customer.lastName',
        message: 'Last name is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!customer.email || !this.isValidEmail(customer.email)) {
      errors.push({
        field: 'customer.email',
        message: 'Valid email address is required',
        code: 'INVALID_EMAIL'
      })
    }

    if (!customer.eircode || !this.isValidEircode(customer.eircode)) {
      errors.push({
        field: 'customer.eircode',
        message: 'Valid Irish Eircode is required',
        code: 'INVALID_EIRCODE'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validatePaymentHistory(payment: CreatePaymentHistoryInput): ProductConfigurationValidation {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!payment.paymentType || !['DEPOSIT', 'INSTALLMENT', 'FINAL', 'REFUND', 'ADJUSTMENT'].includes(payment.paymentType)) {
      errors.push({
        field: 'paymentType',
        message: 'Valid payment type is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (payment.amount === undefined || payment.amount === null || payment.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Payment amount must be > 0',
        code: 'INVALID_AMOUNT'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validatePaginationOptions(options: PaginationOptions): ProductConfigurationValidation {
    const errors: ValidationError[] = []

    if (options.page < 1) {
      errors.push({
        field: 'page',
        message: 'Page number must be >= 1',
        code: 'INVALID_PAGE'
      })
    }

    if (options.limit < 1 || options.limit > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT'
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: []
    }
  }

  // Utility Methods

  private async checkProductConfigurationUsage(configId: string): Promise<ServiceResult<void>> {
    try {
      const result = await this.quotesRepository.listQuoteRequests({
        page: 1,
        limit: 1,
        filters: { configurationId: configId }
      })

      if (!result.success) {
        return {
          success: false,
          error: this.mapRepositoryError(result.error!)
        }
      }

      if (result.data && result.data.items.length > 0) {
        return {
          success: false,
          error: {
            code: 'CONFIGURATION_IN_USE',
            message: 'Cannot delete configuration: it is referenced by existing quote requests',
            httpStatus: 409
          }
        }
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: `Error checking configuration usage: ${error}`,
          httpStatus: 500
        }
      }
    }
  }

  private mapRepositoryError(repoError: RepositoryError): ServiceError {
    const errorMapping: { [key: string]: { httpStatus: number; message?: string } } = {
      'NOT_FOUND': { httpStatus: 404 },
      'DB_INSERT_ERROR': { httpStatus: 500, message: 'Database insert operation failed' },
      'DB_UPDATE_ERROR': { httpStatus: 500, message: 'Database update operation failed' },
      'DB_DELETE_ERROR': { httpStatus: 500, message: 'Database delete operation failed' },
      'DB_FETCH_ERROR': { httpStatus: 500, message: 'Database fetch operation failed' },
      'REPOSITORY_ERROR': { httpStatus: 500, message: 'Repository operation failed' }
    }

    const mapping = errorMapping[repoError.code] || { httpStatus: 500 }

    return {
      code: repoError.code,
      message: mapping.message || repoError.message,
      httpStatus: mapping.httpStatus,
      details: repoError.details
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidEircode(eircode: string): boolean {
    // Irish Eircode format: A65 F4E2 (letter+digit+digit space letter+digit+letter+digit)
    const eircodeRegex = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i
    return eircodeRegex.test(eircode.replace(/\s/g, ''))
  }
}
