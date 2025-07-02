const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Backend Root Endpoints');
console.log('==================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testEndpoint(path) {
  try {
    console.log(`🔍 Testing ${path}...`);
    
    const response = await fetch(`${BACKEND_URL}${path}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`   Response (first 300 chars): ${text.substring(0, 300)}...`);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log(`   ✅ JSON Response:`, data);
      
      if (path === '/health' && data.supabaseUrl !== undefined) {
        console.log(`   📊 Environment Status:`);
        console.log(`      Supabase URL: ${data.supabaseUrl ? '✅ Set' : '❌ Missing'}`);
        console.log(`      Supabase Key: ${data.supabaseKey ? '✅ Set' : '❌ Missing'}`);
        console.log(`      JWT Secret: ${data.jwtSecret ? '✅ Set' : '❌ Missing'}`);
        console.log(`      Resend Key: ${data.resendKey ? '✅ Set' : '❌ Missing'}`);
      }
    } catch (parseError) {
      console.log(`   ⚠️ Not JSON response`);
    }
    
    console.log('');
    return { success: response.ok, status: response.status, data: text };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing backend endpoints...\n');

  // Test root endpoint
  await testEndpoint('/');
  
  // Test health endpoint
  await testEndpoint('/health');
  
  // Test API test endpoint
  await testEndpoint('/api/test');
  
  // Test Supabase connection endpoint
  await testEndpoint('/test-supabase');
  
  // Test auth register endpoint (should return method not allowed for GET)
  await testEndpoint('/api/auth/register');

  console.log('🎉 Backend endpoint tests completed!');
  console.log('');
  console.log('📋 Summary:');
  console.log('- If /health returns environment status, check if Supabase variables are set');
  console.log('- If endpoints return 404, the backend routes might not be configured correctly');
  console.log('- If you see "Database not configured", add environment variables to Vercel');
}

runTests().catch(console.error); 