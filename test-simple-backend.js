// Simple backend test
const backendUrl = 'https://backend-h28tf8gui-gabrielle-shands-projects.vercel.app';

async function testSimpleBackend() {
  console.log('🧪 === SIMPLE BACKEND TEST ===\n');
  console.log(`🔗 Testing backend: ${backendUrl}\n`);
  
  try {
    // Test 1: Root endpoint
    console.log('📝 Test 1: Root endpoint');
    const rootResponse = await fetch(`${backendUrl}/`);
    console.log(`   Status: ${rootResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(rootResponse.headers.entries()));
    
    const rootText = await rootResponse.text();
    console.log(`   Response (first 200 chars): ${rootText.substring(0, 200)}...`);
    
    // Test 2: Health endpoint
    console.log('\n📝 Test 2: Health endpoint');
    const healthResponse = await fetch(`${backendUrl}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(healthResponse.headers.entries()));
    
    const healthText = await healthResponse.text();
    console.log(`   Response (first 200 chars): ${healthText.substring(0, 200)}...`);
    
    // Test 3: Test endpoint
    console.log('\n📝 Test 3: Test endpoint');
    const testResponse = await fetch(`${backendUrl}/api/test`);
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(testResponse.headers.entries()));
    
    const testText = await testResponse.text();
    console.log(`   Response (first 200 chars): ${testText.substring(0, 200)}...`);
    
    // Test 4: Try to parse JSON responses
    console.log('\n📝 Test 4: Parse JSON responses');
    
    try {
      const rootData = JSON.parse(rootText);
      console.log(`   ✅ Root endpoint JSON:`, rootData);
    } catch (e) {
      console.log(`   ❌ Root endpoint not JSON: ${e.message}`);
    }
    
    try {
      const healthData = JSON.parse(healthText);
      console.log(`   ✅ Health endpoint JSON:`, healthData);
    } catch (e) {
      console.log(`   ❌ Health endpoint not JSON: ${e.message}`);
    }
    
    try {
      const testData = JSON.parse(testText);
      console.log(`   ✅ Test endpoint JSON:`, testData);
    } catch (e) {
      console.log(`   ❌ Test endpoint not JSON: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleBackend(); 