const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testSupabaseDebug() {
  console.log('🔍 Testing Supabase Debug');
  console.log('=========================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // Test the getAllUsers function directly by calling the admin/users endpoint
    console.log('🧪 Testing getAllUsers function...');
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    console.log(`📊 Users Status: ${usersResponse.status}`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('📥 Users Response:', JSON.stringify(usersData, null, 2));
    } else {
      console.log('❌ Users endpoint failed');
      const errorText = await usersResponse.text();
      console.log('Error response:', errorText);
    }

    // Test if we can create a user to see if the database is working
    console.log('\n🧪 Testing user creation to check database...');
    const testEmail = `debug-test-${Date.now()}@example.com`;
    const registerResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'debugpassword123',
        name: 'Debug Test User'
      })
    });

    console.log(`📊 Registration Status: ${registerResponse.status}`);
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User creation successful:', registerData);
      
      // Now test if the user appears in the admin list
      console.log('\n🧪 Testing if new user appears in admin list...');
      const usersResponse2 = await fetch(`${BACKEND_URL}/admin/users`);
      if (usersResponse2.ok) {
        const usersData2 = await usersResponse2.json();
        console.log('📥 Updated Users Response:', JSON.stringify(usersData2, null, 2));
        
        if (usersData2.success && usersData2.users) {
          const foundUser = usersData2.users.find(u => u.email === testEmail);
          if (foundUser) {
            console.log('✅ New user found in admin list!');
          } else {
            console.log('❌ New user not found in admin list');
          }
        }
      }
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ User creation failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing Supabase debug:', error);
  }
}

testSupabaseDebug(); 