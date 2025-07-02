console.log('🔍 === VERIFYING SUPABASE CREDENTIALS ===\n');

console.log('📝 To verify your Supabase credentials:');
console.log('\n1. Go to your Supabase dashboard');
console.log('2. Click "Settings" → "API"');
console.log('3. Check these values:');

console.log('\n🔧 Project URL should look like:');
console.log('   https://abcdefghijklmnop.supabase.co');
console.log('   (not https://supabase.co/project/...)');

console.log('\n🔑 Service Role Key should:');
console.log('   - Start with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('   - Be about 200+ characters long');
console.log('   - NOT be the anon/public key');

console.log('\n⚠️ Common Issues:');
console.log('1. Using anon key instead of service role key');
console.log('2. Wrong project URL format');
console.log('3. Copying from wrong project');
console.log('4. Project is paused or inactive');

console.log('\n🔧 To test your credentials locally:');
console.log('1. Set environment variables:');
console.log('   $env:SUPABASE_URL="your-project-url"');
console.log('   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
console.log('\n2. Run: er-node test-supabase-direct.js');

console.log('\n📋 Current Backend Status:');
console.log('✅ Environment variables are set on backend');
console.log('❌ Supabase client not initializing');
console.log('✅ Database tables exist');
console.log('❌ Connection test failing');

console.log('\n💡 Next Steps:');
console.log('1. Verify your Supabase URL and service role key');
console.log('2. Make sure your Supabase project is active');
console.log('3. Check Vercel deployment logs for detailed error messages');
console.log('4. Try redeploying the backend after fixing credentials');

console.log('\n🔍 To check Vercel logs:');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your backend project');
console.log('3. Go to "Deployments" tab');
console.log('4. Click on the latest deployment');
console.log('5. Check "Functions" logs for Supabase initialization errors'); 