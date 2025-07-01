import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Configuration and Database Access');
console.log('==================================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `Set (${supabaseServiceKey.substring(0, 20)}...)` : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing required environment variables');
  console.log('\nTo fix this:');
  console.log('1. Set SUPABASE_URL to your Supabase project URL');
  console.log('2. Set SUPABASE_SERVICE_ROLE_KEY to your service role key');
  console.log('3. Get these from your Supabase dashboard → Settings → API');
  process.exit(1);
}

// Create Supabase client
console.log('\n🔧 Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseConfig() {
  try {
    // Test 1: Basic connection
    console.log('\n🔍 Test 1: Basic Connection');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      console.error('Error code:', connectionError.code);
      console.error('Error details:', connectionError.details);
      return;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Check table structure
    console.log('\n🔍 Test 2: Table Structure');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table access failed:', usersError.message);
      console.error('Error code:', usersError.code);
    } else {
      console.log('✅ Users table accessible');
      if (usersData && usersData.length > 0) {
        console.log('Table columns:', Object.keys(usersData[0]));
      } else {
        console.log('Table is empty, checking schema...');
        // Try to get schema info
        const { data: schemaTest, error: schemaError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' })
          .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
        
        if (schemaError) {
          console.log('ℹ️ Could not get schema via RPC, table structure unknown');
        } else {
          console.log('Table schema:', schemaTest);
        }
      }
    }

    // Test 3: Check analysis_history table
    console.log('\n🔍 Test 3: Analysis History Table');
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(1);
    
    if (analysisError) {
      console.error('❌ Analysis history table access failed:', analysisError.message);
      console.error('Error code:', analysisError.code);
    } else {
      console.log('✅ Analysis history table accessible');
      if (analysisData && analysisData.length > 0) {
        console.log('Table columns:', Object.keys(analysisData[0]));
      }
    }

    // Test 4: Test write permissions
    console.log('\n🔍 Test 4: Write Permissions');
    const testUser = {
      email: 'test-write-permission@example.com',
      password_hash: 'test-hash',
      name: 'Test User',
      is_verified: false,
      is_admin: false,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Write permission failed:', insertError.message);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      
      // Check specific error types
      if (insertError.code === '42501') {
        console.error('🔍 This is a permission error - check RLS policies');
      } else if (insertError.code === '42P01') {
        console.error('🔍 Table does not exist - check database schema');
      } else if (insertError.code === '23505') {
        console.error('🔍 Unique constraint violation - test user already exists');
      }
    } else {
      console.log('✅ Write permission successful');
      console.log('Inserted test user with ID:', insertData[0].id);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('⚠️ Could not delete test record:', deleteError.message);
      } else {
        console.log('✅ Delete permission successful');
      }
    }

    // Test 5: Check RLS policies
    console.log('\n🔍 Test 5: RLS Policy Check');
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('get_rls_policies', { table_name: 'users' })
        .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));
      
      if (rlsError) {
        console.log('ℹ️ Could not check RLS policies via RPC');
        console.log('Manual check needed: Go to Supabase Dashboard → Authentication → Policies');
      } else {
        console.log('RLS Policies:', rlsData);
      }
    } catch (error) {
      console.log('ℹ️ RLS policy check not available');
    }

    // Test 6: Check service role permissions
    console.log('\n🔍 Test 6: Service Role Permissions');
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_current_user')
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));
    
    if (roleError) {
      console.log('ℹ️ Could not check current user role via RPC');
      console.log('Service role should bypass RLS policies');
    } else {
      console.log('Current user role:', roleData);
    }

    console.log('\n🎉 Supabase configuration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testSupabaseConfig(); 