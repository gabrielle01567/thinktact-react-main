console.log('🔧 === DATABASE CONFIGURATION GUIDE ===\n');

console.log('📋 Your backend is showing "Database not configured"');
console.log('This means the Supabase credentials are incorrect.\n');

console.log('🔍 STEP-BY-STEP CONFIGURATION:\n');

console.log('1️⃣ VERIFY SUPABASE PROJECT:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Make sure your project is ACTIVE (not paused)');
console.log('   - If paused, click "Resume" to activate it\n');

console.log('2️⃣ GET CORRECT CREDENTIALS:');
console.log('   - Click "Settings" → "API"');
console.log('   - Look for these EXACT values:\n');

console.log('📝 PROJECT URL:');
console.log('   ✅ CORRECT: https://your-project-id.supabase.co');
console.log('   ❌ WRONG: https://supabase.co/project/your-project-id');
console.log('   ❌ WRONG: https://app.supabase.com/project/your-project-id\n');

console.log('🔑 SERVICE ROLE KEY:');
console.log('   ✅ CORRECT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (200+ chars)');
console.log('   ❌ WRONG: Using the "anon" key (shorter)\n');

console.log('3️⃣ UPDATE VERCEL ENVIRONMENT VARIABLES:');
console.log('   - Go to Vercel Dashboard → Backend Project');
console.log('   - Click "Settings" → "Environment Variables"');
console.log('   - Update these variables:\n');

console.log('   SUPABASE_URL = https://your-project-id.supabase.co');
console.log('   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('4️⃣ VERIFY USERS TABLE EXISTS:');
console.log('   - Go to Supabase Dashboard → Table Editor');
console.log('   - Look for "users" table');
console.log('   - If missing, run the SQL setup script\n');

console.log('🔧 QUICK SQL SETUP (if needed):');
console.log('   Go to Supabase SQL Editor and run:\n');

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
console.log('```\n');

console.log('5️⃣ REDEPLOY BACKEND:');
console.log('   - After updating environment variables');
console.log('   - Vercel will automatically redeploy');
console.log('   - Wait 2-3 minutes for deployment to complete\n');

console.log('6️⃣ TEST CONNECTION:');
console.log('   - Run: node test-user-creation.js');
console.log('   - Should show successful user creation\n');

console.log('🔍 COMMON MISTAKES:');
console.log('❌ Copying browser URL instead of Project URL');
console.log('❌ Using anon key instead of service_role key');
console.log('❌ Copying from wrong project');
console.log('❌ Project is paused or inactive');
console.log('❌ Users table doesn\'t exist\n');

console.log('📞 NEED HELP?');
console.log('If you\'re still stuck, please share:');
console.log('- Your Supabase project URL (without the key)');
console.log('- Whether you\'re using service_role key (not anon)');
console.log('- Whether the project is active or paused');
console.log('- Whether the users table exists');

console.log('\n💡 TIP: The service_role key is much longer and gives full database access!');