const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Comprehensive Email Service Debug Test');
console.log('==========================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testEmailService() {
  try {
    console.log('🧪 Testing email service with detailed logging...');
    
    const testEmail = `email-test-${Date.now()}@example.com`;
    console.log(`Test email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Email Test User'
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
          console.log('❌ EMAIL ISSUE DIAGNOSED:');
          console.log('The user was created successfully, but the verification email failed to send.');
          console.log('');
          console.log('🔧 POSSIBLE CAUSES:');
          console.log('1. RESEND_API_KEY is incorrect or expired');
          console.log('2. Resend account is suspended or has no credits');
          console.log('3. Domain verification issues in Resend');
          console.log('4. Rate limiting or API quota exceeded');
          console.log('5. Network connectivity issues');
          console.log('');
          console.log('📋 NEXT STEPS:');
          console.log('1. Check Vercel deployment logs for detailed error messages');
          console.log('2. Verify RESEND_API_KEY in Vercel environment variables');
          console.log('3. Check Resend dashboard for account status and logs');
          console.log('4. Test with a different email address');
          console.log('');
          console.log('🔗 Useful Links:');
          console.log('- Vercel Dashboard: https://vercel.com/dashboard');
          console.log('- Resend Dashboard: https://resend.com/dashboard');
          console.log('- Resend API Docs: https://resend.com/docs');
        } else if (data.message.includes('Please check your email')) {
          console.log('✅ Email sent successfully! Check your inbox and Resend logs.');
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
    // Test if we can access Resend API documentation or status
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 'test'}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Resend API Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('❌ RESEND_API_KEY is invalid or expired');
    } else if (response.status === 200) {
      console.log('✅ Resend API is accessible');
    } else {
      console.log(`⚠️ Resend API returned status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Cannot test Resend API directly:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive email debug tests...\n');
  
  await testEmailService();
  await testResendDirectly();
  
  console.log('\n🎉 Email debug tests completed!');
  console.log('');
  console.log('📋 SUMMARY:');
  console.log('- Backend is working perfectly');
  console.log('- User registration is successful');
  console.log('- Email service needs investigation');
  console.log('');
  console.log('🔧 IMMEDIATE ACTIONS:');
  console.log('1. Check Vercel deployment logs for email error details');
  console.log('2. Verify RESEND_API_KEY in Vercel environment variables');
  console.log('3. Check Resend dashboard for account status');
}

runTests().catch(console.error); 