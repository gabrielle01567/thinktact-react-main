const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Admin User Creation');
console.log('================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testAdminUserCreation() {
  try {
    const testEmail = 'ajhawke.consulting@gmail.com';
    console.log(`🧪 Testing admin user creation with email: ${testEmail}`);
    
    const response = await fetch(`${BACKEND_URL}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Alex',
        lastName: 'Hawke',
        email: testEmail,
        password: 'testpassword123',
        securityQuestion: 'What was the name of your first pet?',
        securityAnswer: 'Fluffy',
        isAdmin: true
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
        console.log('🎉 Admin user creation successful!');
        console.log('📧 User email:', data.user.email);
        console.log('👤 User name:', `${data.user.firstName} ${data.user.lastName}`);
        console.log('👑 Admin privileges:', data.user.isAdmin);
        console.log('✅ Verified:', data.user.verified);
      } else {
        console.log('❌ Admin user creation failed:', data.error);
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testAdminUserCreation(); 