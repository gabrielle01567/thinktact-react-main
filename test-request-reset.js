// Test script to debug the request-reset endpoint
const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testRequestReset() {
  console.log('🔧 Testing request-reset endpoint');
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        securityAnswer: 'Fluffy'
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Request reset successful!');
    } else {
      console.log('❌ Request reset failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Also test the user endpoint to make sure it's working
async function testUserEndpoint() {
  console.log('\n🔧 Testing user endpoint');
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user/alex.hawke54%40gmail.com`);
    
    console.log('📡 User endpoint status:', response.status);
    
    const result = await response.json();
    console.log('📄 User endpoint response:', result);
    
  } catch (error) {
    console.error('❌ User endpoint error:', error.message);
  }
}

// Run both tests
async function runTests() {
  await testUserEndpoint();
  await testRequestReset();
}

runTests(); 