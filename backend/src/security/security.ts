import { Express, Request, Response, NextFunction } from 'express'

export function setupSecurityMiddleware(app: Express): void {
  // Custom security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Additional security headers beyond helmet
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Custom CSP for API endpoints
    if (req.path.startsWith('/api/')) {
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';")
    }
    
    next()
  })

  // Request logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
      next()
    })
  }

  // Request ID for tracing
  app.use((req: Request & { id?: string }, res: Response, next: NextFunction) => {
    req.id = Math.random().toString(36).substring(2, 15)
    res.setHeader('X-Request-ID', req.id)
    next()
  })
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Basic XSS protection - strip HTML tags from string inputs
  function sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<[^>]*>/g, '') // Remove HTML tags
                  .trim()
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {}
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val)
      }
      return sanitized
    }
    return value
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query)
  }

  next()
}

// Rate limiting for specific endpoints
export function createApiRateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < now) {
        requests.delete(key)
      }
    }

    const current = requests.get(ip) || { count: 0, resetTime: now + windowMs }

    if (current.resetTime < now) {
      // Reset window
      current.count = 1
      current.resetTime = now + windowMs
    } else {
      current.count++
    }

    requests.set(ip, current)

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000))

    if (current.count > max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      })
      return
    }

    next()
  }
}

// Validate Content-Type for POST/PUT requests
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json') && !req.is('application/x-www-form-urlencoded') && !req.is('multipart/form-data')) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data'
      })
      return
    }
  }
  next()
}

// CSRF protection (basic implementation)
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // For API endpoints, check for custom header
  const customHeader = req.get('X-Requested-With')
  if (customHeader === 'XMLHttpRequest') {
    return next()
  }

  // For form submissions, this would integrate with CSRF token validation
  // For now, we'll allow all requests but log potential CSRF attempts
  console.warn(`Potential CSRF attempt from ${req.ip}: ${req.method} ${req.path}`)
  next()
}

// Error boundary for async route handlers
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}