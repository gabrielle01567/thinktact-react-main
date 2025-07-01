console.log('🔐 === AUTHENTICATION FLOW VALIDATION ===\n');

const backendUrl = 'https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'testpassword123',
  name: 'Test User'
};

const adminUser = {
  email: `admin-${Date.now()}@example.com`,
  password: 'adminpassword123',
  name: 'Admin User',
  isVerified: true,
  isAdmin: true
};

async function testRegistration() {
  console.log('📝 === TESTING USER REGISTRATION ===\n');
  
  try {
    // Test 1: Regular user registration
    console.log('🔍 Test 1: Regular User Registration');
    const response1 = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    
    if (result1.success) {
      console.log('✅ Regular user registration successful');
      testUser.verificationToken = result1.verificationToken;
    } else {
      console.log('❌ Regular user registration failed:', result1.error);
    }
    
    // Test 2: Admin user registration
    console.log('\n🔍 Test 2: Admin User Registration');
    const response2 = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminUser)
    });
    
    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
    
    if (result2.success) {
      console.log('✅ Admin user registration successful');
    } else {
      console.log('❌ Admin user registration failed:', result2.error);
    }
    
    // Test 3: Duplicate email registration
    console.log('\n🔍 Test 3: Duplicate Email Registration');
    const response3 = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(result3, null, 2));
    
    if (!result3.success && result3.error.includes('already exists')) {
      console.log('✅ Duplicate email handling working');
    } else {
      console.log('❌ Duplicate email handling failed');
    }
    
  } catch (error) {
    console.error('❌ Registration test error:', error.message);
  }
}

async function testLogin() {
  console.log('\n📝 === TESTING USER LOGIN ===\n');
  
  try {
    // Test 1: Admin user login (should work immediately)
    console.log('🔍 Test 1: Admin User Login');
    const response1 = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminUser.email,
        password: adminUser.password
      })
    });
    
    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    
    if (result1.success) {
      console.log('✅ Admin user login successful');
      adminUser.token = result1.token;
    } else {
      console.log('❌ Admin user login failed:', result1.error);
    }
    
    // Test 2: Unverified user login (should fail)
    console.log('\n🔍 Test 2: Unverified User Login');
    const response2 = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
    
    if (!result2.success && result2.error.includes('verify')) {
      console.log('✅ Unverified user login properly blocked');
    } else {
      console.log('❌ Unverified user login not properly blocked');
    }
    
    // Test 3: Invalid credentials
    console.log('\n🔍 Test 3: Invalid Credentials');
    const response3 = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    });
    
    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(result3, null, 2));
    
    if (!result3.success && result3.error.includes('Invalid')) {
      console.log('✅ Invalid credentials properly handled');
    } else {
      console.log('❌ Invalid credentials not properly handled');
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error.message);
  }
}

async function testEmailVerification() {
  console.log('\n📝 === TESTING EMAIL VERIFICATION ===\n');
  
  if (!testUser.verificationToken) {
    console.log('⚠️ No verification token available, skipping verification test');
    return;
  }
  
  try {
    console.log('🔍 Test: Email Verification');
    const response = await fetch(`${backendUrl}/auth/verify?token=${testUser.verificationToken}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email verification successful');
      testUser.isVerified = true;
    } else {
      console.log('❌ Email verification failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Verification test error:', error.message);
  }
}

async function testVerifiedUserLogin() {
  console.log('\n📝 === TESTING VERIFIED USER LOGIN ===\n');
  
  if (!testUser.isVerified) {
    console.log('⚠️ User not verified, skipping verified login test');
    return;
  }
  
  try {
    console.log('🔍 Test: Verified User Login');
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Verified user login successful');
      testUser.token = result.token;
    } else {
      console.log('❌ Verified user login failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Verified login test error:', error.message);
  }
}

async function testPasswordReset() {
  console.log('\n📝 === TESTING PASSWORD RESET ===\n');
  
  try {
    console.log('🔍 Test: Password Reset');
    const response = await fetch(`${backendUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        newPassword: 'newpassword123'
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Password reset successful');
      testUser.password = 'newpassword123';
    } else {
      console.log('❌ Password reset failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Password reset test error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Flow Tests...\n');
  
  await testRegistration();
  await testLogin();
  await testEmailVerification();
  await testVerifiedUserLogin();
  await testPasswordReset();
  
  console.log('\n📊 === TEST SUMMARY ===');
  console.log('✅ Tests completed');
  console.log('📋 Check the results above for any issues');
  console.log('🔧 Fix any failing tests before deploying to production');
}

runAllTests(); 