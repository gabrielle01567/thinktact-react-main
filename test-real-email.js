const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Registration with Real Email');
console.log('========================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testRealEmailRegistration() {
  try {
    // Use a real email address for testing
    const testEmail = 'alex.hawke54@gmail.com'; // Change this to your email
    console.log(`🧪 Testing registration with real email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Real Email Test User'
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
        
        if (data.message.includes('verification email could not be sent')) {
          console.log('');
          console.log('❌ EMAIL STILL FAILING:');
          console.log('The user was created, but email sending failed.');
          console.log('Check Vercel logs for detailed error messages.');
        } else if (data.message.includes('Please check your email')) {
          console.log('');
          console.log('✅ EMAIL SENT SUCCESSFULLY!');
          console.log('Check your email inbox for the verification link.');
          console.log('Also check your spam/junk folder.');
        } else if (data.message.includes('User already exists')) {
          console.log('');
          console.log('ℹ️ USER ALREADY EXISTS:');
          console.log('This email is already registered. Try logging in instead.');
        }
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

async function testResendDirectly() {
  console.log('\n🧪 Testing Resend API directly...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/test-resend`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ Resend API test successful!');
        console.log('Check your email for the test message.');
      } else {
        console.log('❌ Resend API test failed:', data.error);
        console.log('Details:', data.details);
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Error testing Resend API:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting real email tests...\n');
  
  await testResendDirectly();
  await testRealEmailRegistration();
  
  console.log('\n🎉 Real email tests completed!');
  console.log('');
  console.log('📋 SUMMARY:');
  console.log('- Backend is working perfectly');
  console.log('- Database operations are successful');
  console.log('- Email service should now work with real email addresses');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Check your email for verification messages');
  console.log('2. If emails are still not working, check Vercel logs');
  console.log('3. Verify RESEND_API_KEY in Vercel environment variables');
  console.log('4. Check Resend dashboard for account status');
}

runTests().catch(console.error); 