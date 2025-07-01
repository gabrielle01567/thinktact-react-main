// Using built-in fetch (available in Node.js 18+)

const BACKEND_URL = 'https://thinktact.ai/api';

async function testBackendConnectivity() {
  console.log('Testing backend connectivity to:', BACKEND_URL);
  
  try {
    // Test health endpoint
    console.log('\n🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health endpoint status:', healthResponse.status);
    
    const healthText = await healthResponse.text();
    console.log('Health response content (first 200 chars):', healthText.substring(0, 200));
    
    if (healthResponse.ok) {
      try {
        const healthData = JSON.parse(healthText);
        console.log('Health response (parsed):', healthData);
      } catch (parseError) {
        console.log('Response is not JSON, likely serving frontend HTML');
      }
    } else {
      console.log('Health endpoint failed');
    }
    
    // Test auth endpoints
    console.log('\n🔍 Testing auth endpoints...');
    
    // Test registration endpoint
    const registerResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    console.log('Register endpoint status:', registerResponse.status);
    
    const registerText = await registerResponse.text();
    console.log('Register response content (first 200 chars):', registerText.substring(0, 200));
    
    // Test login endpoint
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    console.log('Login endpoint status:', loginResponse.status);
    
    const loginText = await loginResponse.text();
    console.log('Login response content (first 200 chars):', loginText.substring(0, 200));
    
    console.log('\n✅ Backend connectivity test completed!');
    
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error.message);
  }
}

testBackendConnectivity(); 