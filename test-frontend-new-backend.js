// Test script to simulate exact frontend API call to new backend
const NEW_BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testFrontendNewBackend() {
  console.log('🔍 Testing Frontend → New Backend Connection');
  console.log('Backend URL:', NEW_BACKEND_URL);
  
  try {
    // Simulate exact frontend login call
    console.log('\n🔍 Simulating frontend login call...');
    const loginResponse = await fetch(`${NEW_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Response status:', loginResponse.status);
    console.log('Response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    // Get the raw response text
    const responseText = await loginResponse.text();
    console.log('Raw response length:', responseText.length);
    console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
    
    // Try to parse as JSON
    if (responseText.trim()) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ Parsed JSON successfully:', jsonData);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
        console.log('Response is not valid JSON - likely HTML or empty');
      }
    } else {
      console.log('❌ Response is empty');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testFrontendNewBackend(); 