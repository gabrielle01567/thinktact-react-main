async function testUserLookup() {
  const backendUrl = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';
  
  console.log('🔍 Testing user lookup...');
  
  // Replace with the email you're trying to log in with
  const testEmail = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL
  
  try {
    // Test the user lookup endpoint (if it exists)
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

testUserLookup(); 