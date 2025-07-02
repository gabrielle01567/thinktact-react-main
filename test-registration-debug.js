const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Registration with Debug');
console.log('===================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testRegistration() {
  try {
    const testEmail = `test-debug-${Date.now()}@example.com`;
    console.log(`🧪 Testing registration with email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Test Debug User'
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
        console.log('📧 Check Resend logs for verification email');
      } else {
        console.log('❌ User registration failed:', data.error);
        
        if (data.error === 'Database not configured') {
          console.log('');
          console.log('🔧 ISSUE: Database not configured');
          console.log('This means the Supabase service is not initializing properly in the deployment.');
          console.log('');
          console.log('📋 Check Vercel deployment logs for:');
          console.log('- Supabase Configuration (Detailed) messages');
          console.log('- Any error messages during initialization');
          console.log('- Environment variable access issues');
        }
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testRegistration(); 