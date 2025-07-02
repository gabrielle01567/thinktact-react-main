const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Backend Health');
console.log('=========================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testBackendHealth() {
  try {
    console.log('🧪 Testing backend health endpoint...');
    
    const response = await fetch(`${BACKEND_URL}/health`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON Response:', data);
      
      if (data.status === 'ok') {
        console.log('🎉 Backend is healthy!');
        console.log('📊 Environment:', data.environment);
        console.log('🔧 Supabase URL:', data.supabaseUrl ? 'Set' : 'Not set');
        console.log('🔑 Supabase Key:', data.supabaseKey ? 'Set' : 'Not set');
        console.log('🔐 JWT Secret:', data.jwtSecret ? 'Set' : 'Not set');
        console.log('📧 Resend Key:', data.resendKey ? 'Set' : 'Not set');
      } else {
        console.log('❌ Backend health check failed');
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testBackendHealth(); 