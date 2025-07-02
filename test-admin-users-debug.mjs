import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-irsttgkhs-gabrielle-shands-projects.vercel.app';

async function testAdminUsersDebug() {
  console.log('🔍 Testing Admin Users Endpoint with Debug Output');
  console.log('================================================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/users`);
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response:', JSON.stringify(data, null, 2));
      
      if (data.users && data.users.length > 0) {
        console.log(`✅ SUCCESS: Found ${data.users.length} users!`);
        console.log('\n👥 Users:');
        data.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name || 'No name'})`);
          console.log(`     Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
          console.log(`     Verified: ${user.verified ? 'Yes' : 'No'}`);
          console.log(`     Blocked: ${user.blocked ? 'Yes' : 'No'}`);
          console.log(`     Created: ${user.createdAt}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No users returned (empty array)');
        console.log('🔍 Check the Vercel logs for debug output from getAllUsers function');
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testAdminUsersDebug(); 