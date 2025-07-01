// Using built-in fetch (Node.js 18+)

console.log('🔍 === CHECKING ALL POSSIBILITIES ===\n');

const BACKEND_URL = 'https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api';

// Test 1: Check if backend is responding at all
console.log('📝 Test 1: Basic Backend Response');
try {
  const response = await fetch(`${BACKEND_URL}/test`);
  console.log('   Status:', response.status);
  console.log('   Headers:', Object.fromEntries(response.headers.entries()));
  const data = await response.json();
  console.log('   Response:', data);
  console.log('   ✅ Backend is responding\n');
} catch (error) {
  console.log('   ❌ Backend not responding:', error.message, '\n');
}

// Test 2: Check health endpoint for environment variables
console.log('📝 Test 2: Health Check - Environment Variables');
try {
  const response = await fetch(`${BACKEND_URL}/health`);
  const data = await response.json();
  console.log('   Status:', response.status);
  console.log('   Environment Variables:');
  console.log('     SUPABASE_URL:', data.supabaseUrl);
  console.log('     SUPABASE_SERVICE_ROLE_KEY:', data.supabaseKey);
  console.log('     JWT_SECRET:', data.jwtSecret);
  console.log('     RESEND_API_KEY:', data.resendKey);
  console.log('   ✅ Health check completed\n');
} catch (error) {
  console.log('   ❌ Health check failed:', error.message, '\n');
}

// Test 3: Check if registration endpoint exists
console.log('📝 Test 3: Registration Endpoint Check');
try {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-check@example.com',
      password: 'testpassword123'
    })
  });
  const data = await response.json();
  console.log('   Status:', response.status);
  console.log('   Response:', data);
  
  if (data.error === 'Database not configured') {
    console.log('   ❌ Database not configured error still present');
  } else if (data.success === false) {
    console.log('   ⚠️ Registration failed but with different error:', data.error);
  } else {
    console.log('   ✅ Registration endpoint working!');
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Registration endpoint error:', error.message, '\n');
}

// Test 4: Check for deployment timing issues
console.log('📝 Test 4: Deployment Timing Check');
try {
  const response = await fetch(`${BACKEND_URL}/health`);
  const data = await response.json();
  const timestamp = new Date(data.timestamp);
  const now = new Date();
  const diffMinutes = (now - timestamp) / (1000 * 60);
  console.log('   Last deployment:', timestamp.toISOString());
  console.log('   Current time:', now.toISOString());
  console.log('   Time difference:', diffMinutes.toFixed(2), 'minutes');
  
  if (diffMinutes < 5) {
    console.log('   ✅ Deployment is recent');
  } else {
    console.log('   ⚠️ Deployment might be stale');
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Could not check deployment timing:', error.message, '\n');
}

// Test 5: Check for different error patterns
console.log('📝 Test 5: Error Pattern Analysis');
try {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-pattern@example.com',
      password: 'testpassword123'
    })
  });
  const data = await response.json();
  console.log('   Status:', response.status);
  console.log('   Full response:', JSON.stringify(data, null, 2));
  
  if (data.error && data.error.includes('Database not configured')) {
    console.log('   ❌ Still getting "Database not configured"');
    console.log('   🔍 This suggests:');
    console.log('      - Environment variables might be wrong');
    console.log('      - Supabase client not initializing');
    console.log('      - Deployment hasn\'t completed');
    console.log('      - Code changes not deployed');
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Error pattern test failed:', error.message, '\n');
}

console.log('🔍 === ANALYSIS COMPLETE ===');
console.log('\nPossible issues:');
console.log('1. Environment variables not set correctly on Vercel');
console.log('2. Supabase URL or key is incorrect');
console.log('3. Deployment hasn\'t completed yet');
console.log('4. Vercel caching old responses');
console.log('5. Code changes not being deployed');
console.log('6. Supabase database not accessible');
console.log('7. Network connectivity issues');
console.log('8. Vercel function timeout or memory issues'); 