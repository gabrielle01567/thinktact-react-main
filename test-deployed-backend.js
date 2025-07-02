const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testDeployedBackend() {
  console.log('🔍 Testing Deployed Backend');
  console.log('================================');
  
  try {
    console.log('📡 Testing admin/users endpoint...');
    const response = await fetch(`${BACKEND_URL}/admin/users`);
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    
    if (data.users && data.users.length > 0) {
      console.log(`✅ Found ${data.users.length} users`);
    } else {
      console.log('⚠️ No users found in deployed backend');
    }
    
  } catch (error) {
    console.error('❌ Error testing deployed backend:', error);
  }
}

testDeployedBackend(); 