import fetch from 'node-fetch';
const BACKEND_URL = 'https://backendv2-e825z82x9-gabrielle-shands-projects.vercel.app';

async function testBackendV2Endpoints() {
  console.log('🔍 Testing Backend v2 Endpoints');
  console.log('================================');
  
  // Test 1: Root endpoint
  console.log('\n📡 Testing root endpoint...');
  try {
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    console.log(`📊 Root Status: ${rootResponse.status}`);
    
    if (rootResponse.ok) {
      const rootData = await rootResponse.text();
      console.log('📥 Root Response:', rootData.substring(0, 200) + '...');
    } else {
      console.log('❌ Root endpoint failed');
    }
  } catch (error) {
    console.error('❌ Root endpoint error:', error.message);
  }
  
  // Test 2: Admin users endpoint
  console.log('\n📡 Testing /api/admin/users endpoint...');
  try {
    const usersResponse = await fetch(`${BACKEND_URL}/api/admin/users`);
    console.log(`📊 Users Status: ${usersResponse.status}`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('📥 Users Response:', JSON.stringify(usersData, null, 2));
      if (usersData.users && Array.isArray(usersData.users)) {
        console.log(`✅ Success! Found ${usersData.users.length} users.`);
      } else {
        console.log('⚠️ No users array in response or unexpected format.');
      }
    } else {
      const errorText = await usersResponse.text();
      console.log('❌ Users endpoint failed:', errorText.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Users endpoint error:', error.message);
  }
  
  // Test 3: Test endpoint
  console.log('\n📡 Testing /api/test endpoint...');
  try {
    const testResponse = await fetch(`${BACKEND_URL}/api/test`);
    console.log(`📊 Test Status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('📥 Test Response:', JSON.stringify(testData, null, 2));
    } else {
      console.log('❌ Test endpoint failed');
    }
  } catch (error) {
    console.error('❌ Test endpoint error:', error.message);
  }
}

testBackendV2Endpoints(); 