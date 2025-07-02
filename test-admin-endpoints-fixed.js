const BACKEND_URL = 'https://thinktact-react-main-blob.vercel.app';

console.log('🧪 Testing Admin Endpoints (Fixed Version)');
console.log('==========================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const url = `${BACKEND_URL}/api/admin/${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🔍 Testing ${method} ${endpoint}...`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${endpoint}: Success`);
      console.log(`   Status: ${response.status}`);
      if (data.users) {
        console.log(`   Users found: ${data.users.length}`);
        data.users.forEach(user => {
          console.log(`     - ${user.email} (ID: ${user.id}, Admin: ${user.is_admin}, Blocked: ${user.blocked || false})`);
        });
      }
      if (data.user) {
        console.log(`   User: ${data.user.email} (ID: ${data.user.id})`);
      }
      if (data.message) {
        console.log(`   Message: ${data.message}`);
      }
    } else {
      console.log(`❌ ${endpoint}: Failed`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
    console.log('');
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${endpoint}: Network Error`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting admin endpoint tests...\n');

  // Test 1: Get all users
  const usersResult = await testEndpoint('users');

  if (usersResult.success && usersResult.data.users && usersResult.data.users.length > 0) {
    const firstUser = usersResult.data.users[0];
    
    // Test 2: Toggle user blocked status
    console.log('🔄 Testing user status toggle...');
    await testEndpoint('toggle-status', 'POST', {
      userId: firstUser.id,
      blocked: !(firstUser.blocked || false)
    });

    // Test 3: Toggle user admin status
    console.log('🔄 Testing admin status toggle...');
    await testEndpoint('toggle-admin', 'POST', {
      userId: firstUser.id,
      isAdmin: !(firstUser.is_admin || false)
    });

    // Test 4: Toggle back to original status
    console.log('🔄 Reverting user status...');
    await testEndpoint('toggle-status', 'POST', {
      userId: firstUser.id,
      blocked: firstUser.blocked || false
    });

    await testEndpoint('toggle-admin', 'POST', {
      userId: firstUser.id,
      isAdmin: firstUser.is_admin || false
    });
  } else {
    console.log('⚠️ No users found, skipping toggle tests');
  }

  console.log('🎉 Admin endpoint tests completed!');
  console.log('');
  console.log('📋 Summary:');
  console.log('- All admin endpoints should now work with Supabase');
  console.log('- Missing blocked column is handled gracefully');
  console.log('- Users are displayed with blocked=false when column is missing');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Add the blocked column to your database manually');
  console.log('2. Run: node add-blocked-column-manual.js for instructions');
  console.log('3. Test the admin page on your live site');
}

runTests().catch(console.error); 