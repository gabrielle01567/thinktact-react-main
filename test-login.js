// Test script to check login endpoint and user existence
const backendUrl = 'https://backend-gabrielle-shands-projects.vercel.app/api';

async function testUserAndLogin() {
  try {
    console.log('🔍 Testing user registration (should fail if user exists)...');
    
    // First, try to register the user again to see if they exist
    const registerResponse = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123',
        name: 'Alex Hawke',
        isVerified: true,
        isAdmin: true
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('📝 Registration response:', registerResult);
    
    if (registerResult.success) {
      console.log('✅ User created/updated successfully!');
    } else {
      console.log('⚠️ User already exists or error:', registerResult.error);
    }
    
    console.log('\n🔍 Now testing login...');
    
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('📝 Login response status:', loginResponse.status);
    console.log('📝 Login response:', loginResult);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing:', error);
  }
}

testUserAndLogin();