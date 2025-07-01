console.log('🔧 === RECONFIGURING DATABASE ===\n');

console.log('📋 STEP-BY-STEP DATABASE RECONFIGURATION\n');

console.log('🔧 STEP 1: Verify Supabase Project Status');
console.log('1. Go to your Supabase dashboard');
console.log('2. Check if your project is active (not paused)');
console.log('3. Note your Project ID from the URL');

console.log('\n🔧 STEP 2: Get Correct Credentials');
console.log('1. Go to Settings → API');
console.log('2. Copy the EXACT values:');
console.log('   - Project URL (should be: https://project-id.supabase.co)');
console.log('   - service_role key (NOT anon key)');

console.log('\n🔧 STEP 3: Update Vercel Environment Variables');
console.log('1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables');
console.log('2. Update these variables:');
console.log('   SUPABASE_URL = https://your-project-id.supabase.co');
console.log('   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   JWT_SECRET = 6e0a4def019436c8918e02374466c81d459fb2d5bc316a4bdcee4d6516f809982cdffdbc300a02f085fdcf6f712ceb77a118ed382fd2cf81b49d0ac862a45f8b');
console.log('   RESEND_API_KEY = re_xxxxxxxxxx');

console.log('\n🔧 STEP 4: Recreate Database Tables');
console.log('1. Go to Supabase Dashboard → SQL Editor');
console.log('2. Run this SQL to drop and recreate tables:');

const recreateSQL = `
-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS analysis_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create users table
CREATE TABLE users (
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
);

-- Create analysis_history table
CREATE TABLE analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);

-- Create function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test insert
INSERT INTO users (email, password_hash, name, is_verified, is_admin) 
VALUES ('test@example.com', '$2a$10$test', 'Test User', true, false)
ON CONFLICT (email) DO NOTHING;
`;

console.log('\n' + recreateSQL);

console.log('\n🔧 STEP 5: Redeploy Backend');
console.log('1. After updating environment variables, redeploy your backend');
console.log('2. Go to Vercel Dashboard → Deployments → Redeploy');

console.log('\n🔧 STEP 6: Test Connection');
console.log('1. After redeployment, run: node test-user-creation.js');
console.log('2. Check if user creation works');

console.log('\n🔧 STEP 7: Verify Database Connection');
console.log('1. Go to Supabase Dashboard → Table Editor');
console.log('2. Check if users table exists and is accessible');
console.log('3. Try inserting a test record manually');

console.log('\n⚠️ COMMON ISSUES TO CHECK:');
console.log('1. Using anon key instead of service_role key');
console.log('2. Wrong project URL format');
console.log('3. Project is paused or inactive');
console.log('4. Network connectivity issues');
console.log('5. Environment variables not saved properly');

console.log('\n🔍 DEBUGGING STEPS:');
console.log('1. Check Vercel deployment logs for errors');
console.log('2. Verify environment variables are set correctly');
console.log('3. Test Supabase connection manually');
console.log('4. Check if tables exist in Supabase');

console.log('\n✅ After completing all steps, your database should be properly configured!'); 