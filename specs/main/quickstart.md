# Quickstart: MongoDB to Supabase Migration

**Feature**: Migrate from DigitalOcean MongoDB to Supabase  
**Date**: 2025-10-22  
**Prerequisites**: Node.js 18+, npm/yarn, Git access to Strata repository

## Overview

This quickstart guide provides step-by-step instructions for developers to set up and integrate Supabase as the new database backend for Strata. Since the current MongoDB database is empty, this is a clean technology replacement that maintains all existing API contracts while providing better type safety and developer experience.

## What's Being Changed

### Before (MongoDB)
- DigitalOcean hosted MongoDB cluster
- MongoDB Node.js driver with ObjectIds
- Document-based data storage
- Manual connection pooling and error handling

### After (Supabase)
- Supabase PostgreSQL database with auto-generated APIs
- Supabase JavaScript client with TypeScript support
- Relational data model with foreign keys and constraints
- Built-in connection pooling, auth, and real-time capabilities

## Prerequisites Setup

### 1. Install Supabase CLI

**Windows (PowerShell):**
```powershell
# Using Chocolatey (recommended)
choco install supabase

# Or using npm
npm install -g supabase
```

**Verify installation:**
```powershell
supabase --version
```

### 2. Create Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login with GitHub account
3. Create new project:
   - Name: `strata-garden-rooms-dev`
   - Database password: Generate secure password
   - Region: Choose closest to Ireland (eu-west-1)

### 3. Get Project Configuration

From your Supabase project dashboard:
1. Go to Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon (public) key**: `eyJ...` (public key)
   - **Service role key**: `eyJ...` (secret key - for server use only)

## Local Development Setup

### 1. Clone and Setup Repository

```powershell
# Navigate to the backend directory
cd "E:\Zhaoxiang_Qiu\work\SDeal\Strata\backend"

# Install new dependencies
npm install @supabase/supabase-js
npm install --save-dev supabase
```

### 2. Environment Configuration

Create/update `.env` file in backend directory:

```env
# Supabase Configuration (Primary Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ_your_anon_key_here
SUPABASE_SERVICE_KEY=eyJ_your_service_key_here

# Optional: Keep MongoDB config for reference during transition
# MONGODB_URI=your_existing_mongodb_uri
# MONGODB_DB_NAME=strata_garden_rooms

# Application Settings
NODE_ENV=development
PORT=3001
```

### 3. Initialize Local Supabase (Optional)

For complete local development:

```powershell
# Initialize Supabase in project root
cd "E:\Zhaoxiang_Qiu\work\SDeal\Strata"
supabase init

# Start local Supabase stack (PostgreSQL, API, Dashboard)
supabase start
```

This creates:
- Local PostgreSQL on `postgresql://postgres:postgres@localhost:54322/postgres`
- Local API server on `http://localhost:54321`
- Local dashboard on `http://localhost:54323`

## Database Schema Setup

### 1. Apply Schema Migrations

**Using Remote Supabase:**
```powershell
# Link to your remote project
supabase link --project-ref your-project-ref

# Create and run migration
supabase migration new initial_schema
```

**Copy the schema from `data-model.md` into the migration file**, then:

```powershell
# Apply migration to remote database
supabase db push
```

**Using Local Supabase:**
```powershell
# Migration is applied automatically to local DB
supabase migration up
```

### 2. Generate TypeScript Types

```powershell
# Generate types from database schema
supabase gen types typescript --linked > src/types/supabase.ts

# Or for local development
supabase gen types typescript --local > src/types/supabase.ts
```

## Code Implementation Guide

### 1. Supabase Client Setup

Create `src/db/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY! // Use service key for server-side

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// For API operations that need elevated permissions
export const adminSupabase = supabase

// Health check function
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('product_configurations').select('count').limit(1)
    if (error) throw error
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}
```

### 2. Update Repository Pattern

Example for `src/db/repos/quotes.ts`:

```typescript
import { supabase } from '../supabase'
import type { Database } from '../../types/supabase'

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row']
type QuoteInsert = Database['public']['Tables']['quote_requests']['Insert']
type QuoteUpdate = Database['public']['Tables']['quote_requests']['Update']

export class QuotesRepository {
  
  async createQuoteRequest(quote: QuoteInsert): Promise<string> {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert(quote)
      .select('id')
      .single()
    
    if (error) throw error
    return data.id
  }

  async getQuoteRequest(id: string): Promise<QuoteRequest | null> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        product_configurations(*),
        payment_history(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    
    return data
  }

  async listQuotes(options: ListOptions = {}): Promise<ListResult> {
    let query = supabase
      .from('quote_requests')
      .select(`
        *,
        product_configurations(*),
        payment_history(*)
      `, { count: 'exact' })

    // Apply filters
    if (options.status) {
      query = query.eq('payment_status', options.status)
    }

    // Apply sorting
    const sortBy = options.sortBy || 'created_at'
    const ascending = options.sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const page = options.page || 1
    const limit = options.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    query = query.range(from, to)

    const { data, error, count } = await query
    
    if (error) throw error

    return {
      quotes: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}
```

### 3. Update API Routes

Example for `src/api/quotes.ts`:

```typescript
import { QuotesRepository } from '../db/repos/quotes'

const quotesRepo = new QuotesRepository()

// Existing route handlers work with minimal changes
export async function createQuote(req: Request, res: Response) {
  try {
    const quoteId = await quotesRepo.createQuoteRequest(req.body)
    
    res.status(201).json({
      success: true,
      id: quoteId,
      message: 'Quote created successfully'
    })
  } catch (error) {
    console.error('Create quote error:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to create quote'
    })
  }
}
```

## Testing Strategy

### 1. Unit Tests

Update existing tests to work with Supabase:

```typescript
// tests/unit/repos/quotes.test.ts
import { QuotesRepository } from '../../../src/db/repos/quotes'

describe('QuotesRepository', () => {
  beforeEach(async () => {
    // Clean up test data
    await supabase.from('quote_requests').delete().neq('id', '')
  })

  it('should create a quote request', async () => {
    const repo = new QuotesRepository()
    const quote = { /* test data */ }
    
    const id = await repo.createQuoteRequest(quote)
    
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })
})
```

### 2. Integration Tests

Test complete API workflows:

```typescript
// tests/integration/quotes-api.test.ts
import request from 'supertest'
import app from '../../src/api/server'

describe('Quotes API', () => {
  it('should create and retrieve a quote', async () => {
    // Create quote
    const createResponse = await request(app)
      .post('/api/quotes')
      .send(testQuoteData)
      .expect(201)

    const quoteId = createResponse.body.id

    // Retrieve quote
    const getResponse = await request(app)
      .get(`/api/quotes/${quoteId}`)
      .expect(200)

    expect(getResponse.body.id).toBe(quoteId)
  })
})
```

## Database Setup Validation

### 1. Test Schema Creation

```typescript
// src/migrations/validate-schema.ts
import { supabase } from '../db/supabase'

async function validateSchema() {
  try {
    // Test basic table access
    const { data, error } = await supabase
      .from('product_configurations')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('✅ product_configurations table accessible')
    
    // Test other tables
    const tables = ['quote_requests', 'glazing_elements', 'payment_history']
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) throw error
      console.log(`✅ ${table} table accessible`)
    }
    
    console.log('🎉 All tables are properly configured')
  } catch (error) {
    console.error('❌ Schema validation failed:', error)
  }
}
```

### 2. Test Sample Data Operations

```typescript
// src/migrations/test-operations.ts
import { supabase } from '../db/supabase'

async function testOperations() {
  // Test insert
  const { data: config, error: insertError } = await supabase
    .from('product_configurations')
    .insert({
      product_type: 'garden-room',
      width_m: 5.0,
      depth_m: 3.0,
      cladding_area_sqm: 30.0,
      // ... other required fields
    })
    .select()
    .single()
  
  if (insertError) throw insertError
  console.log('✅ Insert operation successful')
  
  // Test read
  const { data: readConfig, error: readError } = await supabase
    .from('product_configurations')
    .select('*')
    .eq('id', config.id)
    .single()
  
  if (readError) throw readError
  console.log('✅ Read operation successful')
  
  // Clean up
  await supabase.from('product_configurations').delete().eq('id', config.id)
  console.log('✅ Delete operation successful')
}
```

## Development Workflow

### 1. Daily Development

```powershell
# Start development environment
cd "E:\Zhaoxiang_Qiu\work\SDeal\Strata\backend"

# Start local Supabase (if using local setup)
supabase start

# Run development server
npm run dev

# In another terminal, run tests
npm test -- --watch
```

### 2. Making Schema Changes

```powershell
# Create new migration
supabase migration new add_user_table

# Edit the migration file, then apply
supabase db push

# Update TypeScript types
supabase gen types typescript --linked > src/types/supabase.ts
```

### 3. Debugging

**Check Supabase Dashboard:**
- Local: `http://localhost:54323`
- Remote: Your project dashboard on supabase.com

**Useful CLI commands:**
```powershell
# View logs
supabase logs

# Reset local database
supabase db reset

# Check status
supabase status
```

## Performance Considerations

### 1. Query Optimization
- Use `select()` to fetch only needed columns
- Use `single()` when expecting one result
- Implement proper pagination with `range()`

### 2. Connection Pooling
- Supabase handles this automatically
- Monitor connection usage in dashboard
- Use read replicas for heavy read workloads (production)

### 3. Caching Strategy
```typescript
// Example: Cache frequently accessed configurations
const configCache = new Map<string, Configuration>()

async function getCachedConfiguration(id: string) {
  if (configCache.has(id)) {
    return configCache.get(id)
  }
  
  const config = await quotesRepo.getConfiguration(id)
  if (config) {
    configCache.set(id, config)
  }
  
  return config
}
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check environment variables are set correctly
   - Verify network connectivity to Supabase
   - Check project URL and keys in dashboard

2. **Type Errors**
   - Regenerate types: `supabase gen types typescript`
   - Ensure schema changes are applied
   - Check TypeScript version compatibility

3. **Migration Issues**
   - Verify data transformation logic
   - Check foreign key constraints
   - Review error logs in Supabase dashboard

### Getting Help

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Project Issues**: Use repository issue tracker

## Next Steps

1. **Implement Repository Classes**: Start with `QuotesRepository`
2. **Create Migration Scripts**: For data transfer
3. **Update API Routes**: Maintain existing contracts
4. **Add Comprehensive Tests**: Unit and integration
5. **Performance Testing**: Ensure response times meet requirements
6. **Documentation**: Update API docs and deployment guides

## Useful Commands Reference

```powershell
# Supabase CLI
supabase start              # Start local stack
supabase stop               # Stop local stack
supabase status             # Check status
supabase logs               # View logs
supabase migration new      # Create migration
supabase db push            # Apply migrations
supabase gen types          # Generate TypeScript types

# Development
npm run dev                 # Start dev server
npm test                    # Run tests
npm run build               # Build for production
npm run lint                # Run linting

# Database
supabase db reset           # Reset local database
supabase db dump            # Dump database
supabase db restore         # Restore database
```