import { createClient } from '@supabase/supabase-js';

console.log('🔧 === SUPABASE DATABASE SETUP ===\n');

// This script will help you set up your Supabase database
// You'll need to run the SQL commands in your Supabase dashboard

console.log('📋 Follow these steps to create the users table:\n');

console.log('1️⃣ GO TO SUPABASE DASHBOARD:');
console.log('   - Open https://supabase.com/dashboard');
console.log('   - Select your project\n');

console.log('2️⃣ OPEN SQL EDITOR:');
console.log('   - Click "SQL Editor" in the left sidebar');
console.log('   - Click "New query"\n');

console.log('3️⃣ COPY AND PASTE THIS SQL:');
console.log('   (Copy the entire SQL below and paste it in the editor)\n');

console.log('```sql');
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
console.log('```\n');

console.log('4️⃣ RUN THE SQL:');
console.log('   - Click "Run" button in the SQL editor');
console.log('   - Wait for it to complete successfully\n');

console.log('5️⃣ VERIFY TABLES WERE CREATED:');
console.log('   - Go to "Table Editor" in the left sidebar');
console.log('   - You should see "users" and "analysis_history" tables');
console.log('   - Click on "users" table to see its structure\n');

console.log('6️⃣ TEST THE BACKEND:');
console.log('   - Once tables are created, test user registration');
console.log('   - The "Database not configured" error should be gone\n');

console.log('🔍 TROUBLESHOOTING:');
console.log('If you get errors:');
console.log('- Make sure you\'re in the correct Supabase project');
console.log('- Check that you have permission to create tables');
console.log('- Try running the SQL in smaller chunks if needed\n');

console.log('📞 NEED HELP?');
console.log('If you encounter any errors, please share:');
console.log('- The exact error message from Supabase SQL editor');
console.log('- Whether the tables appear in Table Editor');
console.log('- Any other issues you encounter'); 