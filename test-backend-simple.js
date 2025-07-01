// Simple backend test
const backendUrl = 'https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api';

async function testBackendSimple() {
  console.log('🧪 === SIMPLE BACKEND TEST ===\n');
  
  try {
    // Test registration with detailed logging
    console.log('📝 Test: User Registration');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    console.log(`   Registering: ${testEmail}`);
    
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
        isVerified: true,
        isAdmin: false
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`   Full Response: ${responseText}`);
    
    try {
      const data = JSON.parse(responseText);
      console.log(`   Parsed Data:`, data);
    } catch (e) {
      console.log(`   Not JSON: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBackendSimple(); 