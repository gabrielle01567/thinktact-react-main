import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-rfb7jhhtc-gabrielle-shands-projects.vercel.app';

async function testTableStructure() {
  console.log('🔍 Testing Supabase Table Structure');
  console.log('===================================');
  
  try {
    // Test the existing debug endpoint first
    const debugResponse = await fetch(`${BACKEND_URL}/api/debug-supabase-config`);
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Backend is connected to Supabase');
      console.log(`📊 Project URL: ${debugData.config.supabaseUrl}`);
      
      // Now let's test a direct query to see what's in the users table
      console.log('\n🔍 Testing direct users table query...');
      
      // We'll use the test-supabase endpoint to see if we can get more details
      const testResponse = await fetch(`${BACKEND_URL}/test-supabase`);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('📥 Test Response:', JSON.stringify(testData, null, 2));
      } else {
        const errorData = await testResponse.text();
        console.log('❌ Test Error:', errorData.substring(0, 200) + '...');
      }
      
    } else {
      console.log('❌ Debug endpoint failed');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testTableStructure(); 