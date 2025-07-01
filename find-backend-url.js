// Script to find the correct backend URL
const possibleBackendUrls = [
  'https://thinktact.ai/api',
  'https://api.thinktact.ai',
  'https://backend.thinktact.ai',
  'https://thinktact-backend.vercel.app',
  'https://thinktact-api.vercel.app',
  'https://backend-7vievbgfv-gabrielle-shands-projects.vercel.app/api'
];

async function testBackendUrl(url) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(`${url}/health`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        if (data.status === 'ok') {
          console.log('✅ Found working backend!');
          console.log('Response:', data);
          return true;
        }
      } catch (e) {
        console.log('❌ Not a JSON API response (likely frontend HTML)');
      }
    } else {
      console.log('❌ Endpoint not found or error');
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function findBackendUrl() {
  console.log('🔍 Searching for the correct backend URL...');
  
  for (const url of possibleBackendUrls) {
    const isWorking = await testBackendUrl(url);
    if (isWorking) {
      console.log(`\n🎉 Found working backend at: ${url}`);
      console.log('\nTo fix the frontend, update the backend URL in:');
      console.log('1. src/services/authService.js');
      console.log('2. src/services/analysisService.js');
      console.log('3. Or set VITE_BACKEND_URL environment variable');
      return url;
    }
  }
  
  console.log('\n❌ No working backend found among the tested URLs.');
  console.log('\nPossible solutions:');
  console.log('1. Deploy the backend separately');
  console.log('2. Check if the backend is deployed at a different URL');
  console.log('3. Deploy the backend to a subdomain like api.thinktact.ai');
}

findBackendUrl(); 