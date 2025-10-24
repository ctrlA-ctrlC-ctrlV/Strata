import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { initializeDatabase, checkDatabaseConnection } from '../db/supabase.js'
import { setupSecurityMiddleware } from '../security/security.js'

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1)

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

if (process.env.RATE_LIMIT === 'true') {
  app.use(limiter)
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
  const origin = req.headers.origin
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  
  next()
})

// Security middleware
setupSecurityMiddleware(app)

// Health check endpoints
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection()
  
  res.json({ 
    status: dbHealth.isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      healthy: dbHealth.isHealthy,
      latency: dbHealth.latency,
      error: dbHealth.error
    }
  })
})

app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection()
  
  res.json({ 
    status: dbHealth.isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: dbHealth.isHealthy ? 'connected' : 'error',
      api: 'operational'
    },
    details: {
      database: {
        latency: dbHealth.latency,
        error: dbHealth.error
      }
    }
  })
})

// Import API routes
import quotesRouter from './quotes.js'
import contactRouter from './contact.js'

// Mount API routes
app.use('/api', quotesRouter)
app.use('/api', contactRouter)
// app.use('/api/admin', adminRouter) // Will be added later

// Serve static success pages for no-JS fallbacks
app.get('/contact-success', (req, res) => {
  res.sendFile(new URL('../api/views/contact-success.html', import.meta.url).pathname)
})

app.get('/quote-success', (req, res) => {
  res.sendFile(new URL('../api/views/quote-success.html', import.meta.url).pathname)
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' })
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack 
    })
  }
})

// Start server
async function startServer() {
  try {
    // Initialize Supabase connection
    await initializeDatabase()
    console.log('Connected to Supabase PostgreSQL')
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`Health check: http://localhost:${PORT}/health`)
      console.log(`Database: Supabase PostgreSQL`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}

export default app