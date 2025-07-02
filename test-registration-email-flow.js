const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🧪 Testing Registration Email Flow');
console.log('===================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testRegistrationEmailFlow() {
  try {
    console.log('1️⃣ Testing the new registration email flow endpoint...');
    
    const response = await fetch(`${BACKEND_URL}/test-registration-email`);
    const data = await response.json();
    
    console.log('✅ Registration Email Flow Test:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    
    if (data.success) {
      console.log('   Email ID:', data.data?.id);
      console.log('   ✅ Registration email flow is working!');
    } else {
      console.log('   Error:', data.error);
      console.log('   Details:', data.details);
      console.log('   ❌ Registration email flow is failing');
    }
    console.log('');
    
    return data;
    
  } catch (error) {
    console.log('❌ Registration email flow test failed:', error.message);
    return null;
  }
}

async function testDirectResendForComparison() {
  try {
    console.log('2️⃣ Testing direct Resend API for comparison...');
    
    const response = await fetch(`${BACKEND_URL}/test-resend`);
    const data = await response.json();
    
    console.log('✅ Direct Resend Test:');
    console.log('   Status:', response.status);
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);
    
    if (data.success) {
      console.log('   Email ID:', data.data?.id);
    } else {
      console.log('   Error:', data.error);
    }
    console.log('');
    
    return data;
    
  } catch (error) {
    console.log('❌ Direct Resend test failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting registration email flow tests...\n');
  
  const registrationFlow = await testRegistrationEmailFlow();
  const directResend = await testDirectResendForComparison();
  
  console.log('🎯 COMPARISON RESULTS:');
  console.log('======================');
  
  if (registrationFlow && registrationFlow.success) {
    console.log('✅ Registration Email Flow: WORKING');
  } else {
    console.log('❌ Registration Email Flow: FAILING');
  }
  
  if (directResend && directResend.success) {
    console.log('✅ Direct Resend API: WORKING');
  } else {
    console.log('❌ Direct Resend API: FAILING');
  }
  
  console.log('');
  
  if (registrationFlow && registrationFlow.success && directResend && directResend.success) {
    console.log('🎉 SUCCESS! Both email flows are working.');
    console.log('   The registration email issue should now be resolved.');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('   1. Test user registration on the live site');
    console.log('   2. Check if verification emails are now being sent');
    console.log('   3. Verify the emails are delivered to inbox (not spam)');
  } else if (registrationFlow && !registrationFlow.success) {
    console.log('🔧 ISSUE DETECTED:');
    console.log('   The registration email flow is still failing.');
    console.log('   Check the error details above for specific issues.');
    console.log('');
    console.log('📋 TROUBLESHOOTING:');
    console.log('   1. Check Vercel deployment logs for detailed error messages');
    console.log('   2. Verify RESEND_API_KEY is correctly set in Vercel');
    console.log('   3. Check if there are any import or module issues');
  } else {
    console.log('⚠️ UNKNOWN STATE:');
    console.log('   Unable to determine the status of the email flows.');
    console.log('   Check the individual test results above.');
  }
}

runTests().catch(console.error); 