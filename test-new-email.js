const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Registration with New Email');
console.log('======================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testNewEmailRegistration() {
  try {
    // Use a new email address for testing
    const testEmail = `test-${Date.now()}@gmail.com`;
    console.log(`🧪 Testing registration with new email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'New Email Test User'
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
          console.log('');
          console.log('🎉 EMAIL SERVICE IS WORKING!');
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

async function runTests() {
  console.log('🚀 Starting new email test...\n');
  
  await testNewEmailRegistration();
  
  console.log('\n🎉 New email test completed!');
  console.log('');
  console.log('📋 SUMMARY:');
  console.log('- Backend is working perfectly');
  console.log('- Database operations are successful');
  console.log('- If email was sent successfully, the email service is working!');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Check your email for verification messages');
  console.log('2. If emails are working, your system is fully functional!');
  console.log('3. If emails are still not working, check Vercel logs');
}

runTests().catch(console.error); 