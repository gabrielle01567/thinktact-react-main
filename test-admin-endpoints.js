// Test script for admin endpoints
const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testAdminEndpoints() {
  console.log('🔍 Testing Admin Endpoints');
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    // Test 1: Get all users
    console.log('\n🔍 Test 1: GET /api/admin/users');
    const usersResponse = await fetch(`${BACKEND_URL}/admin/users`);
    console.log('Users endpoint status:', usersResponse.status);
    
    const usersText = await usersResponse.text();
    console.log('Users response (first 200 chars):', usersText.substring(0, 200));
    
    if (usersResponse.ok) {
      try {
        const usersData = JSON.parse(usersText);
        console.log('✅ Users endpoint working:', usersData);
      } catch (parseError) {
        console.log('❌ Users response is not JSON:', parseError.message);
      }
    } else {
      console.log('❌ Users endpoint failed');
    }
    
    // Test 2: Toggle user status
    console.log('\n🔍 Test 2: POST /api/admin/toggle-status');
    const toggleResponse = await fetch(`${BACKEND_URL}/admin/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '39ecf6d4-2f8d-417f-a01b-235ce7ae40c7',
        blocked: false
      })
    });
    
    console.log('Toggle status endpoint status:', toggleResponse.status);
    const toggleText = await toggleResponse.text();
    console.log('Toggle status response (first 200 chars):', toggleText.substring(0, 200));
    
    // Test 3: Check if endpoints exist
    console.log('\n🔍 Test 3: Check endpoint existence');
    const endpoints = [
      '/admin/users',
      '/admin/toggle-status', 
      '/admin/delete-user',
      '/admin/reset-password'
    ];
    
    for (const endpoint of endpoints) {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET'
      });
      console.log(`${endpoint}: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminEndpoints(); 