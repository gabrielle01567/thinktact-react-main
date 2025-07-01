console.log('🔧 === SUPABASE DATABASE RECONFIGURATION ===\n');

console.log('📋 This guide will help you reconfigure your Supabase database');
console.log('to work with your custom authentication system.\n');

console.log('🔍 STEP-BY-STEP RECONFIGURATION:\n');

console.log('1️⃣ ACCESS SUPABASE DASHBOARD:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Select your project');
console.log('   - Make sure project is ACTIVE (not paused)\n');

console.log('2️⃣ CLEAN UP EXISTING TABLES (if needed):');
console.log('   - Go to "Table Editor"');
console.log('   - If you see existing tables, you may need to drop them');
console.log('   - Click on each table → "Delete table"');
console.log('   - This ensures a clean slate\n');

console.log('3️⃣ RUN THE CORRECTED SQL SCHEMA:');
console.log('   - Go to "SQL Editor"');
console.log('   - Click "New query"');
console.log('   - Copy and paste the entire SQL below:\n');

console.log('```sql');
console.log('-- Supabase Database Schema for ThinkTact (Fixed for Custom Auth)');
console.log('');
console.log('-- Create users table');
console.log('CREATE TABLE IF NOT EXISTS users (');
console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
console.log('  email VARCHAR(255) UNIQUE NOT NULL,');
console.log('  password_hash VARCHAR(255) NOT NULL,');
console.log('  name VARCHAR(255),');
console.log('  is_verified BOOLEAN DEFAULT FALSE,');
console.log('  is_admin BOOLEAN DEFAULT FALSE,');
console.log('  verification_token VARCHAR(255),');
console.log('  reset_token VARCHAR(255),');
console.log('  reset_token_expires TIMESTAMP WITH TIME ZONE,');
console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
console.log(');');
console.log('');
console.log('-- Create analysis_history table');
console.log('CREATE TABLE IF NOT EXISTS analysis_history (');
console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
console.log('  user_id UUID REFERENCES users(id) ON DELETE CASCADE,');
console.log('  title VARCHAR(255),');
console.log('  content TEXT,');
console.log('  analysis_data JSONB,');
console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
console.log(');');
console.log('');
console.log('-- Create indexes for better performance');
console.log('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
console.log('CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);');
console.log('CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);');
console.log('CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);');
console.log('');
console.log('-- Create function to update updated_at timestamp');
console.log('CREATE OR REPLACE FUNCTION update_updated_at_column()');
console.log('RETURNS TRIGGER AS $$');
console.log('BEGIN');
console.log('    NEW.updated_at = NOW();');
console.log('    RETURN NEW;');
console.log('END;');
console.log('$$ language \'plpgsql\';');
console.log('');
console.log('-- Create trigger to automatically update updated_at');
console.log('CREATE TRIGGER update_users_updated_at');
console.log('  BEFORE UPDATE ON users');
console.log('  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();');
console.log('');
console.log('-- Grant necessary permissions for service role');
console.log('GRANT ALL PRIVILEGES ON TABLE users TO service_role;');
console.log('GRANT ALL PRIVILEGES ON TABLE analysis_history TO service_role;');
console.log('GRANT USAGE ON SCHEMA public TO service_role;');
console.log('```\n');

console.log('4️⃣ VERIFY TABLES WERE CREATED:');
console.log('   - Go to "Table Editor"');
console.log('   - You should see "users" and "analysis_history" tables');
console.log('   - Click on "users" table to see its structure');
console.log('   - Verify all columns are present\n');

console.log('5️⃣ TEST DATABASE CONNECTION:');
console.log('   - Run: node test-user-creation.js');
console.log('   - Should show successful user creation');
console.log('   - If still failing, check credentials\n');

console.log('🔍 TROUBLESHOOTING:\n');

console.log('❌ ISSUE: "Database not configured"');
console.log('   CAUSE: Supabase credentials incorrect or tables missing');
console.log('   SOLUTION:');
console.log('   1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
console.log('   2. Ensure tables exist in Table Editor');
console.log('   3. Check project is active (not paused)\n');

console.log('❌ ISSUE: "Permission denied"');
console.log('   CAUSE: Service role doesn\'t have proper permissions');
console.log('   SOLUTION:');
console.log('   1. Run the GRANT statements in the SQL above');
console.log('   2. Check if RLS is enabled (should be disabled for custom auth)\n');

console.log('❌ ISSUE: "Table does not exist"');
console.log('   CAUSE: Tables not created properly');
console.log('   SOLUTION:');
console.log('   1. Run the SQL schema again');
console.log('   2. Check for any SQL errors in the editor');
console.log('   3. Verify tables appear in Table Editor\n');

console.log('❌ ISSUE: "Connection failed"');
console.log('   CAUSE: Wrong Supabase URL or service role key');
console.log('   SOLUTION:');
console.log('   1. Copy EXACT Project URL (not browser URL)');
console.log('   2. Copy EXACT service_role key (not anon key)');
console.log('   3. Update Vercel environment variables\n');

console.log('🔧 COMMON MISTAKES:\n');

console.log('❌ Using browser URL instead of Project URL:');
console.log('   - Browser shows: https://supabase.co/project/your-project-id');
console.log('   - Need: https://your-project-id.supabase.co\n');

console.log('❌ Using anon key instead of service_role key:');
console.log('   - Anon key is shorter (~100 chars)');
console.log('   - Service role key is longer (~200+ chars)');
console.log('   - Service role key starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('❌ Enabling RLS with custom auth:');
console.log('   - RLS policies use auth.uid() which doesn\'t exist');
console.log('   - Custom auth should not use RLS');
console.log('   - Use service role key for full access\n');

console.log('📞 NEED HELP?');
console.log('If you encounter any errors, please share:');
console.log('- The exact error message from Supabase SQL editor');
console.log('- Whether the tables appear in Table Editor');
console.log('- Your Supabase project URL (without the key)');
console.log('- Whether you\'re using service_role key (not anon)');

console.log('\n💡 TIP: The service_role key gives full database access and bypasses RLS!'); 