import fetch from 'node-fetch';
const BACKEND_URL = 'https://backendv2-e825z82x9-gabrielle-shands-projects.vercel.app';

async function testBackendV2Health() {
  console.log('🔍 Testing Backend v2 Health Endpoint');
  console.log('====================================');
  
  // Test health endpoint
  console.log('\n📡 Testing /health endpoint...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log(`📊 Health Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('📥 Health Response:', JSON.stringify(healthData, null, 2));
      
      // Check environment variables
      console.log('\n🔧 Environment Variables Status:');
      console.log(`- Supabase URL: ${healthData.supabaseUrl ? '✅ Set' : '❌ Not set'}`);
      console.log(`- Supabase Key: ${healthData.supabaseKey ? '✅ Set' : '❌ Not set'}`);
      console.log(`- JWT Secret: ${healthData.jwtSecret ? '✅ Set' : '❌ Not set'}`);
      console.log(`- Resend Key: ${healthData.resendKey ? '✅ Set' : '❌ Not set'}`);
      console.log(`- Environment: ${healthData.environment}`);
      
    } else {
      const errorText = await healthResponse.text();
      console.log('❌ Health endpoint failed:', errorText.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Health endpoint error:', error.message);
  }
}

testBackendV2Health(); 