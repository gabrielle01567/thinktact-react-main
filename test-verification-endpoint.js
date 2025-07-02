import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-lw86jv6tt-gabrielle-shands-projects.vercel.app';

async function testVerificationEndpoint() {
  console.log('🔍 Testing Verification Endpoint');
  console.log('=================================');
  
  try {
    // Test with a dummy token to see if the endpoint responds
    const response = await fetch(`${BACKEND_URL}/api/auth/verify?token=test-token`);
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testVerificationEndpoint(); 