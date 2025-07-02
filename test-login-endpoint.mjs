import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-e825z82x9-gabrielle-shands-projects.vercel.app';

async function testLoginEndpoint() {
  console.log('🔍 Testing Login Endpoint');
  console.log('========================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'testpassword123' // Replace with your actual password
      })
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Success Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testLoginEndpoint(); 