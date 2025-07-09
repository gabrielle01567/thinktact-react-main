const BACKEND_URL = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';

async function testGetUserEndpoint() {
  console.log('🔍 Testing getUserByEmail endpoint for alex.hawke54@gmail.com');
  
  try {
    // Test the exact endpoint that the frontend calls
    const response = await fetch(`${BACKEND_URL}/auth/user/alex.hawke54@gmail.com`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ User found via getUserByEmail endpoint!');
      console.log('User details:', user);
      console.log('Security question:', user.securityQuestion);
      console.log('Has security question:', !!user.securityQuestion);
    } else {
      const error = await response.text();
      console.log('❌ User not found via getUserByEmail endpoint');
      console.log('Error response:', error);
    }
    
  } catch (error) {
    console.error('❌ Error testing getUserByEmail endpoint:', error);
    console.error('Error details:', error.message);
  }
}

testGetUserEndpoint(); 