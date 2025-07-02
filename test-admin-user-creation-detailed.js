const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Admin User Creation (Detailed)');
console.log('=========================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testAdminUserCreationDetailed() {
  try {
    const testEmail = 'ajhawke.consulting@gmail.com';
    console.log(`🧪 Testing admin user creation with email: ${testEmail}`);
    
    const requestBody = {
      firstName: 'Alex',
      lastName: 'Hawke',
      email: testEmail,
      password: 'testpassword123',
      securityQuestion: 'What was the name of your first pet?',
      securityAnswer: 'Fluffy',
      isAdmin: true
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${BACKEND_URL}/api/admin/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`📥 Raw Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('🎉 Admin user creation successful!');
        console.log('📧 User email:', data.user.email);
        console.log('👤 User name:', `${data.user.firstName} ${data.user.lastName}`);
        console.log('👑 Admin privileges:', data.user.isAdmin);
        console.log('✅ Verified:', data.user.verified);
      } else {
        console.log('❌ Admin user creation failed:', data.error);
        
        if (data.error === 'Internal server error') {
          console.log('');
          console.log('🔧 ISSUE: Internal server error');
          console.log('This suggests there might be an issue with:');
          console.log('- Database connection');
          console.log('- Function implementation');
          console.log('- Environment variables');
          console.log('');
          console.log('📋 Check Vercel deployment logs for more details');
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

testAdminUserCreationDetailed(); 