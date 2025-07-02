import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('🔧 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔍 Checking if last_login column exists...');
    
    // First, let's check if the column exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('last_login')
      .limit(1);
    
    if (testError && testError.message.includes('column "last_login" does not exist')) {
      console.log('⚠️ last_login column does not exist, adding it...');
      
      // Since we can't run DDL directly through the client, we'll need to do this manually
      console.log('📝 Please run the following SQL in your Supabase SQL editor:');
      console.log('');
      console.log('ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;');
      console.log('');
      console.log('After running the SQL, restart this script to verify the column was added.');
      
    } else if (testError) {
      console.error('❌ Error checking column:', testError);
      process.exit(1);
    } else {
      console.log('✅ last_login column already exists!');
      console.log('📊 Test data:', testData);
    }
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 