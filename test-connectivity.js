// Test connectivity between frontend and backend
const BACKEND_URL = 'https://backend-gabrielle-shands-projects.vercel.app';

async function testBackendConnectivity() {
  console.log('🔍 Testing backend connectivity...\n');
  
  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
    
    // Test 2: Root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
    
    // Test 3: API test endpoint
    console.log('\n3. Testing API test endpoint...');
    const apiResponse = await fetch(`${BACKEND_URL}/api/test`);
    const apiData = await apiResponse.json();
    console.log('✅ API test endpoint:', apiData);
    
    // Test 4: Auth endpoints (should return placeholder responses)
    console.log('\n4. Testing auth endpoints...');
    const authResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test' })
    });
    const authData = await authResponse.json();
    console.log('✅ Auth login endpoint:', authData);
    
    console.log('\n🎉 All connectivity tests passed!');
    console.log('\n📋 Summary:');
    console.log(`- Backend URL: ${BACKEND_URL}`);
    console.log('- Health: ✅ Working');
    console.log('- Root: ✅ Working');
    console.log('- API Test: ✅ Working');
    console.log('- Auth: ✅ Working (placeholder)');
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
  }
}

// Run the test
testBackendConnectivity(); 