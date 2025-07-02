import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-9hlsgmm1e-gabrielle-shands-projects.vercel.app';

async function testDebugConfig() {
  console.log('🔍 Testing Debug Supabase Config Endpoint');
  console.log('==========================================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/debug-supabase-config`);
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response:', JSON.stringify(data, null, 2));
      
      if (data.config) {
        console.log('\n🔧 Supabase Configuration:');
        console.log(`  URL: ${data.config.supabaseUrl}`);
        console.log(`  Key: ${data.config.supabaseKey}`);
        console.log(`  Has Error: ${data.config.hasError}`);
        console.log(`  Users Count: ${data.config.usersCount}`);
        if (data.config.error) {
          console.log(`  Error: ${data.config.error}`);
        }
        if (data.config.users && data.config.users.length > 0) {
          console.log('\n👥 Users Found:');
          data.config.users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.name || 'No name'})`);
          });
        }
        
        if (data.config.allColumnsTest) {
          console.log('\n📋 All Columns Test:');
          console.log(`  Error: ${data.config.allColumnsTest.error || 'None'}`);
          if (data.config.allColumnsTest.data && data.config.allColumnsTest.data.length > 0) {
            console.log('  Sample User Data:');
            console.log('    Columns:', Object.keys(data.config.allColumnsTest.data[0]));
            console.log('    Data:', JSON.stringify(data.config.allColumnsTest.data[0], null, 4));
          }
        }
        
        if (data.config.exactQueryTest) {
          console.log('\n🎯 Exact Query Test:');
          console.log(`  Error: ${data.config.exactQueryTest.error || 'None'}`);
          if (data.config.exactQueryTest.data && data.config.exactQueryTest.data.length > 0) {
            console.log(`  Found ${data.config.exactQueryTest.data.length} users with exact query`);
            data.config.exactQueryTest.data.forEach((user, index) => {
              console.log(`    ${index + 1}. ${user.email} (${user.name || 'No name'})`);
            });
          } else {
            console.log('  No users found with exact query');
          }
        }
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testDebugConfig(); 