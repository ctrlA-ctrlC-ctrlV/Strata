import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToMongo(): Promise<Db> {
  if (db) {
    return db
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required')
  }

  const dbName = process.env.MONGODB_DB_NAME || 'strata_garden_rooms'

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()
    db = client.db(dbName)
    
    console.log(`Connected to MongoDB database: ${dbName}`)
    
    // Test the connection
    await db.admin().ping()
    console.log('MongoDB ping successful')
    
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongo() first.')
  }
  return db
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('MongoDB connection closed')
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await closeMongo()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeMongo()
  process.exit(0)
})