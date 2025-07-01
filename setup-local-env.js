console.log('🔧 === SETUP LOCAL ENVIRONMENT ===\n');

console.log('📝 To run the Supabase setup automatically, you need to:');
console.log('\n1. Get your Supabase credentials:');
console.log('   - Go to your Supabase dashboard');
console.log('   - Click "Settings" → "API"');
console.log('   - Copy the "Project URL" and "service_role" key');

console.log('\n2. Set environment variables locally:');
console.log('   Option A - Create a .env file in the backend directory:');
console.log('   SUPABASE_URL=https://your-project.supabase.co');
console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

console.log('\n   Option B - Set them in PowerShell:');
console.log('   $env:SUPABASE_URL="https://your-project.supabase.co"');
console.log('   $env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');

console.log('\n3. Then run:');
console.log('   node run-supabase-setup.js');

console.log('\n🔧 ALTERNATIVE - Manual Setup:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Click "SQL Editor" in the left sidebar');
console.log('3. Create a new query');
console.log('4. Copy and paste this SQL:');

const sqlCommands = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);

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
`;

console.log('\n' + sqlCommands);
console.log('\n5. Click "Run" to execute the commands');

console.log('\n✅ After running the SQL, test your backend with:');
console.log('   node test-user-creation.js'); 