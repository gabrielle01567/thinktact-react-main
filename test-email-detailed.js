// Detailed test to check Resend API key and email sending
const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testEmailDetailed() {
  console.log('🔧 Testing email configuration in detail');
  
  try {
    // Test the health endpoint to see all environment variables
    const healthResponse = await fetch(`${BACKEND_URL.replace('/api', '')}/health`);
    
    console.log('📡 Health endpoint status:', healthResponse.status);
    
    const healthResult = await healthResponse.json();
    console.log('📄 Health response:', healthResult);
    
    // Check if RESEND_API_KEY is mentioned in the health response
    if (healthResult.resendKey !== undefined) {
      console.log('🔑 RESEND_API_KEY status from health:', healthResult.resendKey ? 'SET' : 'NOT SET');
    }
    
  } catch (error) {
    console.error('❌ Health endpoint error:', error.message);
  }
}

// Test the request-reset endpoint with detailed error logging
async function testRequestResetDetailed() {
  console.log('\n🔧 Testing request-reset with detailed logging');
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        securityAnswer: 'Fluffy'
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📄 Full response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Request reset successful!');
    } else {
      console.log('❌ Request reset failed:', result.error);
      if (result.details) {
        console.log('📋 Error details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Test if we can access the backend logs
async function testBackendLogs() {
  console.log('\n🔧 Testing if we can access backend logs');
  
  try {
    // Try to access a test endpoint that might show logs
    const response = await fetch(`${BACKEND_URL}/test-supabase`);
    
    console.log('📡 Test-supabase status:', response.status);
    
    const result = await response.json();
    console.log('📄 Test-supabase response:', result);
    
  } catch (error) {
    console.error('❌ Test-supabase error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testEmailDetailed();
  await testRequestResetDetailed();
  await testBackendLogs();
}

runAllTests(); 