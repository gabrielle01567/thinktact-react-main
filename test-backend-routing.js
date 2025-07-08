// Test script to check backend routing
const BACKEND_URL = 'https://your-backend.vercel.app'; // Replace with your actual backend URL

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const url = `${BACKEND_URL}${endpoint}`;
    console.log(`\n🔍 Testing: ${method} ${url}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, data);
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log('🚀 Testing Backend Routing...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  
  // Test basic endpoints
  await testEndpoint('/');
  await testEndpoint('/health');
  await testEndpoint('/api/test');
  
  // Test auth endpoints (GET requests)
  await testEndpoint('/api/auth/verify?token=test');
  
  // Test admin endpoints (GET requests)
  await testEndpoint('/api/admin/users');
  
  // Test with a non-existent endpoint
  await testEndpoint('/api/nonexistent');
  
  console.log('\n✅ Routing test completed!');
}

// Run the test
testAllEndpoints().catch(console.error); 