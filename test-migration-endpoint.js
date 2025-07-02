import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-lw86jv6tt-gabrielle-shands-projects.vercel.app';

async function testMigrationEndpoint() {
  console.log('🔧 Testing Migration Endpoint');
  console.log('=============================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/migrate-security-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Migration successful!');
        if (data.users && data.users.length > 0) {
          console.log(`📋 Found ${data.users.length} users with security fields`);
        }
      } else {
        console.log('❌ Migration failed:', data.error);
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error Response:', errorData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testMigrationEndpoint(); 