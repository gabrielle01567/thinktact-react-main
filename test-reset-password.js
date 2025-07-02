import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-lw86jv6tt-gabrielle-shands-projects.vercel.app';

async function testResetPassword() {
  console.log('🔍 Testing Admin Reset Password');
  console.log('================================');
  
  try {
    // Reset password for alex.hawke54@gmail.com
    const resetData = {
      userId: '39ecf6d4-2f8d-417f-a01b-235ce7ae40c7', // User ID from the admin users response
      newPassword: 'newpassword123'
    };
    
    console.log('🔑 Resetting password for user ID:', resetData.userId);
    
    const response = await fetch(`${BACKEND_URL}/api/admin/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Reset Response:', JSON.stringify(data, null, 2));
      console.log('🔑 New password set to: newpassword123');
    } else {
      const errorData = await response.text();
      console.log('❌ Reset Error:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testResetPassword(); 