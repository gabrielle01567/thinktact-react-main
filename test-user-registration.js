const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing User Registration');
console.log('=============================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testRegistration() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`🧪 Testing registration with email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON Response:', data);
      
      if (data.success) {
        console.log('🎉 User registration successful!');
        console.log('📧 Check Resend logs for verification email');
      } else {
        console.log('❌ User registration failed:', data.error);
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

async function testAlternativeEndpoints() {
  console.log('\n🔍 Testing alternative endpoints...');
  
  // Test without /api prefix
  try {
    console.log('Testing /auth/register (without /api prefix)...');
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-alt-${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Test User Alt'
      })
    });
    
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 200)}...`);
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting registration tests...\n');
  
  await testRegistration();
  await testAlternativeEndpoints();
  
  console.log('\n🎉 Registration tests completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. If registration works, check Resend logs for emails');
  console.log('2. If it fails, we need to fix the API route configuration');
  console.log('3. The backend environment is properly configured');
}

runTests().catch(console.error); 