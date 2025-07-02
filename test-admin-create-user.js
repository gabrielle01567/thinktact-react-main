const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testAdminCreateUser() {
  console.log('🔍 Testing Admin Create User');
  console.log('===========================');
  
  try {
    // First, check current users
    console.log('📡 Checking current users...');
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    const usersData = await usersResponse.json();
    console.log(`📊 Current users: ${usersData.users.length}`);
    
    // Create a test user through admin endpoint
    const testEmail = `admin-test-${Date.now()}@example.com`;
    console.log(`📡 Creating test user via admin: ${testEmail}`);
    
    const createResponse = await fetch(`${BACKEND_URL}/admin/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Admin',
        lastName: 'Test',
        email: testEmail,
        password: 'testpassword123',
        securityQuestion: 'What was the name of your first pet?',
        securityAnswer: 'Fluffy',
        isAdmin: false
      })
    });
    
    const createData = await createResponse.json();
    console.log('📊 Create response:', JSON.stringify(createData, null, 2));
    
    if (createData.success) {
      console.log('✅ User created successfully via admin');
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check users again
      console.log('📡 Checking users after admin creation...');
      const usersResponse2 = await fetch(`${BACKEND_URL}/admin/users`);
      const usersData2 = await usersResponse2.json();
      console.log(`📊 Users after admin creation: ${usersData2.users.length}`);
      
      if (usersData2.users.length > usersData.users.length) {
        console.log('✅ New user appears in admin list');
        console.log('📋 Latest user:', usersData2.users[0]);
      } else {
        console.log('⚠️ New user does not appear in admin list');
        console.log('📋 All users:', usersData2.users);
      }
    } else {
      console.log('❌ Admin user creation failed:', createData.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin user creation:', error);
  }
}

testAdminCreateUser(); 