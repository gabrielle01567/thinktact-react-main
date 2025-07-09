const BACKEND_URL = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';

async function setSecurityAnswer() {
  console.log('🔧 Setting security answer for alex.hawke54@gmail.com');
  
  try {
    // Set the security answer via admin endpoint
    const response = await fetch(`${BACKEND_URL}/admin/set-security-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alex.hawke54@gmail.com',
        securityQuestion: 'What was the name of your first pet?',
        securityAnswer: 'Buddy' // Change this to the correct answer
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Security answer set successfully!');
      console.log('Result:', result);
    } else {
      const error = await response.text();
      console.log('❌ Failed to set security answer');
      console.log('Error response:', error);
    }
    
  } catch (error) {
    console.error('❌ Error setting security answer:', error);
  }
}

setSecurityAnswer(); 