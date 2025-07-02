// Using built-in fetch (available in Node.js 18+)

const BACKEND_URL = 'https://thinktact-react-main-blob.vercel.app';

console.log('🔍 Testing Backend Connectivity');
console.log('===============================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const url = `${BACKEND_URL}/api/${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🔍 Testing ${method} ${endpoint}...`);
    const response = await fetch(url, options);
    
    // Try to parse JSON, but handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.log(`⚠️ Response is not JSON: ${text.substring(0, 200)}...`);
      return { success: false, error: 'Non-JSON response', status: response.status, text };
    }

    if (response.ok) {
      console.log(`✅ ${endpoint}: Success`);
      console.log(`   Status: ${response.status}`);
      if (data.message) console.log(`   Message: ${data.message}`);
      if (data.success !== undefined) console.log(`   Success: ${data.success}`);
    } else {
      console.log(`❌ ${endpoint}: Failed`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
    console.log('');
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${endpoint}: Network Error`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting backend connectivity tests...\n');

  // Test 1: Health check
  await testEndpoint('health');

  // Test 2: Test endpoint
  await testEndpoint('test');

  // Test 3: Try to create a test user
  const testEmail = `test-${Date.now()}@example.com`;
  console.log(`🧪 Testing user creation with email: ${testEmail}`);
  
  const registrationResult = await testEndpoint('auth/register', 'POST', {
    email: testEmail,
    password: 'testpassword123',
    name: 'Test User'
  });

  if (registrationResult.success) {
    console.log('✅ User creation test successful!');
    console.log('📧 Check if verification email was sent to Resend logs');
  } else {
    console.log('❌ User creation failed');
    if (registrationResult.data && registrationResult.data.error) {
      console.log(`   Error: ${registrationResult.data.error}`);
      
      if (registrationResult.data.error.includes('Database not configured')) {
        console.log('');
        console.log('🔧 DATABASE NOT CONFIGURED - FIX REQUIRED:');
        console.log('1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables');
        console.log('2. Add/update these variables:');
        console.log('   - SUPABASE_URL: Your Supabase project URL');
        console.log('   - SUPABASE_SERVICE_ROLE_KEY: Your service role key');
        console.log('   - JWT_SECRET: A secure random string');
        console.log('3. Redeploy the backend');
        console.log('');
        console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
        console.log('🔗 Vercel Dashboard: https://vercel.com/dashboard');
      }
    }
  }

  console.log('\n🎉 Backend connectivity tests completed!');
}

runTests().catch(console.error); 