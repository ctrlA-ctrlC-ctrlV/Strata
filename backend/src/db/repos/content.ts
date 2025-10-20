/**
 * Content repository for managing testimonials, gallery items, and other content
 */

import { Db, Collection, ObjectId } from 'mongodb'

export interface Testimonial {
  id: string
  published: boolean
  quote: string
  author: string
  context?: {
    projectType?: string
    location?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface GalleryItem {
  id: string
  quoteNumber: string
  featured: boolean
  title: string
  description: string
  category: 'garden-rooms' | 'house-extensions' | 'house-builds'
  images: Array<{ url: string; alt: string }>
  locationRegion?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export class ContentRepository {
  private db: Db
  private testimonialsCollection: Collection<Testimonial>
  private galleryCollection: Collection<GalleryItem>

  constructor(db: Db) {
    this.db = db
    this.testimonialsCollection = db.collection<Testimonial>('testimonials')
    this.galleryCollection = db.collection<GalleryItem>('gallery_items')
  }

  // ===== TESTIMONIALS =====

  /**
   * Create a new testimonial
   */
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const document = {
      ...testimonial,
      createdAt: now,
      updatedAt: now
    }

    const result = await this.testimonialsCollection.insertOne(document as any)
    return result.insertedId.toString()
  }

  /**
   * Get a testimonial by ID
   */
  async getTestimonial(id: string): Promise<Testimonial | null> {
    if (!ObjectId.isValid(id)) return null
    
    const result = await this.testimonialsCollection.findOne({ _id: new ObjectId(id) })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as Testimonial
  }

  /**
   * List testimonials with filtering
   */
  async listTestimonials(options: {
    published?: boolean
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ testimonials: Testimonial[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (typeof options.published === 'boolean') {
      filter.published = options.published
    }

    // Build sort
    const sort: any = {}
    const sortBy = options.sortBy || 'createdAt'
    sort[sortBy] = options.sortOrder === 'asc' ? 1 : -1

    // Get total count
    const total = await this.testimonialsCollection.countDocuments(filter)

    // Get paginated results
    const results = await this.testimonialsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    const testimonials = results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as Testimonial[]

    return {
      testimonials,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Update a testimonial
   */
  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.testimonialsCollection.updateOne(
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
   * Delete a testimonial
   */
  async deleteTestimonial(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.testimonialsCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  /**
   * Get published testimonials for public display
   */
  async getPublishedTestimonials(limit: number = 10): Promise<Testimonial[]> {
    const results = await this.testimonialsCollection
      .find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as Testimonial[]
  }

  // ===== GALLERY ITEMS =====

  /**
   * Create a new gallery item
   */
  async createGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date()
    const document = {
      ...item,
      createdAt: now,
      updatedAt: now
    }

    const result = await this.galleryCollection.insertOne(document as any)
    return result.insertedId.toString()
  }

  /**
   * Get a gallery item by ID
   */
  async getGalleryItem(id: string): Promise<GalleryItem | null> {
    if (!ObjectId.isValid(id)) return null
    
    const result = await this.galleryCollection.findOne({ _id: new ObjectId(id) })
    if (!result) return null

    return {
      ...result,
      id: result._id.toString()
    } as GalleryItem
  }

  /**
   * List gallery items with filtering
   */
  async listGalleryItems(options: {
    category?: GalleryItem['category']
    featured?: boolean
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ items: GalleryItem[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (options.category) {
      filter.category = options.category
    }
    if (typeof options.featured === 'boolean') {
      filter.featured = options.featured
    }

    // Build sort
    const sort: any = {}
    const sortBy = options.sortBy || 'createdAt'
    sort[sortBy] = options.sortOrder === 'asc' ? 1 : -1

    // Get total count
    const total = await this.galleryCollection.countDocuments(filter)

    // Get paginated results
    const results = await this.galleryCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    const items = results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as GalleryItem[]

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Update a gallery item
   */
  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.galleryCollection.updateOne(
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
   * Delete a gallery item
   */
  async deleteGalleryItem(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    const result = await this.galleryCollection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  /**
   * Get gallery items by category for public display
   */
  async getGalleryByCategory(category: GalleryItem['category'], limit: number = 50): Promise<GalleryItem[]> {
    const results = await this.galleryCollection
      .find({ category })
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as GalleryItem[]
  }

  /**
   * Get featured gallery items
   */
  async getFeaturedGalleryItems(limit: number = 12): Promise<GalleryItem[]> {
    const results = await this.galleryCollection
      .find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as GalleryItem[]
  }

  /**
   * Search gallery items by tags or text
   */
  async searchGalleryItems(query: string, category?: GalleryItem['category']): Promise<GalleryItem[]> {
    const filter: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { locationRegion: { $regex: query, $options: 'i' } }
      ]
    }

    if (category) {
      filter.category = category
    }

    const results = await this.galleryCollection
      .find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .limit(50)
      .toArray()

    return results.map(doc => ({
      ...doc,
      id: doc._id.toString()
    })) as GalleryItem[]
  }
}