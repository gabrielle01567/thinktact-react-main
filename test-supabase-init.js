// Test Supabase initialization
import { createClient } from '@supabase/supabase-js';

console.log('🧪 === SUPABASE INITIALIZATION TEST ===\n');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');

if (supabaseUrl) {
  console.log('SUPABASE_URL length:', supabaseUrl.length);
  console.log('SUPABASE_URL starts with:', supabaseUrl.substring(0, 20) + '...');
}

if (supabaseServiceKey) {
  console.log('SUPABASE_SERVICE_ROLE_KEY length:', supabaseServiceKey.length);
  console.log('SUPABASE_SERVICE_ROLE_KEY starts with:', supabaseServiceKey.substring(0, 20) + '...');
}

// Try to create client
try {
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created successfully');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase query error:', error);
    } else {
      console.log('✅ Supabase query successful');
    }
  } else {
    console.log('❌ Missing environment variables');
  }
} catch (error) {
  console.log('❌ Error creating Supabase client:', error);
}

const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testSupabaseInit() {
  console.log('🔍 Testing Supabase Initialization');
  console.log('==================================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // Test the health endpoint which should show Supabase status
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log(`📊 Health Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health Response:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ Health check failed');
      const errorText = await healthResponse.text();
      console.log('Error:', errorText);
    }

    // Test a simple database operation
    console.log('\n🧪 Testing database operation...');
    const testResponse = await fetch(`${BACKEND_URL}/test`);
    console.log(`📊 Test Status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test Response:', JSON.stringify(testData, null, 2));
    } else {
      console.log('❌ Test failed');
      const errorText = await testResponse.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing Supabase initialization:', error);
  }
}

testSupabaseInit(); 