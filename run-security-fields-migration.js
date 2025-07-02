import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.error('SUPABASE_SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔧 Running security fields migration...');
    
    // Read the SQL migration file
    const sqlMigration = fs.readFileSync('./add-security-fields.sql', 'utf8');
    console.log('📄 SQL Migration:');
    console.log(sqlMigration);
    
    // Execute the migration using Supabase's rpc function
    // Note: We'll use a direct query approach since rpc might not be available
    console.log('🚀 Executing migration...');
    
    // First, let's check if the columns already exist
    const { data: existingColumns, error: checkError } = await supabase
      .from('users')
      .select('security_question, security_answer')
      .limit(1);
    
    if (checkError && checkError.message.includes('column "security_question" does not exist')) {
      console.log('⚠️ Security columns do not exist, adding them...');
      
      // Since we can't run ALTER TABLE directly through the client,
      // we'll need to run this in the Supabase SQL editor
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log('');
      console.log('```sql');
      console.log(sqlMigration);
      console.log('```');
      console.log('');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/sql');
      console.log('');
      
    } else {
      console.log('✅ Security columns already exist!');
      console.log('📊 Sample data:', existingColumns);
    }
    
    // Test the getAllUsers function after migration
    console.log('🧪 Testing getAllUsers function...');
    const { getAllUsers } = await import('./backend/api/supabase-service.js');
    const users = await getAllUsers();
    
    console.log(`✅ getAllUsers returned ${users.length} users`);
    if (users.length > 0) {
      console.log('📋 Sample user with security fields:');
      const sampleUser = users[0];
      console.log({
        email: sampleUser.email,
        securityQuestion: sampleUser.securityQuestion,
        securityAnswer: sampleUser.securityAnswer ? '***HIDDEN***' : null
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 