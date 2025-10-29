# Developer Onboarding: Strata Garden Rooms - Supabase Backend

**Feature**: Supabase PostgreSQL Backend  
**Status**: ✅ Migration Complete  
**Date**: 2025-10-28  
**Prerequisites**: Node.js 18+, npm/yarn, Git access to Strata repository

## Overview

This guide helps new developers quickly get up to speed with the Strata Garden Rooms codebase, which uses Supabase PostgreSQL as the backend database. The migration from MongoDB to Supabase has been completed, providing better type safety, performance, and developer experience.

## Technology Stack

### Backend
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **API**: Express.js with TypeScript
- **ORM**: Supabase JavaScript client v2.x with auto-generated types
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer with SMTP configuration
- **Testing**: Jest with integration test suite

### Frontend  
- **Framework**: Vanilla TypeScript with Vite build system
- **Styling**: CSS modules with critical CSS optimization
- **Testing**: Playwright for E2E testing, Vitest for unit tests
- **Analytics**: Custom event tracking system

## Quick Start (5 minutes)

### 1. Environment Setup

```powershell
# Clone and navigate to the project
cd "E:\Zhaoxiang_Qiu\work\SDeal\Strata"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `backend/.env` file:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJ_your_service_key_here

# Application Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional for local development)
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=dev@stratagarden.ie

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
BCRYPT_ROUNDS=12
```

### 3. Database Schema Setup

The database schema is already defined in `backend/supabase/migrations/20251023001000_initial_schema.sql`.

**Option A: Use Remote Supabase Project**
```powershell
# Link to your Supabase project
cd backend
npx supabase link --project-ref your-project-ref

# Apply the schema migration
npx supabase db push
```

**Option B: Use Local Supabase (Recommended for Development)**
```powershell
# Start local Supabase stack
cd backend
npx supabase start

# Schema is automatically applied to local instance
# Local services will be available at:
# - Database: postgresql://postgres:postgres@localhost:54322/postgres
# - API: http://localhost:54321
# - Dashboard: http://localhost:54323
```

### 4. Generate TypeScript Types

```powershell
# Generate types from your database schema
npx supabase gen types typescript --linked > src/types/supabase.ts

# Or for local development
npx supabase gen types typescript --local > src/types/supabase.ts
```

### 5. Run the Application

```powershell
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server  
cd frontend
npm run dev

# Terminal 3: Run tests (optional)
cd backend
npm test
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Supabase Dashboard**: http://localhost:54323 (if using local setup)

## Project Structure

## Project Structure

```
Strata/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── api/               # API route handlers
│   │   │   ├── quotes.ts      # Quote management endpoints
│   │   │   ├── contact.ts     # Contact form endpoints
│   │   │   └── server.ts      # Express server setup
│   │   ├── db/                # Database layer
│   │   │   ├── supabase.ts    # Supabase client configuration
│   │   │   └── repos/         # Repository pattern implementations
│   │   │       └── quotes.ts  # Quote data access layer
│   │   ├── services/          # Business logic layer
│   │   │   ├── quotes.ts      # Quote processing logic
│   │   │   ├── mailer.ts      # Email service
│   │   │   └── validation.ts  # Input validation schemas
│   │   ├── types/             # TypeScript type definitions
│   │   │   ├── entities.ts    # Business entity types
│   │   │   └── supabase.ts    # Auto-generated DB types
│   │   ├── security/          # Security middleware
│   │   │   └── security.ts    # Rate limiting, sanitization
│   │   ├── scripts/           # Utility scripts
│   │   │   ├── health-check.ts       # Database health validation
│   │   │   ├── performance-*.ts      # Performance testing tools
│   │   │   └── migration-validator.ts # Migration completeness check
│   │   └── migrations/        # Database migration utilities
│   ├── supabase/              # Supabase configuration
│   │   ├── config.toml        # Local Supabase settings
│   │   └── migrations/        # SQL schema migrations
│   ├── tests/                 # Test suite
│   │   ├── integration/       # API integration tests
│   │   └── unit/              # Unit tests
│   └── docs/                  # Backend documentation
├── frontend/                  # Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-specific components
│   │   ├── lib/               # Utility libraries
│   │   └── styles/            # CSS modules and styles
│   ├── public/                # Static assets
│   └── tests/                 # Frontend tests
└── specs/                     # Project specifications
    └── main/                  # Main feature specifications
        ├── contracts/         # API documentation (OpenAPI)
        ├── data-model.md      # Database schema documentation
        ├── plan.md            # Technical architecture plan
        ├── tasks.md           # Implementation task breakdown
        └── quickstart.md      # This file
```

## Core Concepts

### 1. Repository Pattern

The codebase uses the repository pattern to abstract database operations:

```typescript
// Example: backend/src/db/repos/quotes.ts
export class QuotesRepository {
  async createQuoteRequest(input: CreateQuoteRequestInput): Promise<RepositoryResult<QuoteRequest>> {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .insert(input)
        .select()
        .single()

      if (error) {
        return { success: false, error: { message: error.message, code: error.code } }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: { message: 'Database operation failed' } }
    }
  }
}
```

### 2. Type Safety

All database operations are fully typed using auto-generated types:

```typescript
// Auto-generated from database schema
import type { Database } from '../types/supabase'

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row']
type QuoteInsert = Database['public']['Tables']['quote_requests']['Insert']
type QuoteUpdate = Database['public']['Tables']['quote_requests']['Update']
```

### 3. Error Handling

Consistent error handling pattern throughout the application:

```typescript
interface RepositoryResult<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    httpStatus?: number
  }
}
```

## Development Workflow

### 1. Making Code Changes

```powershell
# Create a feature branch
git checkout -b feature/new-functionality

# Make your changes
# ...

# Run tests to ensure everything works
cd backend
npm test

# Run linting
npm run lint

# Build the project
npm run build

# Commit your changes
git add .
git commit -m "feat: add new functionality"
```

### 2. Database Schema Changes

```powershell
# Create a new migration
cd backend
npx supabase migration new add_new_table

# Edit the generated migration file in supabase/migrations/
# Add your SQL DDL statements

# Test the migration locally
npx supabase db reset  # Resets and applies all migrations

# Generate updated TypeScript types
npx supabase gen types typescript --local > src/types/supabase.ts

# Update your code to use the new schema
# Run tests to ensure compatibility
npm test
```

### 3. Testing Strategy

**Unit Tests**: Test individual functions and classes
```powershell
# Run specific test file
npm test -- quotes.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

**Integration Tests**: Test complete API workflows
```powershell
# Run integration tests
npm test -- tests/integration/

# Test specific endpoint
npm test -- tests/integration/quotes-api.test.ts
```

**Performance Tests**: Validate response times and load capacity
```powershell
# Run performance validation
npm run performance-validator

# Run migration completeness check
npm run migration-validator

# Run health check
npm run health-check
```

## Available Scripts

### Backend Scripts

```powershell
cd backend

# Development
npm run dev                    # Start development server with hot reload
npm run build                  # Build TypeScript to JavaScript
npm start                      # Start production server

# Testing
npm test                       # Run all tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Run tests with coverage report

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues automatically
npm run type-check            # Run TypeScript compiler check

# Database & Performance
npm run health-check          # Check database connectivity and health
npm run performance-monitor   # Monitor system performance
npm run performance-validator # Validate query performance
npm run migration-validator   # Check migration completeness
npm run cost-analysis         # Analyze infrastructure costs
```

### Frontend Scripts

```powershell
cd frontend

# Development
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview              # Preview production build

# Testing
npm test                     # Run unit tests
npm run test:e2e            # Run end-to-end tests
npm run test:ui             # Run tests with UI

# Code Quality
npm run lint                # Run linting
npm run type-check         # TypeScript type checking
```

## Common Development Tasks

### 1. Adding a New API Endpoint

1. **Define types** in `backend/src/types/entities.ts`
2. **Add repository method** in appropriate repository class
3. **Create API handler** in `backend/src/api/`
4. **Add validation schema** in `backend/src/services/validation.ts`
5. **Write tests** in `backend/tests/`
6. **Update API documentation** in `specs/main/contracts/openapi.yaml`

### 2. Adding a New Database Table

1. **Create migration** with `npx supabase migration new table_name`
2. **Write SQL DDL** in the migration file
3. **Apply migration** with `npx supabase db push`
4. **Generate types** with `npx supabase gen types typescript`
5. **Update entity types** in `backend/src/types/entities.ts`
6. **Create repository class** for the new entity
7. **Write tests** for the new functionality

### 3. Debugging Issues

**Database Issues:**
```powershell
# Check Supabase connection
npm run health-check

# View local Supabase logs
npx supabase logs

# Reset local database
npx supabase db reset
```

**API Issues:**
```powershell
# Check server logs
npm run dev  # Watch for error messages

# Run specific test
npm test -- --testNamePattern="your test name"

# Check TypeScript errors
npm run type-check
```

**Performance Issues:**
```powershell
# Run performance validation
npm run performance-validator

# Check query performance
npm run performance-monitor

# Analyze response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/quotes"
```

## Best Practices

### 1. Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- **Avoid `any` type** - use proper TypeScript types

### 2. Database Operations
- Always handle errors gracefully
- Use transactions for multi-step operations
- Implement proper pagination for list endpoints
- Use database constraints and indexes
- Follow the repository pattern for data access

### 3. API Design
- Follow RESTful conventions
- Use consistent error response format
- Implement proper HTTP status codes
- Add request validation and sanitization
- Include comprehensive API documentation

### 4. Testing
- Write tests before implementing features (TDD)
- Aim for high test coverage (>80%)
- Use realistic test data
- Test error scenarios and edge cases
- Keep tests fast and isolated

## Troubleshooting Guide

### Common Issues

**1. Supabase Connection Errors**
```
Error: Missing SUPABASE_URL environment variable
```
Solution: Ensure `.env` file exists with correct Supabase credentials

**2. TypeScript Compilation Errors**
```
Property 'xyz' does not exist on type 'unknown'
```
Solution: Regenerate types with `npx supabase gen types typescript`

**3. Migration Errors**
```
Migration failed: table "xyz" already exists
```
Solution: Check migration history and adjust migration scripts

**4. Test Failures**
```
Tests are failing after database changes
```
Solution: Update test data and expectations to match new schema

### Getting Help

- **Project Documentation**: Check `specs/main/` directory
- **Supabase Docs**: https://supabase.com/docs
- **Team Knowledge Base**: Check repository issues and discussions
- **Local Setup Issues**: Use `npm run health-check` for diagnostics

## Performance Targets

The application is designed to meet these performance targets:

- **API Response Time**: <200ms p95 for all endpoints
- **Database Queries**: <50ms average response time
- **Frontend Load Time**: <2s initial page load
- **Test Suite**: <30s for complete test run

Use the performance monitoring scripts to validate these targets:

```powershell
# Full performance validation
npm run performance-validator

# Quick health check
npm run health-check
```

## Security Considerations

- All user inputs are validated and sanitized
- Rate limiting is applied to prevent abuse
- Environment variables store sensitive configuration
- HTTPS is required in production
- Row Level Security (RLS) policies protect data access
- JWT tokens are used for session management

## Next Steps for New Developers

1. **Complete the Quick Start** (above) to get a working local environment
2. **Run the test suite** to ensure everything is working: `npm test`
3. **Make a small change** to familiarize yourself with the codebase
4. **Read the API documentation** in `specs/main/contracts/openapi.yaml`
5. **Review the database schema** in `specs/main/data-model.md`
6. **Join the team standup** to understand current priorities
7. **Pick up a good first issue** from the project backlog

Welcome to the Strata team! 🏡✨