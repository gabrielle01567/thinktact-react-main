async function testAnalysisWithToken() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing analysis history with authentication...');
  console.log('Backend URL:', backendUrl);
  
  console.log('\n📋 Instructions:');
  console.log('1. Open your browser and go to your ThinkTact app');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to Application/Storage tab → Local Storage');
  console.log('4. Find the key "thinktact_token" and copy its value');
  console.log('5. Paste the token below when prompted');
  
  // For now, let's test without a token to see what happens
  try {
    console.log('\n📋 Test 1: Analysis history without token...');
    const response = await fetch(`${backendUrl}/analysis/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis history working:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Analysis history error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing analysis history:', error.message);
  }
  
  console.log('\n📋 Next steps:');
  console.log('- If you see "No token provided" error, that means the endpoint exists and works');
  console.log('- The frontend should automatically include your token when you\'re logged in');
  console.log('- Try accessing analysis history in your browser while logged in');
}

testAnalysisWithToken(); 