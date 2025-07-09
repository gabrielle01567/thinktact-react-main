async function testRuddyUserLookup() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing user lookup on ruddy backend...');
  
  // Test with the email you want to use
  const testEmail = 'alex.hawke54@gmail.com';
  
  try {
    // Test the user lookup endpoint
    const response = await fetch(`${backendUrl}/auth/user/${encodeURIComponent(testEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User found:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ User lookup error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing user lookup:', error.message);
  }
}

testRuddyUserLookup(); 