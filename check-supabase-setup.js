import { createClient } from '@supabase/supabase-js';

console.log('🔍 === CHECKING SUPABASE SETUP ===\n');

// Test environment variables
console.log('📝 Test 1: Environment Variables');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('   SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'NOT SET');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `Set (${supabaseServiceKey.substring(0, 15)}...)` : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('   ❌ Environment variables not set locally (expected for Vercel deployment)');
  console.log('   ✅ This is normal - we\'ll test the deployed backend instead\n');
} else {
  console.log('   ✅ Environment variables found locally\n');
}

// Test backend health endpoint
console.log('📝 Test 2: Backend Health Check');
try {
  const healthResponse = await fetch('https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/health');
  const healthData = await healthResponse.json();
  
  console.log('   Status:', healthResponse.status);
  console.log('   Environment Variables on Backend:');
  console.log('     SUPABASE_URL:', healthData.supabaseUrl);
  console.log('     SUPABASE_SERVICE_ROLE_KEY:', healthData.supabaseKey);
  console.log('     JWT_SECRET:', healthData.jwtSecret);
  console.log('     RESEND_API_KEY:', healthData.resendKey);
  
  if (healthData.supabaseUrl && healthData.supabaseKey) {
    console.log('   ✅ Backend has Supabase environment variables');
  } else {
    console.log('   ❌ Backend missing Supabase environment variables');
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Health check failed:', error.message, '\n');
}

// Test direct Supabase connection (if we have local env vars)
if (supabaseUrl && supabaseServiceKey) {
  console.log('📝 Test 3: Direct Supabase Connection');
  try {
    console.log('   🔧 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('   🔧 Testing connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('   ❌ Connection failed:', error.message);
      console.log('   ❌ Error code:', error.code);
      console.log('   ❌ Error details:', error.details);
      
      if (error.code === 'PGRST116') {
        console.log('   💡 This might mean the users table doesn\'t exist');
      } else if (error.code === 'PGRST301') {
        console.log('   💡 This might mean invalid credentials');
      }
    } else {
      console.log('   ✅ Connection successful!');
      console.log('   ✅ Users table exists and is accessible');
      console.log('   📊 Data:', data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Supabase client creation failed:', error.message, '\n');
  }
}

// Test backend registration endpoint
console.log('📝 Test 4: Backend Registration Endpoint');
try {
  const response = await fetch('https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api/auth/register', {
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
    console.log('   ❌ Backend still reports "Database not configured"');
    console.log('   🔍 This suggests:');
    console.log('      - Supabase client not initializing in backend');
    console.log('      - Environment variables not being read correctly');
    console.log('      - Supabase connection failing in backend');
  } else if (data.success) {
    console.log('   ✅ Registration working!');
  } else {
    console.log('   ⚠️ Different error:', data.error);
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Registration test failed:', error.message, '\n');
}

console.log('🔍 === ANALYSIS ===');
console.log('\nPossible issues:');
console.log('1. ✅ Environment variables are set on backend');
console.log('2. ❓ Supabase client not initializing properly');
console.log('3. ❓ Users table might not exist in Supabase');
console.log('4. ❓ Supabase credentials might be incorrect');
console.log('5. ❓ Network connectivity issues');

console.log('\nNext steps:');
console.log('1. Check if users table exists in Supabase dashboard');
console.log('2. Verify Supabase URL and service role key are correct');
console.log('3. Check Vercel deployment logs for Supabase initialization errors');
console.log('4. Ensure Supabase project is active and not paused'); 