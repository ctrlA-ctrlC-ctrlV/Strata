#!/usr/bin/env node

/**
 * Deployment Pipeline Validation Script
 * 
 * Validates that deployment configuration is properly updated for Supabase
 * and contains no MongoDB references
 */

import { promises as fs } from 'fs'
import path from 'path'

interface ValidationResult {
  category: string
  check: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  files?: string[]
}

class DeploymentValidator {
  private results: ValidationResult[] = []
  private readonly mongoPatterns = [
    /mongodb:\/\//i,
    /mongodb_uri/i,
    /mongo_uri/i,
    /mongoose/i,
    /mongo\.connect/i,
    /mongoClient/i,
    /mongo_db/i,
    /mongodb_db/i
  ]

  private readonly supabasePatterns = [
    /supabase_url/i,
    /supabase_anon_key/i,
    /supabase_service_role_key/i,
    /supabase\.co/i,
    /@supabase\/supabase-js/i
  ]

  async validate(): Promise<void> {
    console.log('🔍 Validating Deployment Pipeline Configuration')
    console.log('=' .repeat(60))
    console.log()

    await this.checkEnvironmentTemplates()
    await this.checkDeploymentFiles()
    await this.checkCIConfiguration()
    await this.checkPackageFiles()
    await this.checkTestFiles()

    this.printReport()
  }

  private async checkEnvironmentTemplates(): Promise<void> {
    const category = 'Environment Configuration'
    
    // Check .env.example files
    const envFiles = [
      'backend/.env.example',
      'frontend/.env.example'
    ]

    for (const file of envFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        // Check for MongoDB references
        const hasMongoRefs = this.mongoPatterns.some(pattern => pattern.test(content))
        if (hasMongoRefs) {
          this.results.push({
            category,
            check: `MongoDB references removed from ${file}`,
            status: 'FAIL',
            message: 'Found MongoDB configuration in environment template',
            files: [file]
          })
        } else {
          this.results.push({
            category,
            check: `MongoDB references removed from ${file}`,
            status: 'PASS',
            message: 'No MongoDB configuration found'
          })
        }

        // Check for Supabase configuration
        const hasSupabaseRefs = this.supabasePatterns.some(pattern => pattern.test(content))
        if (hasSupabaseRefs) {
          this.results.push({
            category,
            check: `Supabase configuration in ${file}`,
            status: 'PASS',
            message: 'Supabase configuration properly documented'
          })
        } else if (file.includes('backend')) {
          this.results.push({
            category,
            check: `Supabase configuration in ${file}`,
            status: 'WARNING',
            message: 'Backend should have Supabase configuration'
          })
        }

      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          this.results.push({
            category,
            check: `Environment template ${file}`,
            status: 'WARNING',
            message: 'Environment template file not found'
          })
        }
      }
    }
  }

  private async checkDeploymentFiles(): Promise<void> {
    const category = 'Deployment Configuration'
    
    // Check deployment documentation
    try {
      const deployDocs = await fs.readFile('backend/deploy/README.md', 'utf-8')
      
      const hasMongoRefs = this.mongoPatterns.some(pattern => pattern.test(deployDocs))
      this.results.push({
        category,
        check: 'Deployment documentation MongoDB-free',
        status: hasMongoRefs ? 'FAIL' : 'PASS',
        message: hasMongoRefs 
          ? 'Found MongoDB references in deployment docs'
          : 'Deployment documentation clean of MongoDB references'
      })

      const hasSupabaseRefs = this.supabasePatterns.some(pattern => pattern.test(deployDocs))
      this.results.push({
        category,
        check: 'Deployment documentation includes Supabase',
        status: hasSupabaseRefs ? 'PASS' : 'FAIL',
        message: hasSupabaseRefs 
          ? 'Supabase configuration documented'
          : 'Missing Supabase configuration in deployment docs'
      })

    } catch {
      this.results.push({
        category,
        check: 'Deployment documentation exists',
        status: 'WARNING',
        message: 'Deployment documentation not found'
      })
    }

    // Check for Docker files
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml']
    for (const file of dockerFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        const hasMongoRefs = this.mongoPatterns.some(pattern => pattern.test(content))
        this.results.push({
          category,
          check: `Docker configuration MongoDB-free (${file})`,
          status: hasMongoRefs ? 'FAIL' : 'PASS',
          message: hasMongoRefs 
            ? 'Found MongoDB references in Docker configuration'
            : 'Docker configuration clean'
        })

      } catch {
        // Docker files are optional
      }
    }
  }

  private async checkCIConfiguration(): Promise<void> {
    const category = 'CI/CD Pipeline'
    
    const ciFiles = [
      '.github/workflows/ci.yml',
      '.github/workflows/deploy.yml',
      '.gitlab-ci.yml',
      'azure-pipelines.yml'
    ]

    for (const file of ciFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        
        const hasMongoRefs = this.mongoPatterns.some(pattern => pattern.test(content))
        this.results.push({
          category,
          check: `CI configuration MongoDB-free (${file})`,
          status: hasMongoRefs ? 'FAIL' : 'PASS',
          message: hasMongoRefs 
            ? 'Found MongoDB references in CI configuration'
            : 'CI configuration clean'
        })

        // Check for proper Node.js version
        if (content.includes('node-version') && content.includes('20.x')) {
          this.results.push({
            category,
            check: `Node.js version appropriate (${file})`,
            status: 'PASS',
            message: 'Using Node.js 20.x'
          })
        }

      } catch {
        // CI files are optional
      }
    }

    // At least one CI file should exist
    const ciExists = await Promise.all(
      ciFiles.map(async file => {
        try {
          await fs.access(file)
          return true
        } catch {
          return false
        }
      })
    )

    if (ciExists.some(exists => exists)) {
      this.results.push({
        category,
        check: 'CI/CD pipeline configured',
        status: 'PASS',
        message: 'CI/CD configuration found'
      })
    } else {
      this.results.push({
        category,
        check: 'CI/CD pipeline configured',
        status: 'WARNING',
        message: 'No CI/CD configuration found'
      })
    }
  }

  private async checkPackageFiles(): Promise<void> {
    const category = 'Package Configuration'
    
    const packageFiles = ['backend/package.json', 'frontend/package.json']
    
    for (const file of packageFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const pkg = JSON.parse(content)
        
        // Check dependencies for MongoDB packages
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        }

        const mongoDeps = Object.keys(allDeps).filter(dep => 
          dep.includes('mongo') || dep.includes('mongoose')
        )

        if (mongoDeps.length > 0) {
          this.results.push({
            category,
            check: `MongoDB dependencies removed (${file})`,
            status: 'FAIL',
            message: `Found MongoDB dependencies: ${mongoDeps.join(', ')}`,
            files: [file]
          })
        } else {
          this.results.push({
            category,
            check: `MongoDB dependencies removed (${file})`,
            status: 'PASS',
            message: 'No MongoDB dependencies found'
          })
        }

        // Check for Supabase dependencies (backend only)
        if (file.includes('backend')) {
          const hasSupabaseDep = '@supabase/supabase-js' in allDeps
          this.results.push({
            category,
            check: `Supabase dependencies present (${file})`,
            status: hasSupabaseDep ? 'PASS' : 'FAIL',
            message: hasSupabaseDep 
              ? 'Supabase client library configured'
              : 'Missing Supabase client library'
          })
        }

      } catch (error) {
        this.results.push({
          category,
          check: `Package file readable (${file})`,
          status: 'FAIL',
          message: `Cannot read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
  }

  private async checkTestFiles(): Promise<void> {
    const category = 'Test Configuration'
    
    // Check deployment test file
    try {
      const deployTest = await fs.readFile('backend/tests/integration/deployment.test.ts', 'utf-8')
      
      const hasMongoChecks = /mongodb.*undefined/i.test(deployTest)
      this.results.push({
        category,
        check: 'Deployment tests validate MongoDB removal',
        status: hasMongoChecks ? 'PASS' : 'WARNING',
        message: hasMongoChecks 
          ? 'Tests verify MongoDB environment variables are not present'
          : 'Consider adding explicit MongoDB removal validation'
      })

      const hasSupabaseChecks = /supabase/i.test(deployTest)
      this.results.push({
        category,
        check: 'Deployment tests validate Supabase',
        status: hasSupabaseChecks ? 'PASS' : 'FAIL',
        message: hasSupabaseChecks 
          ? 'Tests verify Supabase configuration'
          : 'Missing Supabase validation in deployment tests'
      })

    } catch {
      this.results.push({
        category,
        check: 'Deployment tests exist',
        status: 'WARNING',
        message: 'Deployment test file not found'
      })
    }
  }

  private printReport(): void {
    console.log('\n🚀 DEPLOYMENT PIPELINE VALIDATION REPORT')
    console.log('=' .repeat(70))

    const categories = [...new Set(this.results.map(r => r.category))]
    
    categories.forEach(category => {
      console.log(`\n${category}:`)
      
      const categoryResults = this.results.filter(r => r.category === category)
      categoryResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : 
                    result.status === 'WARNING' ? '⚠️' : '❌'
        
        console.log(`  ${icon} ${result.check}: ${result.message}`)
        
        if (result.files) {
          result.files.forEach(file => {
            console.log(`     📁 ${file}`)
          })
        }
      })
    })

    // Summary
    const passed = this.results.filter(r => r.status === 'PASS').length
    const warnings = this.results.filter(r => r.status === 'WARNING').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length

    console.log('\n' + '=' .repeat(70))
    console.log(`Deployment Validation: ${passed} passed, ${warnings} warnings, ${failed} failed`)
    console.log(`Overall Status: ${this.getOverallStatus(passed, warnings, failed)}`)

    // Critical issues
    const criticalIssues = this.results.filter(r => r.status === 'FAIL')
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL DEPLOYMENT ISSUES:')
      criticalIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.check}: ${issue.message}`)
      })
    }

    console.log('\n📋 DEPLOYMENT READINESS CHECKLIST:')
    console.log('  □ Remove all MongoDB configuration and dependencies')
    console.log('  □ Verify Supabase configuration in all environments')
    console.log('  □ Update CI/CD pipelines to use Supabase')
    console.log('  □ Test deployment scripts with Supabase')
    console.log('  □ Validate health checks work with new database')
    console.log('  □ Update monitoring and alerting for Supabase')

    console.log('=' .repeat(70))
  }

  private getOverallStatus(passed: number, warnings: number, failed: number): string {
    if (failed === 0 && warnings <= 2) {
      return '✅ READY FOR DEPLOYMENT'
    } else if (failed === 0) {
      return '⚠️  MOSTLY READY - Address warnings'
    } else {
      return '❌ NOT READY - Fix critical issues'
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator()
  validator.validate().catch(error => {
    console.error('❌ Deployment validation failed:', error)
    process.exit(1)
  })
}

export { DeploymentValidator }