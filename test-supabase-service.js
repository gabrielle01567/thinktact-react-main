import { createUser, findUserByEmail } from './backend/api/supabase-service.js';

console.log('🔍 Testing Supabase Service');
console.log('===========================');
console.log('');

async function testSupabaseService() {
  try {
    console.log('🧪 Testing user creation...');
    
    const testEmail = `test-service-${Date.now()}@example.com`;
    console.log(`Test email: ${testEmail}`);
    
    const result = await createUser({
      email: testEmail,
      password: 'testpassword123',
      name: 'Test Service User',
      isVerified: true,
      isAdmin: false
    });
    
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ User creation successful!');
      console.log('User ID:', result.user.id);
      console.log('User email:', result.user.email);
      
      // Test finding the user
      console.log('\n🧪 Testing user lookup...');
      const foundUser = await findUserByEmail(testEmail);
      if (foundUser) {
        console.log('✅ User lookup successful!');
        console.log('Found user:', foundUser.email);
      } else {
        console.log('❌ User lookup failed');
      }
    } else {
      console.log('❌ User creation failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error stack:', error.stack);
  }
}

testSupabaseService(); 