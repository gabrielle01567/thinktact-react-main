async function testRuddyBackendAnalysis() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing ruddy backend analysis endpoints...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test 1: Check if the backend is accessible
    console.log('\n📋 Test 1: Backend health check...');
    const healthResponse = await fetch(backendUrl.replace('/api', ''));
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    }
    
    // Test 2: Check analysis history endpoint
    console.log('\n📋 Test 2: Analysis history endpoint...');
    const historyResponse = await fetch(`${backendUrl}/analysis/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without a valid token, but we can see if the endpoint exists
      }
    });
    
    console.log('Analysis history status:', historyResponse.status);
    
    if (historyResponse.ok) {
      const data = await historyResponse.json();
      console.log('✅ Analysis history endpoint working');
      console.log('Response data:', data);
    } else {
      const errorText = await historyResponse.text();
      console.log('❌ Analysis history endpoint error:', errorText);
    }
    
    // Test 3: Check if save analysis endpoint exists
    console.log('\n📋 Test 3: Save analysis endpoint...');
    const saveResponse = await fetch(`${backendUrl}/analysis/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log('Save analysis status:', saveResponse.status);
    
    if (saveResponse.ok) {
      const data = await saveResponse.json();
      console.log('✅ Save analysis endpoint working');
    } else {
      const errorText = await saveResponse.text();
      console.log('❌ Save analysis endpoint error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing ruddy backend:', error.message);
  }
}

testRuddyBackendAnalysis(); 