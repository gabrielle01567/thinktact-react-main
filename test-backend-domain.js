import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

async function testBackendDomain() {
  console.log('🔍 Testing Backend Domain');
  console.log('=========================');
  
  try {
    // Test root endpoint
    console.log('📊 Testing root endpoint...');
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    console.log('Root Status:', rootResponse.status);
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('Root Response:', rootData);
    }
    
    // Test admin users endpoint
    console.log('\n📊 Testing admin users endpoint...');
    const usersResponse = await fetch(`${BACKEND_URL}/api/admin/users`);
    console.log('Users Status:', usersResponse.status);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users Response:', usersData);
    } else {
      const errorData = await usersResponse.text();
      console.log('❌ Users Error:', errorData.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testBackendDomain(); 