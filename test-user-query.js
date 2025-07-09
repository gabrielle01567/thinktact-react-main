async function testUserQuery() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('�� Testing user query with different email formats...');
  
  // Test with the exact email format you see in the database
  const emailVariations = [
    'alex.hawke54@gmail.com',
    'ALEX.HAWKE54@GMAIL.COM',
    'Alex.Hawke54@gmail.com',
    ' alex.hawke54@gmail.com ',
    'alex.hawke54@gmail.com  ',
    '  alex.hawke54@gmail.com'
  ];
  
  for (const email of emailVariations) {
    try {
      console.log(`\n📧 Testing user lookup: "${email}"`);
      
      const response = await fetch(`${backendUrl}/auth/user/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ FOUND: "${email}"`);
        console.log('User data:', data);
        break;
      } else {
        const errorText = await response.text();
        console.log(`❌ NOT FOUND: "${email}" - ${errorText}`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${email}":`, error.message);
    }
  }
  
  // Also test the admin users endpoint to see all users
  console.log('\n📋 Testing admin users endpoint...');
  try {
    const adminResponse = await fetch(`${backendUrl}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (adminResponse.ok) {
      const data = await adminResponse.json();
      console.log('✅ All users:', data);
    } else {
      const errorText = await adminResponse.text();
      console.log('❌ Admin users error:', errorText);
    }
  } catch (error) {
    console.error('❌ Error testing admin users:', error.message);
  }
}

testUserQuery(); 