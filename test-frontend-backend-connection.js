// Test script to simulate frontend API calls
const BACKEND_URL = 'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app/api';

async function testFrontendBackendConnection() {
  console.log('🔍 Testing Frontend → Backend Connection');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Simulate frontend login attempt
    console.log('\n🔍 Simulating frontend login...');
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginText = await loginResponse.text();
    console.log('Login response body (first 300 chars):', loginText.substring(0, 300));
    
    if (loginResponse.ok) {
      try {
        const loginData = JSON.parse(loginText);
        console.log('✅ Login successful:', loginData);
      } catch (parseError) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log('❌ Login failed');
    }
    
    // Test registration endpoint
    console.log('\n🔍 Testing registration endpoint...');
    const registerResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-frontend@example.com',
        password: 'testpass123'
      })
    });
    
    console.log('Register response status:', registerResponse.status);
    const registerText = await registerResponse.text();
    console.log('Register response body (first 300 chars):', registerText.substring(0, 300));
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('This suggests the backend URL is not accessible or there\'s a network issue');
  }
}

testFrontendBackendConnection(); 