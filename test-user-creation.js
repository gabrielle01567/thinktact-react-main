// Test user creation with working backend
const BACKEND_URL = 'https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app';

console.log('🧪 === TESTING USER CREATION ===\n');

async function testUserCreation() {
  try {
    // Test 1: Create a regular user
    console.log('📝 Test 1: Creating Regular User');
    const userData = {
      email: `test-user-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User',
      isVerified: false,
      isAdmin: false
    };

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', result);

    if (result.success) {
      console.log('   ✅ User created successfully!');
      console.log('   📧 User email:', userData.email);
      console.log('   🔑 Verification token:', result.verificationToken);
    } else {
      console.log('   ❌ User creation failed:', result.error);
    }
    console.log('');

    // Test 2: Create an admin user
    console.log('📝 Test 2: Creating Admin User');
    const adminData = {
      email: `admin-${Date.now()}@example.com`,
      password: 'adminpassword123',
      name: 'Admin User',
      isVerified: true,
      isAdmin: true
    };

    const adminResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    const adminResult = await adminResponse.json();
    console.log('   Status:', adminResponse.status);
    console.log('   Response:', adminResult);

    if (adminResult.success) {
      console.log('   ✅ Admin user created successfully!');
      console.log('   📧 Admin email:', adminData.email);
      console.log('   👑 Admin privileges:', adminResult.user.isAdmin);
    } else {
      console.log('   ❌ Admin user creation failed:', adminResult.error);
    }
    console.log('');

    // Test 3: Test login with admin user
    if (adminResult.success) {
      console.log('📝 Test 3: Testing Login with Admin User');
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password
        })
      });

      const loginResult = await loginResponse.json();
      console.log('   Status:', loginResponse.status);
      console.log('   Response:', loginResult);

      if (loginResult.success) {
        console.log('   ✅ Login successful!');
        console.log('   🔑 JWT Token received:', loginResult.token ? 'Yes' : 'No');
        console.log('   👤 User data:', loginResult.user);
      } else {
        console.log('   ❌ Login failed:', loginResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserCreation(); 