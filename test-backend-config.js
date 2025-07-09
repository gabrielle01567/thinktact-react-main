async function testBackendConfig() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing backend configuration...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test the debug endpoint to see Supabase config
    console.log('\n📋 Test 1: Checking backend Supabase configuration...');
    const configResponse = await fetch(`${backendUrl}/debug-supabase-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Config endpoint status:', configResponse.status);
    
    if (configResponse.ok) {
      const data = await configResponse.json();
      console.log('✅ Backend config:', data);
    } else {
      const errorText = await configResponse.text();
      console.log('❌ Config endpoint error:', errorText);
    }
    
    // Test 2: Check if we can connect to the database
    console.log('\n📋 Test 2: Testing database connection...');
    const testResponse = await fetch(`${backendUrl}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Test endpoint status:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Test response:', data);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Test endpoint error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend config:', error.message);
  }
}

testBackendConfig(); 