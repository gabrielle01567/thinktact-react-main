async function testRuddyHealth() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app';
  
  console.log('🔍 Testing ruddy backend health...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test 1: Health check
    console.log('\n📋 Test 1: Health check...');
    const healthResponse = await fetch(backendUrl);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health response:', healthData);
    }
    
    // Test 2: Check if any users exist
    console.log('\n📋 Test 2: Checking for any users...');
    const usersResponse = await fetch(`${backendUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Users endpoint status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users found:', usersData);
    } else {
      const errorText = await usersResponse.text();
      console.log('Users endpoint error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend health:', error.message);
  }
}

testRuddyHealth(); 