// Comprehensive debug script for user creation process
const backendUrl = 'https://backend-gabrielle-shands-projects.vercel.app/api';

async function debugUserCreation() {
  console.log('🔍 === USER CREATION PROCESS DEBUG ===\n');
  
  const testEmail = 'alex.hawke54@gmail.com';
  const testPassword = 'admin123';
  const testName = 'Alex Hawke';
  
  try {
    // Step 1: Test email normalization
    console.log('📝 Step 1: Email Normalization');
    const normalizedEmail = testEmail.toLowerCase().trim();
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const expectedBlobName = `users/${safeEmail}.json`;
    console.log(`   Original email: ${testEmail}`);
    console.log(`   Normalized email: ${normalizedEmail}`);
    console.log(`   Safe email: ${safeEmail}`);
    console.log(`   Expected blob name: ${expectedBlobName}\n`);
    
    // Step 2: Check if user already exists
    console.log('📝 Step 2: Check if user exists');
    const checkResponse = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
        isVerified: true,
        isAdmin: true
      })
    });
    
    console.log(`   Registration response status: ${checkResponse.status}`);
    console.log(`   Registration response headers:`, Object.fromEntries(checkResponse.headers.entries()));
    
    const responseText = await checkResponse.text();
    console.log(`   Raw response: ${responseText.substring(0, 200)}...`);
    
    let checkResult;
    try {
      checkResult = JSON.parse(responseText);
      console.log(`   Parsed response:`, checkResult);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse JSON: ${parseError.message}`);
      return;
    }
    
    if (checkResult.success) {
      console.log('   ✅ User created/updated successfully!');
      console.log(`   👤 User details:`, checkResult.user);
    } else {
      console.log(`   ⚠️ User already exists or error: ${checkResult.error}\n`);
    }
    
    // Step 3: Test login with the user
    console.log('📝 Step 3: Test login');
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginText = await loginResponse.text();
    console.log(`   Login response status: ${loginResponse.status}`);
    console.log(`   Raw login response: ${loginText.substring(0, 200)}...`);
    
    let loginResult;
    try {
      loginResult = JSON.parse(loginText);
      console.log(`   Login response:`, loginResult);
    } catch (parseError) {
      console.log(`   ❌ Failed to parse login JSON: ${parseError.message}`);
      return;
    }
    
    if (loginResponse.ok) {
      console.log('   ✅ Login successful!');
      console.log(`   🔑 Token received: ${loginResult.token ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Login failed: ${loginResult.error}`);
      
      // Step 4: Debug the specific issue
      console.log('\n📝 Step 4: Debug login failure');
      
      // Test with different email formats
      const emailVariations = [
        testEmail,
        testEmail.toLowerCase(),
        testEmail.toUpperCase(),
        testEmail.trim()
      ];
      
      for (const emailVar of emailVariations) {
        console.log(`   Testing with email: "${emailVar}"`);
        const testResponse = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailVar,
            password: testPassword
          })
        });
        
        const testText = await testResponse.text();
        let testResult;
        try {
          testResult = JSON.parse(testText);
          console.log(`   Result: ${testResult.error || 'Success'}`);
        } catch (parseError) {
          console.log(`   Result: Failed to parse - ${testText.substring(0, 100)}`);
        }
      }
      
      // Step 5: Test direct blob access
      console.log('\n📝 Step 5: Test direct blob access');
      console.log(`   Expected blob name: ${expectedBlobName}`);
      
      // Try to access the blob directly
      try {
        const blobResponse = await fetch(`https://backend-gabrielle-shands-projects.vercel.app/api/blob/${encodeURIComponent(expectedBlobName)}`);
        if (blobResponse.ok) {
          const blobData = await blobResponse.json();
          console.log(`   ✅ Blob found! User data:`, blobData);
          console.log(`   🔍 Password field exists: ${blobData.password ? 'Yes' : 'No'}`);
          console.log(`   🔍 Password length: ${blobData.password ? blobData.password.length : 'N/A'}`);
        } else {
          console.log(`   ❌ Blob not found (status: ${blobResponse.status})`);
        }
      } catch (blobError) {
        console.log(`   ❌ Error accessing blob: ${blobError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugUserCreation(); 