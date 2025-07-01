// Test script to verify backend is working after root directory fix
const BACKEND_URL = 'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app';

async function testBackendAfterFix() {
  console.log('🔍 Testing Backend After Root Directory Fix');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test 1: Health endpoint
    console.log('\n🔍 Test 1: Health endpoint');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health response:', healthData);
    } else {
      const healthText = await healthResponse.text();
      console.log('❌ Health failed:', healthText.substring(0, 200));
    }
    
    // Test 2: Login with admin user
    console.log('\n🔍 Test 2: Login endpoint');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
    
    // Test 3: Supabase connection test
    console.log('\n🔍 Test 3: Supabase connection test');
    const supabaseResponse = await fetch(`${BACKEND_URL}/test-supabase`);
    console.log('Supabase test status:', supabaseResponse.status);
    
    if (supabaseResponse.ok) {
      const supabaseData = await supabaseResponse.json();
      console.log('✅ Supabase test:', supabaseData);
    } else {
      const supabaseText = await supabaseResponse.text();
      console.log('❌ Supabase test failed:', supabaseText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackendAfterFix(); 