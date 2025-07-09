async function testEmailVariations() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing different email format variations...');
  
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
      console.log(`\n📧 Testing: "${email}"`);
      
      const response = await fetch(`${backendUrl}/auth/user/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ FOUND: "${email}"`);
        console.log('User data:', data);
        break; // Found the correct format
      } else {
        console.log(`❌ NOT FOUND: "${email}"`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${email}":`, error.message);
    }
  }
}

testEmailVariations(); 