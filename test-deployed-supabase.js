const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testDeployedSupabase() {
  console.log('🔍 Testing Deployed Supabase Connection');
  console.log('=====================================');
  
  try {
    // Test health endpoint
    console.log('📡 Testing health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('📊 Health response:', JSON.stringify(healthData, null, 2));
    
    // Test Supabase connection
    console.log('📡 Testing Supabase connection...');
    const supabaseResponse = await fetch(`${BACKEND_URL}/test-supabase`);
    const supabaseData = await supabaseResponse.json();
    console.log('📊 Supabase response:', JSON.stringify(supabaseData, null, 2));
    
    // Test Supabase service
    console.log('📡 Testing Supabase service...');
    const serviceResponse = await fetch(`${BACKEND_URL}/test-supabase-service`);
    const serviceData = await serviceResponse.json();
    console.log('📊 Service response:', JSON.stringify(serviceData, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing deployed Supabase:', error);
  }
}

testDeployedSupabase(); 