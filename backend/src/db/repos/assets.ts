/**
 * Assets repository for managing admin assets (logos, banners, gallery images)
 */

import { Db, Collection, ObjectId } from 'mongodb'

export interface AdminAsset {
  id: string
  kind: 'logo' | 'banner' | 'gallery' | 'other'
  url: string
  alt: string
  metadata?: Record<string, string>
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export class AssetsRepository {
  private db: Db
  private collection: Collection<AdminAsset>

  constructor(db: Db) {
    this.db = db
    this.collection = db.collection<AdminAsset>('admin_assets')
  }

  /**
   * Create a new admin asset
   */
  async createAsset(asset: Omit<AdminAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const document = {
      ...asset,
      createdAt: now,
      updatedAt: now
    }

    const result = await this.collection.insertOne(document as any)
    return result.insertedId.toString()
  }

  /**
   * Get an asset by ID
   */
  async getAsset(id: string): Promise<AdminAsset | null> {
    if (!ObjectId.isValid(id)) return null
    
    const result = await this.collection.findOne({ _id: new ObjectId(id) })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as AdminAsset
  }

  /**
   * Get assets by kind
   */
  async getAssetsByKind(kind: AdminAsset['kind'], publishedOnly: boolean = true): Promise<AdminAsset[]> {
    const filter: any = { kind }
    if (publishedOnly) {
      filter.published = true
    }

    const results = await this.collection.find(filter).sort({ createdAt: -1 }).toArray()
    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as AdminAsset[]
  }

  /**
   * List all assets with pagination
   */
  async listAssets(options: {
    page?: number
    limit?: number
    kind?: AdminAsset['kind']
    published?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ assets: AdminAsset[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (options.kind) {
      filter.kind = options.kind
    }
    if (typeof options.published === 'boolean') {
      filter.published = options.published
    }

    // Build sort
    const sort: any = {}
    const sortBy = options.sortBy || 'createdAt'
    sort[sortBy] = options.sortOrder === 'asc' ? 1 : -1

    // Get total count
    const total = await this.collection.countDocuments(filter)

    // Get paginated results
    const results = await this.collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    const assets = results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as AdminAsset[]

    return {
      assets,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Update an asset
   */
  async updateAsset(id: string, updates: Partial<AdminAsset>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.collection.updateOne(
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
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  /**
   * Publish/unpublish an asset
   */
  async setPublished(id: string, published: boolean): Promise<boolean> {
    return this.updateAsset(id, { published })
  }

  /**
   * Search assets by metadata
   */
  async searchAssets(query: string, kind?: AdminAsset['kind']): Promise<AdminAsset[]> {
    const filter: any = {
      $or: [
        { alt: { $regex: query, $options: 'i' } },
        { 'metadata.title': { $regex: query, $options: 'i' } },
        { 'metadata.description': { $regex: query, $options: 'i' } }
      ]
    }

    if (kind) {
      filter.kind = kind
    }

    const results = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as AdminAsset[]
  }
}