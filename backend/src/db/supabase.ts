// Supabase client setup for MongoDB to Supabase migration
// Replaces MongoDB connection with Supabase PostgreSQL client
// Date: 2025-10-23

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment variable validation
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// Public client (for frontend-facing operations with RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side, no session persistence
  },
  db: {
    schema: 'public',
  },
})

// Service role client (for backend operations, bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
})

// Database connection health check
export async function checkDatabaseConnection(): Promise<{
  isHealthy: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    // Simple query to test connection
    const { error } = await supabaseAdmin
      .from('product_configurations')
      .select('id')
      .limit(1)
    
    if (error) {
      return {
        isHealthy: false,
        error: `Database query failed: ${error.message}`,
      }
    }
    
    const latency = Date.now() - startTime
    return {
      isHealthy: true,
      latency,
    }
  } catch (err) {
    return {
      isHealthy: false,
      error: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

// Database connection info for monitoring
export function getDatabaseInfo() {
  return {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceRoleKey: !!supabaseServiceRoleKey,
    clientVersion: '2.x',
    schema: 'public',
  }
}

// Error handling utilities for Supabase-specific errors
export function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return typeof error === 'object' && 
         error !== null && 
         'message' in error && 
         (('code' in error) || ('details' in error) || ('hint' in error))
}

export function handleSupabaseError(error: unknown): {
  message: string
  code?: string
  isUserError: boolean
} {
  if (isSupabaseError(error)) {
    const isUserError = error.code === 'PGRST116' || // Row not found
                       error.code === '23505' ||    // Unique constraint violation
                       error.code === '23503' ||    // Foreign key constraint violation
                       error.code === '23514'       // Check constraint violation
    
    return {
      message: error.message,
      code: error.code,
      isUserError,
    }
  }
  
  return {
    message: error instanceof Error ? error.message : 'Unknown database error',
    isUserError: false,
  }
}

// Transaction wrapper (for operations that need atomicity)
export async function withTransaction<T>(
  operation: (client: typeof supabaseAdmin) => Promise<T>
): Promise<T> {
  // Note: Supabase doesn't have explicit transaction support in the client
  // For now, we use the service role client directly
  // For true transactions, consider using raw SQL or database functions
  return operation(supabaseAdmin)
}

// Connection lifecycle management
export async function initializeDatabase(): Promise<void> {
  console.log('Initializing Supabase connection...')
  
  const health = await checkDatabaseConnection()
  
  if (!health.isHealthy) {
    throw new Error(`Database initialization failed: ${health.error}`)
  }
  
  console.log(`Database connected successfully (latency: ${health.latency}ms)`)
}

export async function closeDatabase(): Promise<void> {
  // Supabase client doesn't need explicit closing
  // Connection pooling is handled automatically
  console.log('Database connections closed')
}

// Export default instance for backward compatibility
export default supabaseAdmin