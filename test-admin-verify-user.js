const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Admin User Verification');
console.log('==================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testAdminVerifyUser() {
  try {
    const testEmail = 'ajhawke.consulting@gmail.com';
    console.log(`🧪 Testing admin user verification with email: ${testEmail}`);
    
    const requestBody = {
      email: testEmail
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${BACKEND_URL}/api/admin/verify-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`📥 Raw Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('🎉 Admin user verification successful!');
        console.log('📧 User email:', data.user.email);
        console.log('👤 User name:', `${data.user.firstName} ${data.user.lastName}`);
        console.log('✅ Verified:', data.user.verified);
      } else {
        console.log('❌ Admin user verification failed:', data.error);
        
        if (data.error === 'User is already verified') {
          console.log('ℹ️ This is expected if the user was already verified');
        }
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
      console.log('Parse error:', parseError.message);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('Error stack:', error.stack);
  }
}

testAdminVerifyUser(); 