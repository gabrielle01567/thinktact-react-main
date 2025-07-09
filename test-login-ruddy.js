async function testLoginRuddy() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing login with ruddy backend...');
  console.log('Backend URL:', backendUrl);
  
  // Test login with the user credentials
  const loginData = {
    email: 'alex.hawke54@gmail.com',
    password: 'your-password-here' // You'll need to provide the actual password
  };
  
  console.log('\n📋 Test login with:', loginData.email);
  console.log('Note: You need to provide the actual password in the script');
  
  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Login failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error during login test:', error.message);
  }
}

testLoginRuddy(); 