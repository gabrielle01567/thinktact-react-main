import { createUser, findUserByEmail } from './backend/api/supabase-service.js';

console.log('🧪 === SUPABASE SERVICE TEST ===\n');

try {
  console.log('🔧 Testing createUser function...');
  
  const testUser = {
    email: 'test-service@example.com',
    password: 'testpassword123',
    name: 'Test User',
    isVerified: true,
    isAdmin: false
  };
  
  const result = await createUser(testUser);
  console.log('✅ createUser result:', result);
  
  if (result.success) {
    console.log('🔧 Testing findUserByEmail function...');
    const foundUser = await findUserByEmail(testUser.email);
    console.log('✅ findUserByEmail result:', foundUser ? 'User found' : 'User not found');
  }
  
} catch (error) {
  console.error('❌ Error testing Supabase service:', error);
  console.error('❌ Error message:', error.message);
} 