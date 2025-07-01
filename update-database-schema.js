import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing blocked column in users table...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBlockedColumn() {
  try {
    console.log('🔍 Testing if blocked column exists...');
    
    // Try to query users with blocked field
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, blocked')
      .limit(3);
    
    if (error) {
      console.error('❌ Error querying users:', error.message);
      
      if (error.message.includes('column "blocked" does not exist')) {
        console.log('\n📋 Manual steps required:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Run this SQL:');
        console.log('   ALTER TABLE users ADD COLUMN blocked BOOLEAN DEFAULT false;');
        console.log('4. Click "Run" to execute');
        console.log('5. Run this script again');
        return;
      }
    } else {
      console.log('✅ Blocked column exists and is working!');
      console.log('Current users:');
      users.forEach(user => {
        console.log(`   ${user.email}: blocked = ${user.blocked}`);
      });
      
      // Test updating a user's blocked status
      if (users.length > 0) {
        console.log('\n🧪 Testing blocked status update...');
        const testUser = users[0];
        const newBlockedStatus = !testUser.blocked;
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ blocked: newBlockedStatus })
          .eq('id', testUser.id);
        
        if (updateError) {
          console.error('❌ Error updating blocked status:', updateError.message);
        } else {
          console.log(`✅ Successfully updated ${testUser.email} blocked status to ${newBlockedStatus}`);
          
          // Revert the change
          const { error: revertError } = await supabase
            .from('users')
            .update({ blocked: testUser.blocked })
            .eq('id', testUser.id);
          
          if (revertError) {
            console.error('❌ Error reverting blocked status:', revertError.message);
          } else {
            console.log(`✅ Reverted ${testUser.email} blocked status back to ${testUser.blocked}`);
          }
        }
      }
    }
    
    console.log('\n🎉 Database schema test completed!');
    
  } catch (error) {
    console.error('❌ Error testing database schema:', error.message);
  }
}

testBlockedColumn(); 