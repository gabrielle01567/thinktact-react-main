import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-lw86jv6tt-gabrielle-shands-projects.vercel.app';

async function testLoginEndpoint() {
  console.log('🔍 Testing Login Endpoint');
  console.log('=========================');
  
  try {
    // Test login with alex.hawke54@gmail.com
    const loginData = {
      email: 'alex.hawke54@gmail.com',
      password: 'newpassword123'
    };
    
    console.log('📧 Attempting login for:', loginData.email);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Login Error:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testLoginEndpoint(); 