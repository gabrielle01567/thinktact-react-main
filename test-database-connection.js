const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection');
  console.log('================================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // Test basic health
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log(`📊 Health Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend is healthy:', healthData);
    } else {
      console.log('❌ Backend health check failed');
    }

    // Test users endpoint
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    console.log(`📊 Users Status: ${usersResponse.status}`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('📥 Users Response:', JSON.stringify(usersData, null, 2));
      
      if (usersData.success && usersData.users) {
        console.log(`👥 Found ${usersData.users.length} users`);
        if (usersData.users.length > 0) {
          console.log('📋 User details:');
          usersData.users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.id})`);
          });
        }
      } else {
        console.log('⚠️ No users data or unexpected response format');
      }
    } else {
      console.log('❌ Users endpoint failed');
      const errorText = await usersResponse.text();
      console.log('Error response:', errorText);
    }

    // Test a simple registration to see if we can create users
    console.log('\n🧪 Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const registerResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        name: 'Test User'
      })
    });

    console.log(`📊 Registration Status: ${registerResponse.status}`);
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User creation successful:', registerData);
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ User creation failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  }
}

testDatabaseConnection(); 