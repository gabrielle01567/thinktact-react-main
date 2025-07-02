console.log('🔍 Checking Supabase Configuration');
console.log('==================================');
console.log('');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

console.log('Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `✅ Set (${supabaseServiceKey.substring(0, 10)}...)` : '❌ Not set');
console.log('JWT_SECRET:', jwtSecret ? '✅ Set' : '❌ Not set');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing required Supabase environment variables!');
  console.log('');
  console.log('📋 To fix this:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Select your backend project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add these variables:');
  console.log('');
  console.log('   SUPABASE_URL');
  console.log('   - Value: Your Supabase project URL (not browser URL)');
  console.log('   - Example: https://your-project-id.supabase.co');
  console.log('');
  console.log('   SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - Value: Your Supabase service role key');
  console.log('   - Found in: Supabase Dashboard → Settings → API → service_role key');
  console.log('');
  console.log('5. Redeploy your backend after adding the variables');
  console.log('');
  console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
  console.log('🔗 Vercel Dashboard: https://vercel.com/dashboard');
} else {
  console.log('✅ All required environment variables are set!');
  console.log('');
  console.log('🔧 If you still get "Database not configured" errors:');
  console.log('1. Make sure the values are correct');
  console.log('2. Redeploy your backend');
  console.log('3. Check that your Supabase project is active');
  console.log('4. Verify the service role key has the correct permissions');
} 