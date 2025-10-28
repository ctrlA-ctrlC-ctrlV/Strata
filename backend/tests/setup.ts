import { config } from 'dotenv'

// Load environment variables for testing - try .env.test first, then .env
config({ path: '.env.test' })
config({ path: '.env' })

// Set test environment
process.env.NODE_ENV = 'test'

// Validate that Supabase environment variables are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Supabase environment variables not found. Tests may fail.')
  console.warn('Make sure .env file has: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
}