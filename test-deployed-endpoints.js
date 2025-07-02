const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testDeployedEndpoints() {
  console.log('🔍 Testing Deployed Backend Endpoints');
  console.log('====================================');
  
  const endpoints = [
    '/',
    '/health',
    '/test',
    '/test-supabase',
    '/test-supabase-service',
    '/admin/users',
    '/auth/register',
    '/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📥 Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        console.log(`❌ Error: ${response.statusText}`);
      }
      console.log('---');
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
      console.log('---');
    }
  }
}

testDeployedEndpoints(); 