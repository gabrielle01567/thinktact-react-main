// Test script for the new backend v2 deployment
// Replace this URL with your actual new backend URL
const NEW_BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

async function testNewBackend() {
  console.log('🔍 Testing New Backend V2 Deployment');
  console.log('Backend URL:', NEW_BACKEND_URL);
  console.log('\n⚠️  IMPORTANT: Update the NEW_BACKEND_URL variable above with your actual deployment URL');
  
  try {
    // Test 1: Health endpoint
    console.log('\n🔍 Test 1: Health endpoint');
    const healthResponse = await fetch(`${NEW_BACKEND_URL}/health`);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health response:', healthData);
    } else {
      const healthText = await healthResponse.text();
      console.log('❌ Health failed:', healthText.substring(0, 200));
    }
    
    // Test 2: Supabase connection test
    console.log('\n🔍 Test 2: Supabase connection test');
    const supabaseResponse = await fetch(`${NEW_BACKEND_URL}/test-supabase`);
    console.log('Supabase test status:', supabaseResponse.status);
    
    if (supabaseResponse.ok) {
      const supabaseData = await supabaseResponse.json();
      console.log('✅ Supabase test:', supabaseData);
    } else {
      const supabaseText = await supabaseResponse.text();
      console.log('❌ Supabase test failed:', supabaseText.substring(0, 200));
    }
    
    // Test 3: Login with admin user
    console.log('\n🔍 Test 3: Login endpoint');
    const loginResponse = await fetch(`${NEW_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
    } else {
      const loginText = await loginResponse.text();
      console.log('❌ Login failed:', loginText.substring(0, 200));
    }
    
    // Test 4: Registration endpoint
    console.log('\n🔍 Test 4: Registration endpoint');
    const registerResponse = await fetch(`${NEW_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-new-backend@example.com',
        password: 'testpass123'
      })
    });
    
    console.log('Register status:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', registerData);
    } else {
      const registerText = await registerResponse.text();
      console.log('❌ Registration failed:', registerText.substring(0, 200));
    }
    
    console.log('\n🎉 New backend test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('This might mean the backend URL is incorrect or not deployed yet');
  }
}

// Check if URL has been updated
if (NEW_BACKEND_URL === 'https://your-new-backend-url.vercel.app') {
  console.log('❌ Please update the NEW_BACKEND_URL variable in this script with your actual deployment URL');
  console.log('Then run: node test-new-backend.js');
} else {
  testNewBackend();
} 