// Test script to check email configuration
const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testEmailConfig() {
  console.log('🔧 Testing email configuration');
  
  try {
    // Test the debug endpoint to see environment variables
    const response = await fetch(`${BACKEND_URL}/debug-supabase-config`);
    
    console.log('📡 Debug endpoint status:', response.status);
    
    const result = await response.json();
    console.log('📄 Debug response:', result);
    
    if (result.config) {
      console.log('🔑 Environment variables:');
      console.log('  RESEND_API_KEY:', result.config.resendKey ? 'SET' : 'NOT SET');
      console.log('  SUPABASE_URL:', result.config.supabaseUrl ? 'SET' : 'NOT SET');
      console.log('  SUPABASE_KEY:', result.config.supabaseKey ? 'SET' : 'NOT SET');
    }
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error.message);
  }
}

// Test a simple endpoint that doesn't require email
async function testSimpleEndpoint() {
  console.log('\n🔧 Testing simple endpoint');
  
  try {
    const response = await fetch(`${BACKEND_URL}/test`);
    
    console.log('📡 Test endpoint status:', response.status);
    
    const result = await response.json();
    console.log('📄 Test endpoint response:', result);
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testEmailConfig();
  await testSimpleEndpoint();
}

runTests(); 