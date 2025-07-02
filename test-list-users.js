const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Listing All Users in Supabase DB');
console.log('====================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function listAllUsers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`📥 Raw Response: ${text}`);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON Response:', JSON.stringify(data, null, 2));
      if (data.success && data.users) {
        console.log(`👥 Found ${data.users.length} users:`);
        data.users.forEach((user, idx) => {
          console.log(`  ${idx + 1}. ${user.email} | Verified: ${user.is_verified} | Admin: ${user.is_admin} | Blocked: ${user.blocked}`);
        });
      } else {
        console.log('❌ Failed to fetch users:', data.error);
      }
    } catch (parseError) {
      console.log('⚠️ Response is not JSON');
      console.log('Parse error:', parseError.message);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('Error stack:', error.stack);
  }
}

listAllUsers(); 