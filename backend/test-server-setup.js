// Simple server test to check startup issues
import { checkDatabaseConnection, initializeDatabase } from './src/db/supabase.js'

async function testServerSetup() {
  console.log('🚀 Testing server setup components...\n')
  
  try {
    // Test 1: Database connection
    console.log('🔍 Testing database connection...')
    const dbHealth = await checkDatabaseConnection()
    
    if (dbHealth.isHealthy) {
      console.log('✅ Database connection: Healthy')
      console.log(`   Latency: ${dbHealth.latency}ms`)
    } else {
      console.log('❌ Database connection: Failed')
      console.log(`   Error: ${dbHealth.error}`)
    }

    // Test 2: Database initialization
    console.log('\n🔧 Testing database initialization...')
    await initializeDatabase()
    console.log('✅ Database initialization: Successful')
    
    // Test 3: Environment variables
    console.log('\n🌍 Checking environment configuration...')
    const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    let envOk = true
    
    requiredEnvs.forEach(env => {
      if (process.env[env]) {
        console.log(`✅ ${env}: Configured`)
      } else {
        console.log(`❌ ${env}: Missing`)
        envOk = false
      }
    })
    
    if (envOk) {
      console.log('\n🎉 Server setup: All components ready!')
      console.log('The server should start successfully.')
    } else {
      console.log('\n❌ Server setup: Environment configuration issues')
    }
    
  } catch (err) {
    console.log(`❌ Server setup failed: ${err?.message || err}`)
  }
}

testServerSetup().catch(console.error)