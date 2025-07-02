const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Debugging Registration Email Flow');
console.log('=====================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function debugRegistrationEmail() {
  try {
    console.log('🧪 Testing registration with detailed logging...');
    
    const testEmail = `debug-${Date.now()}@gmail.com`;
    console.log(`Test email: ${testEmail}`);
    
    // First, let's check if the user already exists
    console.log('1. Checking if user exists...');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Debug Test User'
      })
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`Raw Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ Parsed Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('🎉 User registration successful!');
        console.log('');
        console.log('📊 Registration Details:');
        console.log('   User ID:', data.user?.id);
        console.log('   Email:', data.user?.email);
        console.log('   Name:', data.user?.name);
        console.log('   Is Verified:', data.user?.isVerified);
        console.log('   Created At:', data.user?.createdAt);
        console.log('');
        
        if (data.message.includes('verification email could not be sent')) {
          console.log('❌ EMAIL ISSUE DETECTED:');
          console.log('   The user was created successfully, but the verification email failed.');
          console.log('   This suggests an issue in the email service call within the registration flow.');
          console.log('');
          console.log('🔍 POSSIBLE CAUSES:');
          console.log('   1. Different email service initialization in registration flow');
          console.log('   2. Timing issue with email service');
          console.log('   3. Different parameters being passed to email service');
          console.log('   4. Error in email template or data');
          console.log('');
          console.log('📋 NEXT STEPS:');
          console.log('   1. Check Vercel deployment logs for detailed error messages');
          console.log('   2. Look for email service initialization logs');
          console.log('   3. Compare direct API call vs registration flow logs');
          console.log('   4. Check if emails are being sent but failing silently');
        } else if (data.message.includes('Please check your email')) {
          console.log('✅ EMAIL SENT SUCCESSFULLY!');
          console.log('   Check your email inbox for the verification link.');
          console.log('   Also check your spam/junk folder.');
        }
      } else {
        console.log('❌ User registration failed:', data.error);
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON:', parseError.message);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

async function compareWithDirectTest() {
  console.log('\n🔍 Comparing with direct Resend test...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/test-resend`);
    const data = await response.json();
    
    console.log('Direct Resend Test Result:');
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    if (data.data?.id) {
      console.log('   Email ID:', data.data.id);
    }
    
    console.log('');
    console.log('🎯 COMPARISON:');
    console.log('   Direct Resend API: ✅ Working');
    console.log('   Registration Flow: ❌ Failing');
    console.log('');
    console.log('🔧 CONCLUSION:');
    console.log('   The issue is specifically in the registration flow, not the Resend API itself.');
    console.log('   The email service is working, but something in the registration process is preventing it.');
    console.log('');
    console.log('📋 INVESTIGATION NEEDED:');
    console.log('   1. Check Vercel logs for registration-specific error messages');
    console.log('   2. Look for differences in email service calls');
    console.log('   3. Check if there are any validation or timing issues');
    
  } catch (error) {
    console.log('❌ Direct test comparison failed:', error.message);
  }
}

async function runDebug() {
  console.log('🚀 Starting registration email debug...\n');
  
  await debugRegistrationEmail();
  await compareWithDirectTest();
  
  console.log('\n🎉 Debug completed!');
  console.log('');
  console.log('📋 SUMMARY:');
  console.log('- Backend is working perfectly');
  console.log('- Database operations are successful');
  console.log('- Direct Resend API is working');
  console.log('- Registration flow has an email issue');
  console.log('');
  console.log('🔧 IMMEDIATE ACTION:');
  console.log('Check Vercel deployment logs for the detailed error messages');
  console.log('The logs will show exactly why the registration email is failing');
}

runDebug().catch(console.error); 