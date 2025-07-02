const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Comprehensive Email Service Diagnosis');
console.log('=========================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function checkBackendHealth() {
  console.log('1️⃣ Checking backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Backend health check:');
    console.log('   Status:', response.status);
    console.log('   Environment:', data.environment);
    console.log('   Supabase URL:', data.supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   Supabase Key:', data.supabaseKey ? '✅ Set' : '❌ Missing');
    console.log('   JWT Secret:', data.jwtSecret ? '✅ Set' : '❌ Missing');
    console.log('   Resend Key:', data.resendKey ? '✅ Set' : '❌ Missing');
    console.log('');
    return data;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return null;
  }
}

async function testDirectResendAPI() {
  console.log('2️⃣ Testing direct Resend API...');
  try {
    const response = await fetch(`${BACKEND_URL}/test-resend`);
    const data = await response.json();
    
    console.log('✅ Direct Resend API test:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    if (data.success) {
      console.log('   Message:', data.message);
      console.log('   Email ID:', data.data?.id);
    } else {
      console.log('   Error:', data.error);
      console.log('   Details:', data.details);
    }
    console.log('');
    return data;
  } catch (error) {
    console.log('❌ Direct Resend API test failed:', error.message);
    return null;
  }
}

async function testRegistrationFlow() {
  console.log('3️⃣ Testing registration flow...');
  try {
    const testEmail = `diagnostic-${Date.now()}@gmail.com`;
    console.log(`   Using test email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Diagnostic Test User'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Registration flow test:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    
    if (data.success) {
      console.log('   User ID:', data.user?.id);
      console.log('   User Email:', data.user?.email);
      console.log('   Is Verified:', data.user?.isVerified);
      
      if (data.message.includes('verification email could not be sent')) {
        console.log('   ❌ Email sending failed in registration flow');
      } else if (data.message.includes('Please check your email')) {
        console.log('   ✅ Email sent successfully in registration flow');
      }
    } else {
      console.log('   Error:', data.error);
    }
    console.log('');
    return data;
  } catch (error) {
    console.log('❌ Registration flow test failed:', error.message);
    return null;
  }
}

async function testSupabaseConnection() {
  console.log('4️⃣ Testing Supabase connection...');
  try {
    const response = await fetch(`${BACKEND_URL}/test-supabase`);
    const data = await response.json();
    
    console.log('✅ Supabase connection test:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    if (data.data) {
      console.log('   Data:', data.data);
    }
    console.log('');
    return data;
  } catch (error) {
    console.log('❌ Supabase connection test failed:', error.message);
    return null;
  }
}

async function checkEnvironmentVariables() {
  console.log('5️⃣ Checking environment variables...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Environment variables status:');
    console.log('   All required variables are set:', 
      data.supabaseUrl && data.supabaseKey && data.jwtSecret && data.resendKey ? '✅ Yes' : '❌ No');
    
    if (!data.resendKey) {
      console.log('   ❌ RESEND_API_KEY is missing!');
      console.log('   🔧 Fix: Add RESEND_API_KEY to Vercel environment variables');
    } else {
      console.log('   ✅ RESEND_API_KEY is set');
    }
    console.log('');
    return data;
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    return null;
  }
}

async function runDiagnosis() {
  console.log('🚀 Starting comprehensive email diagnosis...\n');
  
  const health = await checkBackendHealth();
  const resendTest = await testDirectResendAPI();
  const registration = await testRegistrationFlow();
  const supabase = await testSupabaseConnection();
  const env = await checkEnvironmentVariables();
  
  console.log('🎯 DIAGNOSIS SUMMARY:');
  console.log('=====================');
  
  if (health && health.resendKey) {
    console.log('✅ RESEND_API_KEY is configured');
  } else {
    console.log('❌ RESEND_API_KEY is missing or not accessible');
  }
  
  if (resendTest && resendTest.success) {
    console.log('✅ Direct Resend API is working');
  } else {
    console.log('❌ Direct Resend API is failing');
  }
  
  if (registration && registration.success) {
    if (registration.message.includes('verification email could not be sent')) {
      console.log('❌ Registration email flow is failing');
    } else {
      console.log('✅ Registration email flow is working');
    }
  } else {
    console.log('❌ Registration flow is failing');
  }
  
  if (supabase && supabase.success) {
    console.log('✅ Supabase connection is working');
  } else {
    console.log('❌ Supabase connection is failing');
  }
  
  console.log('');
  console.log('🔧 RECOMMENDED ACTIONS:');
  console.log('=======================');
  
  if (health && health.resendKey && resendTest && resendTest.success) {
    console.log('1. ✅ Resend API is working - check Vercel logs for registration flow errors');
    console.log('2. 🔍 Look for differences between direct API call and registration flow');
    console.log('3. 📧 Check if emails are being sent but not delivered (spam folder)');
  } else if (!health || !health.resendKey) {
    console.log('1. ❌ RESEND_API_KEY is missing - add it to Vercel environment variables');
    console.log('2. 🔄 Redeploy the backend after adding the environment variable');
  } else {
    console.log('1. ❌ Resend API is not working - check API key validity');
    console.log('2. 🔍 Check Resend dashboard for account status and credits');
    console.log('3. 🔄 Update RESEND_API_KEY in Vercel if needed');
  }
  
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Check Vercel deployment logs for detailed error messages');
  console.log('2. Verify RESEND_API_KEY in Resend dashboard');
  console.log('3. Test with a real email address on the live site');
  console.log('4. Check spam/junk folder for verification emails');
}

runDiagnosis().catch(console.error); 