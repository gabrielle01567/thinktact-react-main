const BACKEND_URL = 'https://backendv2-ruddy.vercel.app';

console.log('🔍 Testing Correct Backend URL');
console.log('==============================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testBackend() {
  try {
    console.log('🔍 Testing backend response...');
    
    const response = await fetch(`${BACKEND_URL}/api/health`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response (first 500 chars):');
    console.log(text.substring(0, 500));
    
    if (text.includes('Database not configured')) {
      console.log('\n❌ ISSUE FOUND: Database not configured');
      console.log('This means the Supabase environment variables are missing in Vercel.');
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables');
      console.log('2. Add these variables:');
      console.log('   - SUPABASE_URL');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY');
      console.log('   - JWT_SECRET');
      console.log('3. Redeploy the backend');
    } else if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      console.log('\n❌ ISSUE FOUND: Backend is serving frontend HTML instead of API');
      console.log('This means Vercel is serving static files instead of running the backend server.');
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('1. Check Vercel project settings');
      console.log('2. Make sure the backend is properly deployed');
      console.log('3. Check the build settings and root directory');
    } else {
      console.log('\n✅ Backend is responding properly!');
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        console.log('✅ JSON Response:', data);
        
        // Check if Supabase is configured
        if (data.supabaseUrl && data.supabaseKey) {
          console.log('✅ Supabase environment variables are set!');
        } else {
          console.log('❌ Supabase environment variables are missing!');
        }
      } catch (parseError) {
        console.log('⚠️ Response is not JSON');
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('');
    console.log('🔧 POSSIBLE ISSUES:');
    console.log('1. Backend deployment failed');
    console.log('2. Wrong backend URL');
    console.log('3. Vercel project is down');
    console.log('');
    console.log('🔗 Check Vercel Dashboard: https://vercel.com/dashboard');
  }
}

testBackend(); 