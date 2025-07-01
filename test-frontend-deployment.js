// Test script to check what backend URL the frontend is actually using
const FRONTEND_URL = 'https://thinktact.ai';

async function testFrontendDeployment() {
  console.log('🔍 Testing Frontend Deployment');
  console.log('Frontend URL:', FRONTEND_URL);
  
  try {
    // Test if we can reach the frontend
    console.log('\n🔍 Testing frontend accessibility...');
    const frontendResponse = await fetch(FRONTEND_URL);
    console.log('Frontend status:', frontendResponse.status);
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
      
      // Check if the frontend has updated by looking for the new backend URL in the response
      const frontendText = await frontendResponse.text();
      
      if (frontendText.includes('backendv2-ruddy.vercel.app')) {
        console.log('✅ Frontend contains new backend URL');
      } else if (frontendText.includes('backend-7vievbgfv-gabrielle-shands-projects')) {
        console.log('❌ Frontend still contains old backend URL');
        console.log('Frontend deployment may not have updated yet');
      } else {
        console.log('ℹ️ Could not determine backend URL in frontend');
      }
    } else {
      console.log('❌ Frontend not accessible');
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend:', error.message);
  }
}

testFrontendDeployment(); 