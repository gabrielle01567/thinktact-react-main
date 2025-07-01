// Debug script to test different backend URL combinations
const possibleBackendUrls = [
  'https://backendv2-ruddy.vercel.app',
  'https://backendv2-ruddy.vercel.app/api',
  'https://backendv2-ruddy.vercel.app/api/auth',
  'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app/api'
];

async function debugLoginError() {
  console.log('🔍 Debugging Login Error - Testing Different URLs');
  
  for (const baseUrl of possibleBackendUrls) {
    console.log(`\n🔍 Testing: ${baseUrl}/auth/login`);
    
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
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
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('✅ SUCCESS - This URL works!');
        console.log('Response:', data);
        console.log(`\n🎯 Use this URL in your VITE_BACKEND_URL: ${baseUrl}`);
        return baseUrl;
      } else if (response.status === 404) {
        console.log('❌ NOT FOUND - Endpoint doesn\'t exist');
      } else {
        const text = await response.text();
        console.log(`❌ Error ${response.status}: ${text.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n❌ No working URL found');
}

debugLoginError(); 