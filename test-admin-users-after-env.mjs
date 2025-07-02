import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-50jgrva73-gabrielle-shands-projects.vercel.app';

async function testAdminUsers() {
  console.log('🔍 Testing Admin Users Endpoint After Environment Update');
  console.log('========================================================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/users`);
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response:', JSON.stringify(data, null, 2));
      
      if (data.users && data.users.length > 0) {
        console.log(`✅ SUCCESS: Found ${data.users.length} users!`);
        console.log('👥 Users:');
        data.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name || 'No name'})`);
        });
      } else {
        console.log('⚠️  No users returned (empty array)');
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testAdminUsers(); 