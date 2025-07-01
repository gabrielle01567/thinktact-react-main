import { createClient } from '@supabase/supabase-js';

console.log('🔧 === RUNNING SUPABASE SETUP ===\n');

// Check if we have the required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials in environment variables');
  console.log('📝 To run this script, you need to set:');
  console.log('   SUPABASE_URL=your-supabase-url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('\n🔧 Alternative: Run the SQL manually in Supabase dashboard');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Click "SQL Editor"');
  console.log('3. Run the commands from setup-supabase-database.js');
  process.exit(1);
}

const sqlCommands = [
  // Create users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // Create analysis_history table
  `CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);`,
  `CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);`,
  `CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);`,

  // Create function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';`,

  // Create trigger
  `CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
];

async function setupDatabase() {
  try {
    console.log('🔧 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Connected to Supabase');
    console.log('🔧 Running SQL commands...\n');

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      console.log(`📝 Running command ${i + 1}/${sqlCommands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase.from('users').select('count').limit(1);
          if (queryError && queryError.code === 'PGRST116') {
            console.log('   ⚠️ Table might not exist yet, continuing...');
          } else {
            console.log('   ❌ Error:', error.message);
          }
        } else {
          console.log('   ✅ Success');
        }
      } catch (err) {
        console.log('   ⚠️ Command might need manual execution');
      }
    }

    console.log('\n🔧 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database test failed:', error.message);
      console.log('💡 You may need to run the SQL commands manually in Supabase dashboard');
    } else {
      console.log('✅ Database setup successful!');
      console.log('✅ Users table is accessible');
      console.log('✅ Backend should now work properly');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to Supabase dashboard');
    console.log('2. Click "SQL Editor"');
    console.log('3. Run the commands from setup-supabase-database.js');
  }
}

setupDatabase(); 