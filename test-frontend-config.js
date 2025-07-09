// This simulates what the frontend would see
const VITE_BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://backendv2-ruddy.vercel.app/api';

console.log('🔍 Frontend Configuration Test');
console.log('Environment variable VITE_BACKEND_URL:', process.env.VITE_BACKEND_URL);
console.log('Final API_BASE_URL:', VITE_BACKEND_URL);

// Test if the URL is accessible
async function testBackendAccess() {
  try {
    console.log('\n📋 Testing backend access...');
    const response = await fetch(VITE_BACKEND_URL.replace('/api', ''));
    
    console.log('Backend health check status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is accessible:', data);
    } else {
      console.log('❌ Backend health check failed');
    }
  } catch (error) {
    console.error('❌ Error accessing backend:', error.message);
  }
}

testBackendAccess(); 