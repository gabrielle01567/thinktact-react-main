// Test the old backend URL
const BACKEND_URL = 'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app/api';

async function testOldBackend() {
  console.log('Testing old backend URL:', BACKEND_URL);
  
  try {
    // Test health endpoint
    console.log('\n🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health endpoint status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health response:', healthData);
    } else {
      console.log('❌ Health endpoint failed');
    }
    
    // Test login with admin user
    console.log('\n🔍 Testing login with admin user...');
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Login endpoint status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOldBackend(); 