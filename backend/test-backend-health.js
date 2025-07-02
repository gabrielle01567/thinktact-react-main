import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-kktt055xn-gabrielle-shands-projects.vercel.app';

async function testBackendHealth() {
  console.log('🔍 Testing Backend Health');
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
    
    // Test health endpoint
    console.log('\n📊 Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log('Health Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health Response:', healthData);
    }
    
    // Test admin users endpoint
    console.log('\n📊 Testing admin users endpoint...');
    const usersResponse = await fetch(`${BACKEND_URL}/api/admin/users`);
    console.log('Users Status:', usersResponse.status);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users Response:', usersData);
    }
    
    // Test migration endpoint
    console.log('\n📊 Testing migration endpoint...');
    const migrationResponse = await fetch(`${BACKEND_URL}/api/migrate-security-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Migration Status:', migrationResponse.status);
    if (migrationResponse.ok) {
      const migrationData = await migrationResponse.json();
      console.log('Migration Response:', migrationData);
    } else {
      const errorData = await migrationResponse.text();
      console.log('Migration Error:', errorData.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testBackendHealth(); 