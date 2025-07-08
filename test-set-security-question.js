// Test script to set security question and answer for alex.hawke54@gmail.com
const BACKEND_URL = 'https://backendv2-ruddy.vercel.app/api'; // Replace with your actual backend URL

async function setSecurityQuestion() {
  console.log('🔧 Setting security question for alex.hawke54@gmail.com');
  
  try {
    const response = await fetch(`${BACKEND_URL}/admin/set-security-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        securityQuestion: 'What was the name of your first pet?',
        securityAnswer: 'Fluffy' // You can change this to whatever you want
      })
    });
    
    const result = await response.json();
    
    console.log('📡 Response status:', response.status);
    console.log('📄 Response:', result);
    
    if (result.success) {
      console.log('✅ Security question and answer set successfully!');
      console.log('🔐 Security Question:', result.user.securityQuestion);
      console.log('🔐 Security Answer: ***SET***');
    } else {
      console.log('❌ Failed to set security question:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
setSecurityQuestion(); 