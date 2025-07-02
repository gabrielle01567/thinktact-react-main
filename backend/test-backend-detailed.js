// Detailed backend test to identify the specific issue
const BACKEND_URL = 'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app/api';

async function testBackendDetailed() {
  console.log('🔍 Detailed Backend Test');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test 1: Root endpoint
    console.log('\n🔍 Test 1: Root endpoint');
    const rootResponse = await fetch(`${BACKEND_URL.replace('/api', '')}`);
    console.log('Root status:', rootResponse.status);
    const rootText = await rootResponse.text();
    console.log('Root response (first 200 chars):', rootText.substring(0, 200));
    
    // Test 2: Health endpoint
    console.log('\n🔍 Test 2: Health endpoint');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health status:', healthResponse.status);
    const healthText = await healthResponse.text();
    console.log('Health response (first 500 chars):', healthText.substring(0, 500));
    
    // Test 3: Supabase connection test
    console.log('\n🔍 Test 3: Supabase connection test');
    const supabaseResponse = await fetch(`${BACKEND_URL.replace('/api', '')}/test-supabase`);
    console.log('Supabase test status:', supabaseResponse.status);
    const supabaseText = await supabaseResponse.text();
    console.log('Supabase test response (first 500 chars):', supabaseText.substring(0, 500));
    
    // Test 4: Test endpoint
    console.log('\n🔍 Test 4: Test endpoint');
    const testResponse = await fetch(`${BACKEND_URL}/test`);
    console.log('Test status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('Test response (first 200 chars):', testText.substring(0, 200));
    
    // Test 5: Login endpoint with detailed error
    console.log('\n🔍 Test 5: Login endpoint');
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    console.log('Login status:', loginResponse.status);
    const loginText = await loginResponse.text();
    console.log('Login response (first 500 chars):', loginText.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackendDetailed(); 