import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-6yraligda-gabrielle-shands-projects.vercel.app';

async function testResetEndpointStable() {
  console.log('🔍 Testing Password Reset Endpoint (Stable URL)');
  console.log('===============================================');
  
  try {
    // Test with a valid email from your database
    const resetData = {
      email: 'alex.hawke54@gmail.com'
    };
    
    console.log('📧 Testing reset for:', resetData.email);
    
    const response = await fetch(`${BACKEND_URL}/api/admin/request-reset-for-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Reset Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Reset Error:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testResetEndpointStable(); 