console.log('🔍 === VERIFY SUPABASE VALUES ===\n');

console.log('📋 The environment variables are set, but the connection is failing.');
console.log('This means the actual values (URL or key) are incorrect.\n');

console.log('🔧 VERIFICATION CHECKLIST:\n');

console.log('1️⃣ PROJECT URL FORMAT:');
console.log('   Go to Supabase Dashboard → Settings → API');
console.log('   Look for "Project URL"');
console.log('   ✅ CORRECT: https://your-project-id.supabase.co');
console.log('   ❌ WRONG: https://supabase.co/project/your-project-id');
console.log('   ❌ WRONG: https://app.supabase.com/project/your-project-id\n');

console.log('2️⃣ SERVICE ROLE KEY:');
console.log('   In the same API settings, look for "service_role" key');
console.log('   ✅ CORRECT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (200+ chars)');
console.log('   ❌ WRONG: Using the "anon" key (shorter)\n');

console.log('3️⃣ PROJECT STATUS:');
console.log('   Make sure your Supabase project is ACTIVE (not paused)');
console.log('   If paused, click "Resume" to activate it\n');

console.log('4️⃣ USERS TABLE:');
console.log('   Go to Table Editor → Check if "users" table exists');
console.log('   If not, run the SQL setup script again\n');

console.log('🔍 COMMON MISTAKES:\n');

console.log('❌ Copying from browser URL instead of Project URL:');
console.log('   - Browser shows: https://supabase.co/project/your-project-id');
console.log('   - Need: https://your-project-id.supabase.co\n');

console.log('❌ Using anon key instead of service_role key:');
console.log('   - Anon key is shorter (~100 chars)');
console.log('   - Service role key is longer (~200+ chars)');
console.log('   - Service role key starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

console.log('❌ Copying from wrong project:');
console.log('   - Make sure you\'re in the correct Supabase project');
console.log('   - Check the project name in the dashboard\n');

console.log('🔧 FIX STEPS:\n');

console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Click "Settings" → "API"');
console.log('4. Copy the EXACT "Project URL" (not browser URL)');
console.log('5. Copy the EXACT "service_role" key (not anon key)');
console.log('6. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables');
console.log('7. Update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
console.log('8. Redeploy the backend\n');

console.log('📞 NEED HELP?');
console.log('If you\'re still stuck, please share:');
console.log('- Your Supabase project URL (without the key)');
console.log('- Whether you\'re using service_role key (not anon)');
console.log('- Whether the project is active or paused');
console.log('- Whether the users table exists');

console.log('\n💡 TIP: The service_role key is much longer and gives full database access!'); 