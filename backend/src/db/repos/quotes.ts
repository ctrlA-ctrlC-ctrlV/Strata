// Supabase-based quotes repository for MongoDB to Supabase migration
// Implements comprehensive quote management with PostgreSQL database
// Date: 2025-10-23

import { supabaseAdmin } from '../supabase.js'
import type { 
  ProductConfiguration,
  CreateProductConfigurationInput,
  UpdateProductConfigurationInput,
  QuoteRequest,
  CreateQuoteRequestInput,
  UpdateQuoteRequestInput,
  CompleteQuoteRequest,
  CompleteProductConfiguration,
  GlazingElement,
  CreateGlazingElementInput,
  PermittedDevelopmentFlag,
  CreatePermittedDevelopmentFlagInput,
  PaymentHistoryItem,
  CreatePaymentHistoryInput,
  PaginationOptions,
  PaginatedResult,
  ProductConfigurationFilters,
  QuoteRequestFilters,
  QuoteRequestSummary,
  RepositoryResult,
  RepositoryError
} from '../../types/entities.js'
import type { 
  Database,
  ProductType,
  PaymentStatus,
  PaymentType,
  InternalWallFinish,
  FloorType,
  ElementType,
  ExtrasOther
} from '../../types/supabase.js'

// Type aliases for database rows
type ProductConfigurationRow = Database['public']['Tables']['product_configurations']['Row']
type QuoteRequestRow = Database['public']['Tables']['quote_requests']['Row'] 
type GlazingElementRow = Database['public']['Tables']['glazing_elements']['Row']
type PermittedDevelopmentFlagRow = Database['public']['Tables']['permitted_development_flags']['Row']
type PaymentHistoryRow = Database['public']['Tables']['payment_history']['Row']

export class QuotesRepository {
  
  // Product Configuration Operations
  
  async createProductConfiguration(
    input: CreateProductConfigurationInput
  ): Promise<RepositoryResult<ProductConfiguration>> {
    try {
      // Set default values
      const configData = {
        product_type: input.productType,
        width_m: input.size.widthM,
        depth_m: input.size.depthM,
        height_m: input.size.heightM,
        cladding_area_sqm: input.cladding.areaSqm,
        bathroom_half: input.bathroom?.half || 0,
        bathroom_three_quarter: input.bathroom?.threeQuarter || 0,
        electrical_switches: input.electrical?.switches || 0,
        electrical_sockets: input.electrical?.sockets || 0,
        electrical_downlight: input.electrical?.downlight || 0,
        electrical_heater: input.electrical?.heater,
        electrical_undersink_heater: input.electrical?.undersinkHeater,
        electrical_elec_boiler: input.electrical?.elecBoiler,
        internal_doors: input.internalDoors || 0,
        internal_wall_finish: input.internalWall?.finish || 'none',
        internal_wall_area_sqm: input.internalWall?.areaSqM,
        heaters: input.heaters || 0,
        floor_type: input.floor?.type || 'none',
        floor_area_sqm: input.floor.areaSqM,
        delivery_distance_km: input.delivery?.distanceKm,
        delivery_cost: input.delivery.cost,
        extras_esp_insulation: input.extras?.espInsulation,
        extras_render: input.extras?.render,
        extras_steel_door: input.extras?.steelDoor,
        extras_other: (input.extras?.other || []) as any,
        estimate_currency: input.estimate?.currency || 'EUR',
        estimate_subtotal_ex_vat: input.estimate.subtotalExVat,
        estimate_vat_rate: input.estimate.vatRate,
        estimate_total_inc_vat: input.estimate.totalIncVat,
        notes: input.notes || ''
      }

      const { data, error } = await supabaseAdmin
        .from('product_configurations')
        .insert(configData)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_INSERT_ERROR',
            message: `Failed to create product configuration: ${error.message}`,
            details: error
          }
        }
      }

      const configId = data.id

      // Create glazing elements if provided
      if (input.glazing) {
        await this.createGlazingElementsForConfiguration(configId, [
          ...input.glazing.windows.map(w => ({ ...w, elementType: 'window' as const })),
          ...input.glazing.externalDoors.map(d => ({ ...d, elementType: 'external_door' as const })),
          ...input.glazing.skylights.map(s => ({ ...s, elementType: 'skylight' as const }))
        ])
      }

      // Create permitted development flags if provided
      if (input.permittedDevelopmentFlags && input.permittedDevelopmentFlags.length > 0) {
        await this.createPermittedDevelopmentFlagsForConfiguration(
          configId, 
          input.permittedDevelopmentFlags
        )
      }

      // Fetch the complete configuration
      const completeConfig = await this.getCompleteProductConfiguration(configId)
      if (!completeConfig.success || !completeConfig.data) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: 'Failed to fetch created configuration'
          }
        }
      }

      return {
        success: true,
        data: completeConfig.data.configuration
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error creating product configuration: ${error}`,
          details: error
        }
      }
    }
  }

  async getProductConfiguration(id: string): Promise<RepositoryResult<ProductConfiguration>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_configurations')
        .select()
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Product configuration with id ${id} not found`
            }
          }
        }

        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch product configuration: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: this.mapProductConfigurationRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching product configuration: ${error}`,
          details: error
        }
      }
    }
  }

  async getCompleteProductConfiguration(id: string): Promise<RepositoryResult<CompleteProductConfiguration>> {
    try {
      // Fetch configuration
      const configResult = await this.getProductConfiguration(id)
      if (!configResult.success || !configResult.data) {
        return configResult as any
      }

      // Fetch glazing elements
      const glazingResult = await this.getGlazingElementsForConfiguration(id)
      if (!glazingResult.success) {
        return glazingResult as any
      }

      // Fetch permitted development flags
      const flagsResult = await this.getPermittedDevelopmentFlagsForConfiguration(id)
      if (!flagsResult.success) {
        return flagsResult as any
      }

      return {
        success: true,
        data: {
          configuration: configResult.data,
          glazingElements: glazingResult.data || [],
          permittedDevelopmentFlags: flagsResult.data || []
        }
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching complete configuration: ${error}`,
          details: error
        }
      }
    }
  }

  async updateProductConfiguration(
    id: string, 
    updates: UpdateProductConfigurationInput
  ): Promise<RepositoryResult<ProductConfiguration>> {
    try {
      const updateData: Partial<ProductConfigurationRow> = {}

      // Map updates to database columns
      if (updates.productType) updateData.product_type = updates.productType
      if (updates.size?.widthM) updateData.width_m = updates.size.widthM
      if (updates.size?.depthM) updateData.depth_m = updates.size.depthM
      if (updates.size?.heightM) updateData.height_m = updates.size.heightM
      if (updates.cladding?.areaSqm) updateData.cladding_area_sqm = updates.cladding.areaSqm
      if (updates.bathroom?.half !== undefined) updateData.bathroom_half = updates.bathroom.half
      if (updates.bathroom?.threeQuarter !== undefined) updateData.bathroom_three_quarter = updates.bathroom.threeQuarter
      if (updates.electrical?.switches !== undefined) updateData.electrical_switches = updates.electrical.switches
      if (updates.electrical?.sockets !== undefined) updateData.electrical_sockets = updates.electrical.sockets
      if (updates.electrical?.downlight !== undefined) updateData.electrical_downlight = updates.electrical.downlight
      if (updates.electrical?.heater !== undefined) updateData.electrical_heater = updates.electrical.heater
      if (updates.electrical?.undersinkHeater !== undefined) updateData.electrical_undersink_heater = updates.electrical.undersinkHeater
      if (updates.electrical?.elecBoiler !== undefined) updateData.electrical_elec_boiler = updates.electrical.elecBoiler
      if (updates.internalDoors !== undefined) updateData.internal_doors = updates.internalDoors
      if (updates.internalWall?.finish) updateData.internal_wall_finish = updates.internalWall.finish
      if (updates.internalWall?.areaSqM !== undefined) updateData.internal_wall_area_sqm = updates.internalWall.areaSqM
      if (updates.heaters !== undefined) updateData.heaters = updates.heaters
      if (updates.floor?.type) updateData.floor_type = updates.floor.type
      if (updates.floor?.areaSqM) updateData.floor_area_sqm = updates.floor.areaSqM
      if (updates.delivery?.distanceKm !== undefined) updateData.delivery_distance_km = updates.delivery.distanceKm
      if (updates.delivery?.cost) updateData.delivery_cost = updates.delivery.cost
      if (updates.extras?.espInsulation !== undefined) updateData.extras_esp_insulation = updates.extras.espInsulation
      if (updates.extras?.render !== undefined) updateData.extras_render = updates.extras.render
      if (updates.extras?.steelDoor !== undefined) updateData.extras_steel_door = updates.extras.steelDoor
      if (updates.extras?.other) updateData.extras_other = updates.extras.other as any
      if (updates.estimate?.currency) updateData.estimate_currency = updates.estimate.currency
      if (updates.estimate?.subtotalExVat) updateData.estimate_subtotal_ex_vat = updates.estimate.subtotalExVat
      if (updates.estimate?.vatRate) updateData.estimate_vat_rate = updates.estimate.vatRate
      if (updates.estimate?.totalIncVat) updateData.estimate_total_inc_vat = updates.estimate.totalIncVat
      if (updates.notes !== undefined) updateData.notes = updates.notes

      const { data, error } = await supabaseAdmin
        .from('product_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Product configuration with id ${id} not found`
            }
          }
        }

        return {
          success: false,
          error: {
            code: 'DB_UPDATE_ERROR',
            message: `Failed to update product configuration: ${error.message}`,
            details: error
          }
        }
      }

      // Update glazing elements if provided
      if (updates.glazing) {
        // Delete existing elements and recreate
        await supabaseAdmin
          .from('glazing_elements')
          .delete()
          .eq('configuration_id', id)

        await this.createGlazingElementsForConfiguration(id, [
          ...updates.glazing.windows?.map(w => ({ ...w, elementType: 'window' as const })) || [],
          ...updates.glazing.externalDoors?.map(d => ({ ...d, elementType: 'external_door' as const })) || [],
          ...updates.glazing.skylights?.map(s => ({ ...s, elementType: 'skylight' as const })) || []
        ])
      }

      // Update permitted development flags if provided
      if (updates.permittedDevelopmentFlags) {
        // Delete existing flags and recreate
        await supabaseAdmin
          .from('permitted_development_flags')
          .delete()
          .eq('configuration_id', id)

        if (updates.permittedDevelopmentFlags.length > 0) {
          await this.createPermittedDevelopmentFlagsForConfiguration(id, updates.permittedDevelopmentFlags)
        }
      }

      return {
        success: true,
        data: this.mapProductConfigurationRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error updating product configuration: ${error}`,
          details: error
        }
      }
    }
  }

  async deleteProductConfiguration(id: string): Promise<RepositoryResult<void>> {
    try {
      // Delete related records first (cascading should handle this, but explicit for safety)
      await supabaseAdmin.from('glazing_elements').delete().eq('configuration_id', id)
      await supabaseAdmin.from('permitted_development_flags').delete().eq('configuration_id', id)

      const { error } = await supabaseAdmin
        .from('product_configurations')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_DELETE_ERROR',
            message: `Failed to delete product configuration: ${error.message}`,
            details: error
          }
        }
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error deleting product configuration: ${error}`,
          details: error
        }
      }
    }
  }

  async listProductConfigurations(
    options: PaginationOptions & { filters?: ProductConfigurationFilters } = { page: 1, limit: 20 }
  ): Promise<RepositoryResult<PaginatedResult<ProductConfiguration>>> {
    try {
      let query = supabaseAdmin
        .from('product_configurations')
        .select('*', { count: 'exact' })

      // Apply filters
      if (options.filters) {
        if (options.filters.productType) {
          query = query.eq('product_type', options.filters.productType)
        }
        if (options.filters.minEstimateValue) {
          query = query.gte('estimate_total_inc_vat', options.filters.minEstimateValue)
        }
        if (options.filters.maxEstimateValue) {
          query = query.lte('estimate_total_inc_vat', options.filters.maxEstimateValue)
        }
        if (options.filters.createdAfter) {
          query = query.gte('created_at', options.filters.createdAfter)
        }
        if (options.filters.createdBefore) {
          query = query.lte('created_at', options.filters.createdBefore)
        }
        if (options.filters.hasNotes !== undefined) {
          if (options.filters.hasNotes) {
            query = query.neq('notes', '')
          } else {
            query = query.eq('notes', '')
          }
        }
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const sortOrder = options.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const offset = (options.page - 1) * options.limit
      query = query.range(offset, offset + options.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to list product configurations: ${error.message}`,
            details: error
          }
        }
      }

      const items = (data || []).map(row => this.mapProductConfigurationRow(row))
      const total = count || 0
      const totalPages = Math.ceil(total / options.limit)

      return {
        success: true,
        data: {
          items,
          pagination: {
            total,
            page: options.page,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrevious: options.page > 1
          }
        }
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error listing product configurations: ${error}`,
          details: error
        }
      }
    }
  }

  // Quote Request Operations

  async createQuoteRequest(input: CreateQuoteRequestInput): Promise<RepositoryResult<QuoteRequest>> {
    try {
      // Set default values and calculate retention
      const defaultRetentionDays = 365
      const expiresAt = input.retention?.expiresAt || 
        new Date(Date.now() + defaultRetentionDays * 24 * 60 * 60 * 1000).toISOString()

      const requestData = {
        configuration_id: input.configurationId,
        customer_first_name: input.customer.firstName,
        customer_last_name: input.customer.lastName,
        customer_email: input.customer.email,
        customer_phone_country_prefix: input.customer.phone.countryPrefix,
        customer_phone_number: input.customer.phone.phoneNum,
        customer_address_line1: input.customer.addressLine1,
        customer_address_line2: input.customer.addressLine2,
        customer_town: input.customer.town,
        customer_county: input.customer.county,
        customer_eircode: input.customer.eircode,
        desired_install_timeframe: 'not_specified', // Default value since not in input
        quote_number: `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_status: input.payment?.status || 'pre-quote' as PaymentStatus,
        payment_total_paid: input.payment?.totalPaid || 0,
        payment_expected_installments: input.payment?.expectedInstallments,
        retention_expires_at: expiresAt,
        submitted_at: input.requestedAt || new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from('quote_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_INSERT_ERROR',
            message: `Failed to create quote request: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: this.mapQuoteRequestRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error creating quote request: ${error}`,
          details: error
        }
      }
    }
  }

  async getQuoteRequest(id: string): Promise<RepositoryResult<QuoteRequest>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('quote_requests')
        .select()
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Quote request with id ${id} not found`
            }
          }
        }

        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch quote request: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: this.mapQuoteRequestRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching quote request: ${error}`,
          details: error
        }
      }
    }
  }

  async getCompleteQuoteRequest(id: string): Promise<RepositoryResult<CompleteQuoteRequest>> {
    try {
      // Fetch quote request
      const quoteResult = await this.getQuoteRequest(id)
      if (!quoteResult.success || !quoteResult.data) {
        return quoteResult as any
      }

      const quote = quoteResult.data

      // Fetch complete configuration
      const configResult = await this.getCompleteProductConfiguration(quote.configurationId)
      if (!configResult.success || !configResult.data) {
        return configResult as any
      }

      // Fetch payment history
      const paymentHistoryResult = await this.getPaymentHistoryForQuoteRequest(id)
      if (!paymentHistoryResult.success) {
        return paymentHistoryResult as any
      }

      return {
        success: true,
        data: {
          quoteRequest: quote,
          configuration: configResult.data.configuration,
          glazingElements: configResult.data.glazingElements,
          permittedDevelopmentFlags: configResult.data.permittedDevelopmentFlags,
          paymentHistory: paymentHistoryResult.data || []
        }
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching complete quote request: ${error}`,
          details: error
        }
      }
    }
  }

  async updateQuoteRequest(
    id: string, 
    updates: UpdateQuoteRequestInput
  ): Promise<RepositoryResult<QuoteRequest>> {
    try {
      const updateData: Partial<QuoteRequestRow> = {}

      // Map customer updates
      if (updates.customer?.firstName) updateData.customer_first_name = updates.customer.firstName
      if (updates.customer?.lastName) updateData.customer_last_name = updates.customer.lastName
      if (updates.customer?.email) updateData.customer_email = updates.customer.email
      if (updates.customer?.phone?.countryPrefix) updateData.customer_phone_country_prefix = updates.customer.phone.countryPrefix
      if (updates.customer?.phone?.phoneNum) updateData.customer_phone_number = updates.customer.phone.phoneNum
      if (updates.customer?.addressLine1) updateData.customer_address_line1 = updates.customer.addressLine1
      if (updates.customer?.addressLine2 !== undefined) updateData.customer_address_line2 = updates.customer.addressLine2
      if (updates.customer?.town !== undefined) updateData.customer_town = updates.customer.town
      if (updates.customer?.county !== undefined) updateData.customer_county = updates.customer.county
      if (updates.customer?.eircode) updateData.customer_eircode = updates.customer.eircode

      // Map payment updates
      if (updates.payment?.status) updateData.payment_status = updates.payment.status
      if (updates.payment?.totalPaid !== undefined) updateData.payment_total_paid = updates.payment.totalPaid
      if (updates.payment?.expectedInstallments !== undefined) updateData.payment_expected_installments = updates.payment.expectedInstallments
      if (updates.payment?.lastPaymentAt !== undefined) updateData.payment_last_payment_at = updates.payment.lastPaymentAt

      // Map retention updates
      if (updates.retention?.expiresAt) updateData.retention_expires_at = updates.retention.expiresAt

      const { data, error } = await supabaseAdmin
        .from('quote_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Quote request with id ${id} not found`
            }
          }
        }

        return {
          success: false,
          error: {
            code: 'DB_UPDATE_ERROR',
            message: `Failed to update quote request: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: this.mapQuoteRequestRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error updating quote request: ${error}`,
          details: error
        }
      }
    }
  }

  async deleteQuoteRequest(id: string): Promise<RepositoryResult<void>> {
    try {
      // Delete related payment history first
      await supabaseAdmin.from('payment_history').delete().eq('quote_request_id', id)

      const { error } = await supabaseAdmin
        .from('quote_requests')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_DELETE_ERROR',
            message: `Failed to delete quote request: ${error.message}`,
            details: error
          }
        }
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error deleting quote request: ${error}`,
          details: error
        }
      }
    }
  }

  async listQuoteRequests(
    options: PaginationOptions & { filters?: QuoteRequestFilters } = { page: 1, limit: 20 }
  ): Promise<RepositoryResult<PaginatedResult<QuoteRequest>>> {
    try {
      let query = supabaseAdmin
        .from('quote_requests')
        .select('*', { count: 'exact' })

      // Apply filters
      if (options.filters) {
        if (options.filters.customerEmail) {
          query = query.eq('customer_email', options.filters.customerEmail)
        }
        if (options.filters.paymentStatus) {
          query = query.eq('payment_status', options.filters.paymentStatus)
        }
        if (options.filters.configurationId) {
          query = query.eq('configuration_id', options.filters.configurationId)
        }
        if (options.filters.requestedAfter) {
          query = query.gte('requested_at', options.filters.requestedAfter)
        }
        if (options.filters.requestedBefore) {
          query = query.lte('requested_at', options.filters.requestedBefore)
        }
        if (options.filters.expiresAfter) {
          query = query.gte('retention_expires_at', options.filters.expiresAfter)
        }
        if (options.filters.expiresBefore) {
          query = query.lte('retention_expires_at', options.filters.expiresBefore)
        }
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const sortOrder = options.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const offset = (options.page - 1) * options.limit
      query = query.range(offset, offset + options.limit - 1)

      const { data, error, count } = await query

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to list quote requests: ${error.message}`,
            details: error
          }
        }
      }

      const items = (data || []).map(row => this.mapQuoteRequestRow(row))
      const total = count || 0
      const totalPages = Math.ceil(total / options.limit)

      return {
        success: true,
        data: {
          items,
          pagination: {
            total,
            page: options.page,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrevious: options.page > 1
          }
        }
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error listing quote requests: ${error}`,
          details: error
        }
      }
    }
  }

  // Payment History Operations

  async addPaymentHistory(
    quoteRequestId: string,
    payment: CreatePaymentHistoryInput
  ): Promise<RepositoryResult<PaymentHistoryItem>> {
    try {
      const paymentData = {
        quote_request_id: quoteRequestId,
        payment_type: payment.paymentType,
        amount: payment.amount,
        installment_number: payment.installmentNumber,
        note: payment.note,
        recorded_by: payment.recordedBy,
        timestamp: new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from('payment_history')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_INSERT_ERROR',
            message: `Failed to add payment history: ${error.message}`,
            details: error
          }
        }
      }

      // Update quote request payment info
      const totalResult = await this.calculateTotalPayments(quoteRequestId)
      if (totalResult.success && totalResult.data) {
        await supabaseAdmin
          .from('quote_requests')
          .update({
            payment_total_paid: totalResult.data,
            payment_last_payment_at: paymentData.timestamp
          })
          .eq('id', quoteRequestId)
      }

      return {
        success: true,
        data: this.mapPaymentHistoryRow(data)
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error adding payment history: ${error}`,
          details: error
        }
      }
    }
  }

  async getPaymentHistoryForQuoteRequest(quoteRequestId: string): Promise<RepositoryResult<PaymentHistoryItem[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payment_history')
        .select()
        .eq('quote_request_id', quoteRequestId)
        .order('timestamp', { ascending: false })

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch payment history: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: (data || []).map(row => this.mapPaymentHistoryRow(row))
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching payment history: ${error}`,
          details: error
        }
      }
    }
  }

  // Helper Operations

  private async createGlazingElementsForConfiguration(
    configurationId: string, 
    elements: (CreateGlazingElementInput & { elementType: any })[]
  ): Promise<RepositoryResult<GlazingElement[]>> {
    if (elements.length === 0) return { success: true, data: [] }

    try {
      const elementsData = elements.map(element => ({
        configuration_id: configurationId,
        element_type: element.elementType,
        width_m: element.widthM,
        height_m: element.heightM
      }))

      const { data, error } = await supabaseAdmin
        .from('glazing_elements')
        .insert(elementsData)
        .select()

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_INSERT_ERROR',
            message: `Failed to create glazing elements: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: (data || []).map(row => this.mapGlazingElementRow(row))
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error creating glazing elements: ${error}`,
          details: error
        }
      }
    }
  }

  private async createPermittedDevelopmentFlagsForConfiguration(
    configurationId: string, 
    flags: CreatePermittedDevelopmentFlagInput[]
  ): Promise<RepositoryResult<PermittedDevelopmentFlag[]>> {
    if (flags.length === 0) return { success: true, data: [] }

    try {
      const flagsData = flags.map(flag => ({
        configuration_id: configurationId,
        code: flag.code,
        label: flag.label
      }))

      const { data, error } = await supabaseAdmin
        .from('permitted_development_flags')
        .insert(flagsData)
        .select()

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_INSERT_ERROR',
            message: `Failed to create permitted development flags: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: (data || []).map(row => this.mapPermittedDevelopmentFlagRow(row))
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error creating permitted development flags: ${error}`,
          details: error
        }
      }
    }
  }

  private async getGlazingElementsForConfiguration(configurationId: string): Promise<RepositoryResult<GlazingElement[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('glazing_elements')
        .select()
        .eq('configuration_id', configurationId)
        .order('created_at', { ascending: true })

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch glazing elements: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: (data || []).map(row => this.mapGlazingElementRow(row))
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching glazing elements: ${error}`,
          details: error
        }
      }
    }
  }

  private async getPermittedDevelopmentFlagsForConfiguration(configurationId: string): Promise<RepositoryResult<PermittedDevelopmentFlag[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('permitted_development_flags')
        .select()
        .eq('configuration_id', configurationId)
        .order('created_at', { ascending: true })

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch permitted development flags: ${error.message}`,
            details: error
          }
        }
      }

      return {
        success: true,
        data: (data || []).map(row => this.mapPermittedDevelopmentFlagRow(row))
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching permitted development flags: ${error}`,
          details: error
        }
      }
    }
  }

  private async calculateTotalPayments(quoteRequestId: string): Promise<RepositoryResult<number>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payment_history')
        .select('amount')
        .eq('quote_request_id', quoteRequestId)

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to calculate total payments: ${error.message}`,
            details: error
          }
        }
      }

      const total = (data || []).reduce((sum, payment) => sum + payment.amount, 0)

      return {
        success: true,
        data: total
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error calculating total payments: ${error}`,
          details: error
        }
      }
    }
  }

  // Analytics and Reporting

  async getQuoteRequestSummary(filters?: QuoteRequestFilters): Promise<RepositoryResult<QuoteRequestSummary>> {
    try {
      let query = supabaseAdmin
        .from('quote_requests')
        .select(`
          id,
          payment_status,
          configuration_id,
          product_configurations (
            id,
            product_type,
            estimate_total_inc_vat
          )
        `)

      // Apply filters if provided
      if (filters) {
        if (filters.customerEmail) query = query.eq('customer_email', filters.customerEmail)
        if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus)
        if (filters.requestedAfter) query = query.gte('requested_at', filters.requestedAfter)
        if (filters.requestedBefore) query = query.lte('requested_at', filters.requestedBefore)
      }

      const { data, error } = await query

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_FETCH_ERROR',
            message: `Failed to fetch quote request summary: ${error.message}`,
            details: error
          }
        }
      }

      // Calculate summary statistics
      const totalRequests = data?.length || 0
      const totalValue = data?.reduce((sum, item) => {
        return sum + (item.product_configurations?.estimate_total_inc_vat || 0)
      }, 0) || 0
      const averageValue = totalRequests > 0 ? totalValue / totalRequests : 0

      // Payment status breakdown
      const paymentStatusBreakdown = (data || []).reduce((acc, item) => {
        const status = item.payment_status as PaymentStatus
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as { [key in PaymentStatus]: number })

      // Product type breakdown  
      const productTypeBreakdown = (data || []).reduce((acc, item) => {
        const productType = item.product_configurations?.product_type as ProductType
        if (productType) {
          acc[productType] = (acc[productType] || 0) + 1
        }
        return acc
      }, {} as { [key in ProductType]: number })

      return {
        success: true,
        data: {
          totalRequests,
          totalValue,
          averageValue,
          paymentStatusBreakdown,
          productTypeBreakdown
        }
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REPOSITORY_ERROR',
          message: `Unexpected error fetching quote request summary: ${error}`,
          details: error
        }
      }
    }
  }

  // Data Mapping Methods

  private mapProductConfigurationRow(row: ProductConfigurationRow): ProductConfiguration {
    return {
      id: row.id,
      productType: row.product_type,
      size: {
        widthM: row.width_m,
        depthM: row.depth_m,
        heightM: row.height_m
      },
      cladding: {
        areaSqm: row.cladding_area_sqm
      },
      bathroom: {
        half: row.bathroom_half,
        threeQuarter: row.bathroom_three_quarter
      },
      electrical: {
        switches: row.electrical_switches,
        sockets: row.electrical_sockets,
        downlight: row.electrical_downlight,
        heater: row.electrical_heater,
        undersinkHeater: row.electrical_undersink_heater,
        elecBoiler: row.electrical_elec_boiler
      },
      internalDoors: row.internal_doors,
      internalWall: {
        finish: row.internal_wall_finish,
        areaSqM: row.internal_wall_area_sqm
      },
      heaters: row.heaters,
      glazing: {
        windows: [],
        externalDoors: [],
        skylights: []
      },
      floor: {
        type: row.floor_type,
        areaSqM: row.floor_area_sqm
      },
      delivery: {
        distanceKm: row.delivery_distance_km,
        cost: row.delivery_cost
      },
      extras: {
        espInsulation: row.extras_esp_insulation,
        render: row.extras_render,
        steelDoor: row.extras_steel_door,
        other: (row.extras_other as any) || []
      },
      estimate: {
        currency: row.estimate_currency,
        subtotalExVat: row.estimate_subtotal_ex_vat,
        vatRate: row.estimate_vat_rate,
        totalIncVat: row.estimate_total_inc_vat
      },
      notes: row.notes,
      permittedDevelopmentFlags: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private mapQuoteRequestRow(row: QuoteRequestRow): QuoteRequest {
    return {
      id: row.id,
      configurationId: row.configuration_id,
      customer: {
        firstName: row.customer_first_name,
        lastName: row.customer_last_name || '',
        email: row.customer_email,
        phone: {
          countryPrefix: row.customer_phone_country_prefix,
          phoneNum: row.customer_phone_number
        },
        addressLine1: row.customer_address_line1,
        addressLine2: row.customer_address_line2,
        town: row.customer_town,
        county: row.customer_county,
        eircode: row.customer_eircode
      },
      payment: {
        status: row.payment_status,
        totalPaid: row.payment_total_paid,
        expectedInstallments: row.payment_expected_installments,
        lastPaymentAt: row.payment_last_payment_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        history: []
      },
      retention: {
        expiresAt: row.retention_expires_at
      },
      requestedAt: row.submitted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private mapGlazingElementRow(row: GlazingElementRow): GlazingElement {
    return {
      id: row.id,
      configurationId: row.configuration_id,
      elementType: row.element_type,
      widthM: row.width_m,
      heightM: row.height_m,
      createdAt: row.created_at
    }
  }

  private mapPermittedDevelopmentFlagRow(row: PermittedDevelopmentFlagRow): PermittedDevelopmentFlag {
    return {
      id: row.id,
      configurationId: row.configuration_id,
      code: row.code,
      label: row.label,
      createdAt: row.created_at
    }
  }

  private mapPaymentHistoryRow(row: PaymentHistoryRow): PaymentHistoryItem {
    return {
      id: row.id,
      quoteRequestId: row.quote_request_id,
      paymentType: row.payment_type,
      amount: row.amount,
      installmentNumber: row.installment_number,
      note: row.note,
      recordedBy: row.recorded_by,
      timestamp: row.timestamp,
      createdAt: row.created_at
    }
  }
}
