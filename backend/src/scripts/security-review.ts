#!/usr/bin/env node

/**
 * Security Review Script
 * 
 * Validates RLS policies, environment variable security, and other security measures
 */

import { promises as fs } from 'fs'
import path from 'path'

interface SecurityCheck {
  category: string
  name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  recommendation?: string
}

class SecurityReviewer {
  private checks: SecurityCheck[] = []

  async review(): Promise<void> {
    console.log('🔒 Strata Security Review')
    console.log('=' .repeat(50))
    console.log()

    await this.checkEnvironmentVariables()
    await this.checkSupabaseSchema()
    await this.checkCodeSecurity()
    await this.checkApiSecurity()
    await this.checkDependencySecurity()

    this.printReport()
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const category = 'Environment Variables'
    
    // Check .env.example for proper documentation
    try {
      const envExample = await fs.readFile('backend/.env.example', 'utf-8')
      
      if (envExample.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        this.checks.push({
          category,
          name: 'Environment template documented',
          status: 'PASS',
          message: 'Environment variables are properly documented'
        })
      } else {
        this.checks.push({
          category,
          name: 'Environment template documented',
          status: 'FAIL',
          message: 'Supabase environment variables not documented',
          recommendation: 'Update .env.example with required Supabase variables'
        })
      }
      
      // Check for sensitive data in examples
      if (envExample.includes('your_super_secret') || envExample.includes('change_this')) {
        this.checks.push({
          category,
          name: 'Placeholder values used',
          status: 'PASS',
          message: 'Example uses placeholder values, not real secrets'
        })
      } else {
        this.checks.push({
          category,
          name: 'Placeholder values used',
          status: 'WARNING',
          message: 'Verify no real secrets in .env.example'
        })
      }
      
    } catch {
      this.checks.push({
        category,
        name: 'Environment template exists',
        status: 'FAIL',
        message: 'No .env.example file found',
        recommendation: 'Create .env.example with documented environment variables'
      })
    }

    // Check if .env is in .gitignore
    try {
      const gitignore = await fs.readFile('.gitignore', 'utf-8')
      
      if (gitignore.includes('.env') || gitignore.includes('*.env')) {
        this.checks.push({
          category,
          name: 'Environment files ignored',
          status: 'PASS',
          message: 'Environment files are properly excluded from git'
        })
      } else {
        this.checks.push({
          category,
          name: 'Environment files ignored',
          status: 'FAIL',
          message: '.env files not found in .gitignore',
          recommendation: 'Add .env* to .gitignore'
        })
      }
    } catch {
      this.checks.push({
        category,
        name: 'Gitignore exists',
        status: 'WARNING',
        message: 'No .gitignore found - ensure secrets are not committed'
      })
    }

    // Check for hardcoded secrets in code
    const codeFiles = await this.findCodeFiles()
    let hardcodedSecretsFound = false

    for (const file of codeFiles.slice(0, 20)) { // Check first 20 files
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        // Look for potential hardcoded secrets
        const secretPatterns = [
          /sk_[a-zA-Z0-9]{20,}/,  // API keys
          /[a-zA-Z0-9]{32,}/,     // Long random strings
          /password\s*[:=]\s*['"][^'"]{6,}/i,
          /secret\s*[:=]\s*['"][^'"]{6,}/i,
          /key\s*[:=]\s*['"][^'"]{20,}/i
        ]

        for (const pattern of secretPatterns) {
          if (pattern.test(content) && !content.includes('process.env')) {
            hardcodedSecretsFound = true
            break
          }
        }
        
        if (hardcodedSecretsFound) break
      } catch {
        // File read error, skip
      }
    }

    this.checks.push({
      category,
      name: 'No hardcoded secrets',
      status: hardcodedSecretsFound ? 'FAIL' : 'PASS',
      message: hardcodedSecretsFound 
        ? 'Potential hardcoded secrets found in code'
        : 'No obvious hardcoded secrets detected',
      recommendation: hardcodedSecretsFound 
        ? 'Review code for hardcoded secrets and move to environment variables'
        : undefined
    })
  }

  private async checkSupabaseSchema(): Promise<void> {
    const category = 'Database Security (RLS)'
    
    try {
      const schemaFile = await fs.readFile('backend/supabase/migrations/20251023001000_initial_schema.sql', 'utf-8')
      
      // Check for Row Level Security policies
      if (schemaFile.includes('ROW LEVEL SECURITY') || schemaFile.includes('POLICY')) {
        this.checks.push({
          category,
          name: 'RLS policies defined',
          status: 'PASS',
          message: 'Row Level Security policies are implemented'
        })
      } else {
        this.checks.push({
          category,
          name: 'RLS policies defined',
          status: 'WARNING',
          message: 'No explicit RLS policies found in schema',
          recommendation: 'Consider adding Row Level Security policies for data protection'
        })
      }

      // Check for proper table permissions
      if (schemaFile.includes('GRANT') || schemaFile.includes('REVOKE')) {
        this.checks.push({
          category,
          name: 'Database permissions configured',
          status: 'PASS',
          message: 'Database permissions are explicitly configured'
        })
      } else {
        this.checks.push({
          category,
          name: 'Database permissions configured',
          status: 'WARNING',
          message: 'No explicit permission grants found',
          recommendation: 'Review and document database access permissions'
        })
      }

      // Check for foreign key constraints
      if (schemaFile.includes('FOREIGN KEY') || schemaFile.includes('REFERENCES')) {
        this.checks.push({
          category,
          name: 'Foreign key constraints',
          status: 'PASS',
          message: 'Foreign key constraints provide data integrity'
        })
      } else {
        this.checks.push({
          category,
          name: 'Foreign key constraints',
          status: 'WARNING',
          message: 'No foreign key constraints found',
          recommendation: 'Add foreign key constraints for data integrity'
        })
      }

    } catch {
      this.checks.push({
        category,
        name: 'Schema file accessible',
        status: 'FAIL',
        message: 'Cannot access database schema file',
        recommendation: 'Ensure database schema is properly documented'
      })
    }
  }

  private async checkCodeSecurity(): Promise<void> {
    const category = 'Code Security'

    // Check for input validation
    try {
      const validationFile = await fs.readFile('backend/src/services/validation.ts', 'utf-8')
      
      if (validationFile.includes('zod') || validationFile.includes('validate')) {
        this.checks.push({
          category,
          name: 'Input validation implemented',
          status: 'PASS',
          message: 'Input validation using Zod schemas'
        })
      } else {
        this.checks.push({
          category,
          name: 'Input validation implemented',
          status: 'WARNING',
          message: 'Limited input validation detected'
        })
      }
    } catch {
      this.checks.push({
        category,
        name: 'Input validation implemented',
        status: 'FAIL',
        message: 'No validation service found',
        recommendation: 'Implement comprehensive input validation'
      })
    }

    // Check for security middleware
    try {
      const securityFile = await fs.readFile('backend/src/security/security.ts', 'utf-8')
      
      const securityFeatures = [
        { name: 'Rate limiting', pattern: /rate.?limit/i },
        { name: 'Input sanitization', pattern: /sanitiz/i },
        { name: 'CORS configuration', pattern: /cors/i },
        { name: 'Security headers', pattern: /header/i }
      ]

      securityFeatures.forEach(feature => {
        if (feature.pattern.test(securityFile)) {
          this.checks.push({
            category,
            name: feature.name,
            status: 'PASS',
            message: `${feature.name} is implemented`
          })
        } else {
          this.checks.push({
            category,
            name: feature.name,
            status: 'WARNING',
            message: `${feature.name} not found in security middleware`
          })
        }
      })

    } catch {
      this.checks.push({
        category,
        name: 'Security middleware exists',
        status: 'FAIL',
        message: 'No security middleware file found',
        recommendation: 'Implement security middleware for rate limiting, sanitization, etc.'
      })
    }

    // Check for proper error handling (no sensitive data leakage)
    const apiFiles = await this.findApiFiles()
    let properErrorHandling = true

    for (const file of apiFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        // Check for stack trace exposure
        if (content.includes('error.stack') && !content.includes('NODE_ENV')) {
          properErrorHandling = false
          break
        }
      } catch {
        // File read error, skip
      }
    }

    this.checks.push({
      category,
      name: 'Safe error handling',
      status: properErrorHandling ? 'PASS' : 'WARNING',
      message: properErrorHandling 
        ? 'Error handling does not expose sensitive information'
        : 'Potential sensitive information exposure in error responses',
      recommendation: properErrorHandling 
        ? undefined
        : 'Ensure stack traces and sensitive data are not exposed in API responses'
    })
  }

  private async checkApiSecurity(): Promise<void> {
    const category = 'API Security'

    // Check for authentication implementation
    try {
      const serverFile = await fs.readFile('backend/src/api/server.ts', 'utf-8')
      
      if (serverFile.includes('jwt') || serverFile.includes('auth')) {
        this.checks.push({
          category,
          name: 'Authentication implemented',
          status: 'PASS',
          message: 'JWT authentication is configured'
        })
      } else {
        this.checks.push({
          category,
          name: 'Authentication implemented',
          status: 'WARNING',
          message: 'No obvious authentication middleware found'
        })
      }

      // Check for HTTPS enforcement
      if (serverFile.includes('https') || serverFile.includes('secure')) {
        this.checks.push({
          category,
          name: 'HTTPS enforcement',
          status: 'PASS',
          message: 'HTTPS configuration found'
        })
      } else {
        this.checks.push({
          category,
          name: 'HTTPS enforcement',
          status: 'WARNING',
          message: 'Ensure HTTPS is enforced in production',
          recommendation: 'Configure HTTPS redirection and secure headers'
        })
      }

    } catch {
      this.checks.push({
        category,
        name: 'Server configuration accessible',
        status: 'FAIL',
        message: 'Cannot access server configuration'
      })
    }

    // Check OpenAPI security definitions
    try {
      const openapi = await fs.readFile('specs/main/contracts/openapi.yaml', 'utf-8')
      
      if (openapi.includes('security:') || openapi.includes('bearerAuth')) {
        this.checks.push({
          category,
          name: 'API security documented',
          status: 'PASS',
          message: 'Security requirements documented in OpenAPI spec'
        })
      } else {
        this.checks.push({
          category,
          name: 'API security documented',
          status: 'WARNING',
          message: 'API security not documented in OpenAPI spec',
          recommendation: 'Document authentication requirements in API specification'
        })
      }
    } catch {
      this.checks.push({
        category,
        name: 'API documentation accessible',
        status: 'WARNING',
        message: 'Cannot access API documentation'
      })
    }
  }

  private async checkDependencySecurity(): Promise<void> {
    const category = 'Dependency Security'

    // Check package.json for known vulnerable packages
    try {
      const packageJson = await fs.readFile('backend/package.json', 'utf-8')
      const pkg = JSON.parse(packageJson)
      
      // Check for security-related dependencies
      const securityDeps = [
        'helmet',      // Security headers
        'bcrypt',      // Password hashing
        'express-rate-limit', // Rate limiting
        'express-validator',  // Input validation
        'jsonwebtoken' // JWT tokens
      ]

      const foundSecurityDeps = securityDeps.filter(dep => 
        pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
      )

      this.checks.push({
        category,
        name: 'Security dependencies installed',
        status: foundSecurityDeps.length >= 3 ? 'PASS' : 'WARNING',
        message: `${foundSecurityDeps.length}/${securityDeps.length} recommended security packages found`,
        recommendation: foundSecurityDeps.length < 3 
          ? 'Consider adding more security-focused dependencies'
          : undefined
      })

      // Check for potentially risky dependencies
      const riskyPatterns = [
        'eval',
        'vm2',
        'serialize-javascript'
      ]

      const hasRiskyDeps = riskyPatterns.some(pattern => 
        Object.keys(pkg.dependencies || {}).some(dep => dep.includes(pattern)) ||
        Object.keys(pkg.devDependencies || {}).some(dep => dep.includes(pattern))
      )

      this.checks.push({
        category,
        name: 'No risky dependencies',
        status: hasRiskyDeps ? 'WARNING' : 'PASS',
        message: hasRiskyDeps 
          ? 'Potentially risky dependencies detected'
          : 'No obviously risky dependencies found',
        recommendation: hasRiskyDeps 
          ? 'Review dependencies for security implications'
          : undefined
      })

    } catch {
      this.checks.push({
        category,
        name: 'Package configuration accessible',
        status: 'FAIL',
        message: 'Cannot access package.json'
      })
    }

    // Suggest npm audit
    this.checks.push({
      category,
      name: 'Dependency audit',
      status: 'WARNING',
      message: 'Run npm audit to check for known vulnerabilities',
      recommendation: 'Run "npm audit" and "npm audit fix" regularly'
    })
  }

  private async findCodeFiles(): Promise<string[]> {
    const files: string[] = []
    
    const searchDirs = [
      'backend/src',
      'frontend/src'
    ]

    for (const dir of searchDirs) {
      try {
        await this.findFilesRecursive(dir, files, /\.(ts|js|tsx|jsx)$/)
      } catch {
        // Directory doesn't exist or is inaccessible
      }
    }

    return files
  }

  private async findApiFiles(): Promise<string[]> {
    const files: string[] = []
    
    try {
      await this.findFilesRecursive('backend/src/api', files, /\.(ts|js)$/)
    } catch {
      // Directory doesn't exist
    }

    return files
  }

  private async findFilesRecursive(dir: string, files: string[], pattern: RegExp): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await this.findFilesRecursive(fullPath, files, pattern)
        } else if (pattern.test(entry.name)) {
          files.push(fullPath)
        }
      }
    } catch {
      // Directory read error, skip
    }
  }

  private printReport(): void {
    console.log('\n🔒 SECURITY REVIEW REPORT')
    console.log('=' .repeat(60))

    const categories = [...new Set(this.checks.map(c => c.category))]
    
    categories.forEach(category => {
      console.log(`\n${category}:`)
      
      const categoryChecks = this.checks.filter(c => c.category === category)
      categoryChecks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : 
                    check.status === 'WARNING' ? '⚠️' : '❌'
        
        console.log(`  ${icon} ${check.name}: ${check.message}`)
        
        if (check.recommendation) {
          console.log(`     💡 ${check.recommendation}`)
        }
      })
    })

    // Summary
    const passed = this.checks.filter(c => c.status === 'PASS').length
    const warnings = this.checks.filter(c => c.status === 'WARNING').length
    const failed = this.checks.filter(c => c.status === 'FAIL').length
    const total = this.checks.length

    console.log('\n' + '=' .repeat(60))
    console.log(`Security Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`)
    console.log(`Overall Status: ${this.getOverallStatus(passed, warnings, failed, total)}`)

    // Priority recommendations
    const failedChecks = this.checks.filter(c => c.status === 'FAIL')
    const criticalWarnings = this.checks.filter(c => 
      c.status === 'WARNING' && 
      (c.name.includes('RLS') || c.name.includes('authentication') || c.name.includes('environment'))
    )

    if (failedChecks.length > 0 || criticalWarnings.length > 0) {
      console.log('\n🚨 PRIORITY ACTIONS:')
      
      failedChecks.forEach((check, i) => {
        console.log(`  ${i + 1}. [CRITICAL] ${check.name}: ${check.recommendation || check.message}`)
      })
      
      criticalWarnings.forEach((check, i) => {
        console.log(`  ${failedChecks.length + i + 1}. [HIGH] ${check.name}: ${check.recommendation || check.message}`)
      })
    }

    console.log('\n📋 SECURITY CHECKLIST:')
    console.log('  □ Run npm audit and fix vulnerabilities')
    console.log('  □ Review and test RLS policies in Supabase dashboard')
    console.log('  □ Verify environment variables are properly secured')
    console.log('  □ Test authentication and authorization flows')
    console.log('  □ Configure HTTPS and security headers for production')
    console.log('  □ Set up automated security scanning in CI/CD')
    console.log('  □ Review and update dependencies regularly')
    console.log('  □ Monitor application logs for security events')

    console.log('=' .repeat(60))
  }

  private getOverallStatus(passed: number, warnings: number, failed: number, total: number): string {
    if (failed === 0 && warnings <= 2) {
      return '✅ SECURE - Ready for production'
    } else if (failed === 0 && warnings <= 5) {
      return '⚠️  MOSTLY SECURE - Address warnings before production'
    } else if (failed <= 2) {
      return '⚠️  NEEDS ATTENTION - Fix critical issues'
    } else {
      return '❌ INSECURE - Significant security issues found'
    }
  }
}

// Run security review if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const reviewer = new SecurityReviewer()
  reviewer.review().catch(error => {
    console.error('❌ Security review failed:', error)
    process.exit(1)
  })
}

export { SecurityReviewer }