// This script tests the backend's Supabase connection

console.log('🔍 === DIRECT SUPABASE CONNECTION TEST ===\n');

// Test the backend's Supabase connection
async function testBackendConnection() {
  console.log('📝 Testing Backend Supabase Connection...\n');
  
  try {
    const response = await fetch('https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/test-supabase', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Backend Supabase connection successful!');
    } else {
      console.log('❌ Backend Supabase connection failed');
    }
    
  } catch (error) {
    console.log('❌ Error testing backend connection:', error.message);
  }
}

// Test environment variables on backend
async function testEnvironmentVariables() {
  console.log('\n📝 Testing Environment Variables...\n');
  
  try {
    const response = await fetch('https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Environment Variables Status:');
    console.log('- SUPABASE_URL:', data.supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', data.supabaseKey ? '✅ Set' : '❌ Missing');
    console.log('- JWT_SECRET:', data.jwtSecret ? '✅ Set' : '❌ Missing');
    console.log('- RESEND_API_KEY:', data.resendKey ? '✅ Set' : '❌ Missing');
    
  } catch (error) {
    console.log('❌ Error testing environment variables:', error.message);
  }
}

// Test registration endpoint to see the exact error
async function testRegistration() {
  console.log('\n📝 Testing Registration Endpoint...\n');
  
  try {
    const response = await fetch('https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    
    const data = await response.json();
    console.log('Registration Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n🔍 Error Analysis:');
      if (data.error.includes('Database not configured')) {
        console.log('❌ Supabase client not initializing');
        console.log('💡 This means the Supabase URL or service role key is incorrect');
      } else if (data.error.includes('connection')) {
        console.log('❌ Network connectivity issue');
      } else {
        console.log('❌ Other error:', data.error);
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing registration:', error.message);
  }
}

async function runTests() {
  await testEnvironmentVariables();
  await testBackendConnection();
  await testRegistration();
  
  console.log('\n🔍 === DIAGNOSIS SUMMARY ===');
  console.log('\nIf you see "Database not configured":');
  console.log('1. Your Supabase URL or service role key is incorrect');
  console.log('2. Go to Supabase Dashboard → Settings → API');
  console.log('3. Copy the EXACT Project URL and service_role key');
  console.log('4. Update them in Vercel environment variables');
  console.log('5. Redeploy your backend');
  
  console.log('\nIf you see connection errors:');
  console.log('1. Check if your Supabase project is active (not paused)');
  console.log('2. Verify you\'re using the correct project');
  console.log('3. Check Vercel deployment logs for more details');
}

runTests(); 