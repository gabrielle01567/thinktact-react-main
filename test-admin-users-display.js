const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api';

async function testAdminUsersDisplay() {
  console.log('🔍 Testing Admin Users Display');
  console.log('================================');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    const response = await fetch(`${BACKEND_URL}/admin/users`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('📥 Raw Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.users && data.users.length > 0) {
      console.log('\n✅ User data structure check:');
      const user = data.users[0];
      console.log(`- id: ${typeof user.id} = ${user.id}`);
      console.log(`- email: ${typeof user.email} = ${user.email}`);
      console.log(`- name: ${typeof user.name} = ${user.name}`);
      console.log(`- firstName: ${typeof user.firstName} = ${user.firstName}`);
      console.log(`- lastName: ${typeof user.lastName} = ${user.lastName}`);
      console.log(`- verified: ${typeof user.verified} = ${user.verified}`);
      console.log(`- isAdmin: ${typeof user.isAdmin} = ${user.isAdmin}`);
      console.log(`- blocked: ${typeof user.blocked} = ${user.blocked}`);
      console.log(`- createdAt: ${typeof user.createdAt} = ${user.createdAt}`);
      console.log(`- created_at: ${typeof user.created_at} = ${user.created_at}`);
      
      // Check if the transformation is working correctly
      const hasCorrectFields = user.hasOwnProperty('verified') && 
                              user.hasOwnProperty('createdAt') && 
                              user.hasOwnProperty('firstName') && 
                              user.hasOwnProperty('lastName');
      
      if (hasCorrectFields) {
        console.log('\n🎉 SUCCESS: User data has correct field names for frontend!');
        console.log('✅ verified field exists (frontend expects this)');
        console.log('✅ createdAt field exists (frontend expects this)');
        console.log('✅ firstName/lastName fields exist (frontend expects these)');
      } else {
        console.log('\n❌ ISSUE: User data missing required fields for frontend');
        console.log('❌ Missing verified field');
        console.log('❌ Missing createdAt field');
        console.log('❌ Missing firstName/lastName fields');
      }
    } else {
      console.log('\n⚠️ No users found or empty response');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin users display:', error);
  }
}

testAdminUsersDisplay(); 