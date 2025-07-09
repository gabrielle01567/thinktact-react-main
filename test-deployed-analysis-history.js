async function testDeployedAnalysisHistory() {
  const backendUrl = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';
  
  console.log('🔍 Testing deployed backend analysis history...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test the analysis history endpoint
    const response = await fetch(`${backendUrl}/analysis/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without a valid token, but we can see if the endpoint exists
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis history endpoint working');
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Analysis history endpoint error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing analysis history:', error.message);
  }
}

testDeployedAnalysisHistory(); 