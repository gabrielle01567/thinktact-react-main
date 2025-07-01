console.log('🔍 === TESTING SUPABASE CREDENTIALS ===\n');

console.log('📝 To test your Supabase credentials:');
console.log('\n1. Go to your Supabase dashboard');
console.log('2. Click "Settings" → "API"');
console.log('3. Check these values:');

console.log('\n🔧 Project URL should be:');
console.log('   https://your-project-id.supabase.co');
console.log('   (NOT https://supabase.co/project/...)');

console.log('\n🔑 Service Role Key should:');
console.log('   - Start with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   - Be about 200+ characters long');
console.log('   - NOT be the anon/public key');

console.log('\n⚠️ Common Issues:');
console.log('1. Using anon key instead of service_role key');
console.log('2. Wrong project URL format');
console.log('3. Copying from wrong project');
console.log('4. Project is paused or inactive');

console.log('\n🔧 Quick Fix Steps:');
console.log('1. Verify your Supabase project is active (not paused)');
console.log('2. Copy the EXACT Project URL and service_role key');
console.log('3. Update them in Vercel environment variables');
console.log('4. Redeploy your backend');

console.log('\n📋 Current Status:');
console.log('✅ Environment variables are set on backend');
console.log('❌ Supabase client not initializing');
console.log('❌ Connection test failing');

console.log('\n💡 The issue is likely:');
console.log('- Wrong Supabase URL or service role key');
console.log('- Supabase project is paused');
console.log('- Network connectivity issues');

console.log('\n🔍 To check Vercel logs:');
console.log('1. Go to Vercel Dashboard → Backend Project');
console.log('2. Go to "Deployments" tab');
console.log('3. Click on latest deployment');
console.log('4. Check "Functions" logs for Supabase errors'); 