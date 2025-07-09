const BACKEND_URL = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';

async function testDeployedUserLookup() {
  console.log('🔍 Testing deployed backend user lookup for alex.hawke54@gmail.com');
  
  try {
    // Test 1: Check if the user exists via the API endpoint
    console.log('\n📧 Test 1: Checking user via /api/auth/user/:email endpoint...');
    const response = await fetch(`${BACKEND_URL}/auth/user/alex.hawke54@gmail.com`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ User found via API!');
      console.log('User details:', user);
    } else {
      const error = await response.text();
      console.log('❌ User not found via API');
      console.log('Error response:', error);
    }
    
    // Test 2: Test the request-reset endpoint directly
    console.log('\n🔄 Test 2: Testing request-reset endpoint...');
    const resetResponse = await fetch(`${BACKEND_URL}/auth/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        securityAnswer: 'test' // We'll try with a test answer first
      })
    });
    
    console.log('Reset response status:', resetResponse.status);
    
    if (resetResponse.ok) {
      const result = await resetResponse.json();
      console.log('✅ Reset request successful!');
      console.log('Result:', result);
    } else {
      const error = await resetResponse.text();
      console.log('❌ Reset request failed');
      console.log('Error response:', error);
    }
    
    // Test 3: Check if there are any users in the system
    console.log('\n📋 Test 3: Checking if there are any users in the system...');
    try {
      const adminResponse = await fetch(`${BACKEND_URL}/admin/users`);
      if (adminResponse.ok) {
        const users = await adminResponse.json();
        console.log(`✅ Found ${users.length} users in system`);
        if (users.length > 0) {
          console.log('First few users:');
          users.slice(0, 3).forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
          });
        }
      } else {
        console.log('❌ Could not fetch users (admin endpoint might not exist)');
      }
    } catch (error) {
      console.log('❌ Error fetching users:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error details:', error.message);
  }
}

testDeployedUserLookup(); 