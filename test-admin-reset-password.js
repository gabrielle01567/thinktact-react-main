const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testAdminResetPassword() {
  console.log('🔍 Testing Admin Reset Password');
  console.log('================================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // First, get a list of users to find a user ID to test with
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    const usersData = await usersResponse.json();
    
    if (!usersData.success || !usersData.users || usersData.users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = usersData.users[0];
    console.log(`🧪 Testing with user: ${testUser.email} (ID: ${testUser.id})`);

    // Test the reset password endpoint
    const newPassword = 'newTestPassword123';
    const response = await fetch(`${BACKEND_URL}/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: testUser.id, 
        newPassword: newPassword 
      })
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('🎉 SUCCESS: Password reset successful!');
    } else {
      console.log('❌ FAILED: Password reset failed');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin reset password:', error);
  }
}

testAdminResetPassword(); 