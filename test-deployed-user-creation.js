const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testDeployedUserCreation() {
  console.log('🔍 Testing Deployed User Creation');
  console.log('================================');
  
  try {
    // First, check current users
    console.log('📡 Checking current users...');
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    const usersData = await usersResponse.json();
    console.log(`📊 Current users: ${usersData.users.length}`);
    
    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`📡 Creating test user: ${testEmail}`);
    
    const createResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        securityQuestion: 'What was the name of your first pet?',
        securityAnswer: 'Fluffy'
      })
    });
    
    const createData = await createResponse.json();
    console.log('📊 Create response:', JSON.stringify(createData, null, 2));
    
    if (createData.success) {
      console.log('✅ User created successfully');
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check users again
      console.log('📡 Checking users after creation...');
      const usersResponse2 = await fetch(`${BACKEND_URL}/admin/users`);
      const usersData2 = await usersResponse2.json();
      console.log(`📊 Users after creation: ${usersData2.users.length}`);
      
      if (usersData2.users.length > usersData.users.length) {
        console.log('✅ New user appears in admin list');
        console.log('📋 Latest user:', usersData2.users[0]);
      } else {
        console.log('⚠️ New user does not appear in admin list');
      }
    } else {
      console.log('❌ User creation failed:', createData.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing deployed user creation:', error);
  }
}

testDeployedUserCreation(); 