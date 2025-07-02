import fetch from 'node-fetch';
const BACKEND_URL = 'https://backendv2-e825z82x9-gabrielle-shands-projects.vercel.app/api';

async function testBackendV2Users() {
  console.log('🔍 Testing Backend v2 /api/admin/users endpoint');
  try {
    const response = await fetch(`${BACKEND_URL}/admin/users`);
    const data = await response.json();
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    if (data.users && Array.isArray(data.users)) {
      console.log(`✅ Success! Found ${data.users.length} users.`);
    } else {
      console.log('⚠️ No users array in response or unexpected format.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBackendV2Users(); 