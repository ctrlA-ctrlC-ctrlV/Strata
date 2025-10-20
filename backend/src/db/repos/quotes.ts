/**
 * Quotes repository for managing quote requests and configurations
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb'

export interface ProductConfiguration {
  id: string
  productType: 'garden-room' | 'house-extension' | 'house-build'
  size: { widthM: number; depthM: number }
  cladding: { areaSqm: number }
  bathroom: { half: number; threeQuarter: number }
  electrical: {
    switches: number
    sockets: number
    heater?: number
    undersinkHeater?: number
    elecBoiler?: number
  }
  internalDoors: number
  internalWall: { finish: 'none' | 'panel' | 'skimPaint'; areaSqM?: number }
  heaters: number
  glazing: {
    windows: Array<{ widthM: number; heightM: number }>
    externalDoors: Array<{ widthM: number; heightM: number }>
    skylights: Array<{ widthM: number; heightM: number }>
  }
  floor: { type: 'none' | 'wooden' | 'tile'; areaSqM: number }
  delivery: { distanceKm?: number; cost: number }
  extras: {
    espInsulation?: number
    render?: number
    steelDoor?: number
    other: Array<{ title: string; cost: number }>
  }
  estimate: { currency: string; subtotalExVat: number; vatRate: number; totalIncVat: number }
  notes: string
  permittedDevelopmentFlags: Array<{ code: string; label: string }>
  createdAt: Date
  updatedAt: Date
}

export interface QuoteRequest {
  id: string
  configId: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: { countryPrefix: string; phoneNum: string }
    addressLine1: string
    addressLine2?: string
    town?: string
    county?: string
    eircode: string
  }
  desiredInstallTimeframe: string
  quoteNumber: string
  payment: {
    status: 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded'
    totalPaid: number
    expectedInstallments?: number | null
    lastPaymentAt?: Date | null
    createdAt: Date
    updatedAt: Date
    history: Array<{
      id: string
      type: 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT'
      amount: number
      timestamp: Date
      note?: string
      installmentNo?: number | null
      recordedBy?: string | null
    }>
  }
  retention: { expiresAt: Date }
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

export class QuotesRepository {
  private db: Db
  private configCollection: Collection<ProductConfiguration>
  private quotesCollection: Collection<QuoteRequest>

  constructor(db: Db) {
    this.db = db
    this.configCollection = db.collection<ProductConfiguration>('product_configurations')
    this.quotesCollection = db.collection<QuoteRequest>('quote_requests')
  }

  /**
   * Create a new product configuration
   */
  async createConfiguration(config: Omit<ProductConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const document = {
      ...config,
      createdAt: now,
      updatedAt: now
    }

    const result = await this.configCollection.insertOne(document as any)
    return result.insertedId.toString()
  }

  /**
   * Get a product configuration by ID
   */
  async getConfiguration(id: string): Promise<ProductConfiguration | null> {
    if (!ObjectId.isValid(id)) return null
    
    const result = await this.configCollection.findOne({ _id: new ObjectId(id) })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as ProductConfiguration
  }

  /**
   * Update a product configuration
   */
  async updateConfiguration(id: string, updates: Partial<ProductConfiguration>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.configCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )

    return result.modifiedCount > 0
  }

  /**
   * Create a new quote request
   */
  async createQuoteRequest(quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const document = {
      ...quote,
      createdAt: now,
      updatedAt: now
    }

    const result = await this.quotesCollection.insertOne(document as any)
    return result.insertedId.toString()
  }

  /**
   * Get a quote request by ID
   */
  async getQuoteRequest(id: string): Promise<QuoteRequest | null> {
    if (!ObjectId.isValid(id)) return null
    
    const result = await this.quotesCollection.findOne({ _id: new ObjectId(id) })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as QuoteRequest
  }

  /**
   * Get a quote request by quote number
   */
  async getQuoteRequestByNumber(quoteNumber: string): Promise<QuoteRequest | null> {
    const result = await this.quotesCollection.findOne({ quoteNumber })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as QuoteRequest
  }

  /**
   * Update a quote request
   */
  async updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.quotesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )

    return result.modifiedCount > 0
  }

  /**
   * Generate a unique quote number
   */
  async generateQuoteNumber(): Promise<string> {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    const year = now.getFullYear()
    const prefix = `Q${quarter}-${year}`

    // Find the highest existing number for this quarter
    const lastQuote = await this.quotesCollection
      .findOne(
        { quoteNumber: { $regex: `^${prefix}-` } },
        { sort: { quoteNumber: -1 } }
      )

    let nextNumber = 1
    if (lastQuote?.quoteNumber) {
      const match = lastQuote.quoteNumber.match(/-(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(5, '0')}`
  }

  /**
   * Get quotes pending retention cleanup
   */
  async getExpiredQuotes(): Promise<QuoteRequest[]> {
    const now = new Date()
    const results = await this.quotesCollection
      .find({
        'retention.expiresAt': { $lt: now },
        'payment.status': { $nin: ['paid', 'installments'] }
      })
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as QuoteRequest[]
  }

  /**
   * Delete expired quotes
   */
  async deleteExpiredQuotes(): Promise<number> {
    const now = new Date()
    
    // First, get the config IDs to clean up
    const expiredQuotes = await this.quotesCollection
      .find(
        {
          'retention.expiresAt': { $lt: now },
          'payment.status': { $nin: ['paid', 'installments'] }
        },
        { projection: { configId: 1 } }
      )
      .toArray()

    const configIds = expiredQuotes.map(q => q.configId).filter(Boolean)

    // Delete the quotes
    const quoteResult = await this.quotesCollection.deleteMany({
      'retention.expiresAt': { $lt: now },
      'payment.status': { $nin: ['paid', 'installments'] }
    })

    // Delete associated configurations
    if (configIds.length > 0) {
      await this.configCollection.deleteMany({
        _id: { $in: configIds.map(id => new ObjectId(id)) }
      })
    }

    return quoteResult.deletedCount
  }

  /**
   * List quotes with pagination and filtering
   */
  async listQuotes(options: {
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ quotes: QuoteRequest[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (options.status) {
      filter['payment.status'] = options.status
    }

    // Build sort
    const sort: any = {}
    const sortBy = options.sortBy || 'createdAt'
    sort[sortBy] = options.sortOrder === 'asc' ? 1 : -1

    // Get total count
    const total = await this.quotesCollection.countDocuments(filter)

    // Get paginated results
    const results = await this.quotesCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    const quotes = results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as QuoteRequest[]

    return {
      quotes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }
}