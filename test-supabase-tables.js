import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase database access...');
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Service Role Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseAccess() {
  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test 1: Check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check if tables exist and are accessible
    console.log('\n📋 Checking table access...');
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users table access failed:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log(`   Found ${usersData.length} users`);
      if (usersData.length > 0) {
        console.log('   Sample user:', {
          id: usersData[0].id,
          email: usersData[0].email,
          is_verified: usersData[0].is_verified,
          is_admin: usersData[0].is_admin
        });
      }
    }
    
    // Test analysis_history table
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(5);
    
    if (analysisError) {
      console.error('❌ Analysis history table access failed:', analysisError.message);
    } else {
      console.log('✅ Analysis history table accessible');
      console.log(`   Found ${analysisData.length} analysis records`);
    }
    
    // Test 3: Check table structure
    console.log('\n🏗️  Checking table structure...');
    // Users table structure
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    if (sampleUser && sampleUser.length > 0) {
      console.log('✅ Users table structure:');
      Object.keys(sampleUser[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleUser[0][key]}`);
      });
    } else {
      console.log('ℹ️  Users table is empty, cannot infer structure from data.');
    }
    // Analysis history table structure
    const { data: sampleAnalysis } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(1);
    if (sampleAnalysis && sampleAnalysis.length > 0) {
      console.log('✅ Analysis history table structure:');
      Object.keys(sampleAnalysis[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleAnalysis[0][key]}`);
      });
    } else {
      console.log('ℹ️  Analysis history table is empty, cannot infer structure from data.');
    }
    
    // Test 4: Try to insert a test record (then delete it)
    console.log('\n🧪 Testing write access...');
    
    const testUser = {
      email: 'test-access@example.com',
      password_hash: 'test-hash',
      is_verified: false,
      is_admin: false,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('❌ Write access failed:', insertError.message);
    } else {
      console.log('✅ Write access successful');
      console.log('   Inserted test user with ID:', insertData[0].id);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('⚠️  Could not delete test record:', deleteError.message);
      } else {
        console.log('✅ Delete access successful');
      }
    }
    
    console.log('\n🎉 Database access test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDatabaseAccess(); 