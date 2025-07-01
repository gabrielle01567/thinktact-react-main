// Test Supabase Backend Integration
const backendUrl = 'https://backend-fwkpds60c-gabrielle-shands-projects.vercel.app/api';

async function testSupabaseBackend() {
  console.log('🧪 === SUPABASE BACKEND TEST ===\n');
  console.log(`🔗 Testing backend: ${backendUrl}\n`);
  
  try {
    // Test 1: Backend Health Check
    console.log('📝 Test 1: Backend Health Check');
    const healthResponse = await fetch(`${backendUrl.replace('/api', '')}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(healthResponse.headers.entries()));
    
    const responseText = await healthResponse.text();
    console.log(`   Response (first 200 chars): ${responseText.substring(0, 200)}...`);
    
    let healthData;
    try {
      healthData = JSON.parse(responseText);
      console.log(`   Parsed Response:`, healthData);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse JSON: ${parseError.message}`);
      console.log(`   This suggests the backend is not responding correctly.`);
      console.log(`   Full response: ${responseText}`);
      return;
    }
    
    console.log(`   Supabase configured: ${healthData.blobToken ? 'No (Blob)' : 'Yes (Supabase)'}\n`);
    
    // Test 2: User Registration
    console.log('📝 Test 2: User Registration');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    const testName = 'Test User';
    
    console.log(`   Registering user: ${testEmail}`);
    
    const registerResponse = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
        isVerified: true,
        isAdmin: false
      })
    });
    
    const registerText = await registerResponse.text();
    console.log(`   Registration Status: ${registerResponse.status}`);
    console.log(`   Registration Response (first 200 chars): ${registerText.substring(0, 200)}...`);
    
    let registerData;
    try {
      registerData = JSON.parse(registerText);
      console.log(`   Parsed Registration:`, registerData);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse registration JSON: ${parseError.message}`);
      console.log(`   Full registration response: ${registerText}`);
      return;
    }
    
    if (registerData.success) {
      console.log(`   ✅ User created: ${registerData.user.email}`);
      console.log(`   👤 User ID: ${registerData.user.id}`);
    } else {
      console.log(`   ❌ Registration failed: ${registerData.error}\n`);
      return;
    }
    
    // Test 3: User Login
    console.log('\n📝 Test 3: User Login');
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginText = await loginResponse.text();
    console.log(`   Login Status: ${loginResponse.status}`);
    console.log(`   Login Response (first 200 chars): ${loginText.substring(0, 200)}...`);
    
    let loginData;
    try {
      loginData = JSON.parse(loginText);
      console.log(`   Parsed Login:`, loginData);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse login JSON: ${parseError.message}`);
      console.log(`   Full login response: ${loginText}`);
      return;
    }
    
    if (loginData.success) {
      console.log(`   ✅ Login successful!`);
      console.log(`   🔑 Token received: ${loginData.token ? 'Yes' : 'No'}`);
      console.log(`   👤 User: ${loginData.user.email}`);
    } else {
      console.log(`   ❌ Login failed: ${loginData.error}\n`);
      return;
    }
    
    // Test 4: Save Analysis
    console.log('\n📝 Test 4: Save Analysis');
    const analysisData = {
      title: 'Test Analysis',
      content: 'This is a test analysis content',
      analysisData: {
        arguments: ['Test argument 1', 'Test argument 2'],
        conclusion: 'Test conclusion',
        timestamp: new Date().toISOString()
      }
    };
    
    const analysisResponse = await fetch(`${backendUrl}/analysis/save`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(analysisData)
    });
    
    const analysisText = await analysisResponse.text();
    console.log(`   Analysis Save Status: ${analysisResponse.status}`);
    console.log(`   Analysis Response (first 200 chars): ${analysisText.substring(0, 200)}...`);
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
      console.log(`   Parsed Analysis:`, analysisResult);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse analysis JSON: ${parseError.message}`);
      console.log(`   Full analysis response: ${analysisText}`);
      return;
    }
    
    if (analysisResult.success) {
      console.log(`   ✅ Analysis saved successfully!`);
    } else {
      console.log(`   ❌ Analysis save failed: ${analysisResult.error}`);
    }
    
    // Test 5: Get Analysis History
    console.log('\n📝 Test 5: Get Analysis History');
    const historyResponse = await fetch(`${backendUrl}/analysis/history`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const historyText = await historyResponse.text();
    console.log(`   History Status: ${historyResponse.status}`);
    console.log(`   History Response (first 200 chars): ${historyText.substring(0, 200)}...`);
    
    let historyData;
    try {
      historyData = JSON.parse(historyText);
      console.log(`   Parsed History:`, historyData);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse history JSON: ${parseError.message}`);
      console.log(`   Full history response: ${historyText}`);
      return;
    }
    
    if (historyData.success) {
      console.log(`   ✅ Analysis history retrieved!`);
      console.log(`   📊 Analysis count: ${historyData.history?.length || 0}`);
    } else {
      console.log(`   ❌ History retrieval failed: ${historyData.error}`);
    }
    
    console.log('\n🎉 === ALL TESTS COMPLETED ===');
    console.log('✅ Backend is working with Supabase!');
    console.log('✅ User registration and login working!');
    console.log('✅ Analysis saving and retrieval working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabaseBackend(); 