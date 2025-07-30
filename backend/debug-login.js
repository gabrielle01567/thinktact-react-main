import { findUserByEmail, verifyPassword } from './api/supabase-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugLogin(email, password) {
  console.log('🔍 Debug Login Test');
  console.log('🔍 Email:', email);
  console.log('🔍 Password:', password ? '[HIDDEN]' : '[MISSING]');
  
  try {
    // Step 1: Find user by email
    console.log('\n🔍 Step 1: Finding user by email...');
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return { success: false, error: 'User not found' };
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Step 2: Check if user is verified
    console.log('\n🔍 Step 2: Checking verification status...');
    if (!user.isVerified) {
      console.log('❌ User not verified');
      return { success: false, error: 'User not verified', needsVerification: true };
    }
    
    console.log('✅ User is verified');
    
    // Step 3: Verify password
    console.log('\n🔍 Step 3: Verifying password...');
    const isValidPassword = await verifyPassword(user, password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return { success: false, error: 'Invalid password' };
    }
    
    console.log('✅ Password verified successfully');
    
    return { success: true, user };
    
  } catch (error) {
    console.error('❌ Debug login error:', error);
    return { success: false, error: error.message };
  }
}

// Test with command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node debug-login.js <email> <password>');
  process.exit(1);
}

debugLogin(email, password)
  .then(result => {
    console.log('\n📋 Final Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  }); 