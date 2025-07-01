console.log('🔍 === SUPABASE SETUP VERIFICATION ===\n');

console.log('📋 Step-by-Step Verification Guide:\n');

console.log('1️⃣ CHECK SUPABASE PROJECT STATUS:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Make sure your project is ACTIVE (not paused)');
console.log('   - If paused, click "Resume" to activate it\n');

console.log('2️⃣ VERIFY PROJECT URL FORMAT:');
console.log('   - Go to Settings → API');
console.log('   - Project URL should be: https://your-project-id.supabase.co');
console.log('   - NOT: https://supabase.co/project/your-project-id');
console.log('   - NOT: https://app.supabase.com/project/your-project-id\n');

console.log('3️⃣ VERIFY SERVICE ROLE KEY:');
console.log('   - In Settings → API, find "service_role" key');
console.log('   - Should start with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   - Should be about 200+ characters long');
console.log('   - NOT the "anon" key (which is shorter)\n');

console.log('4️⃣ CHECK USERS TABLE EXISTS:');
console.log('   - Go to Table Editor in Supabase dashboard');
console.log('   - Look for a "users" table');
console.log('   - If it doesn\'t exist, run the SQL setup script\n');

console.log('5️⃣ VERIFY ENVIRONMENT VARIABLES:');
console.log('   - Go to Vercel Dashboard → Backend Project → Settings → Environment Variables');
console.log('   - Check these exact names:');
console.log('     SUPABASE_URL');
console.log('     SUPABASE_SERVICE_ROLE_KEY');
console.log('     JWT_SECRET');
console.log('     RESEND_API_KEY\n');

console.log('🔧 QUICK FIXES:\n');

console.log('If credentials are wrong:');
console.log('1. Copy EXACT Project URL and service_role key from Supabase');
console.log('2. Update in Vercel environment variables');
console.log('3. Redeploy backend\n');

console.log('If users table missing:');
console.log('1. Go to Supabase SQL Editor');
console.log('2. Run the schema setup script');
console.log('3. Verify table was created\n');

console.log('If project is paused:');
console.log('1. Resume the project in Supabase dashboard');
console.log('2. Wait a few minutes for it to activate');
console.log('3. Test again\n');

console.log('📊 CURRENT STATUS:');
console.log('✅ Environment variables are set on backend');
console.log('❌ Supabase client not initializing');
console.log('❌ Connection test failing');
console.log('❌ "Database not configured" error\n');

console.log('💡 MOST LIKELY ISSUES:');
console.log('1. Wrong Supabase URL format');
console.log('2. Using anon key instead of service_role key');
console.log('3. Supabase project is paused');
console.log('4. Users table doesn\'t exist');
console.log('5. Copying from wrong project\n');

console.log('🔍 TO CHECK VERCEL LOGS:');
console.log('1. Go to Vercel Dashboard → Backend Project');
console.log('2. Click "Deployments" tab');
console.log('3. Click on latest deployment');
console.log('4. Check "Functions" logs for Supabase errors');
console.log('5. Look for connection or authentication errors\n');

console.log('📞 NEED HELP?');
console.log('If you\'re still stuck, please share:');
console.log('- Your Supabase project URL (without the key)');
console.log('- Whether the project is active or paused');
console.log('- Whether the users table exists');
console.log('- Any error messages from Vercel logs'); 