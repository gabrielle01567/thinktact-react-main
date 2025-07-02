import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function testResendVerification() {
  const testEmail = 'test@example.com'; // Replace with a real email to test
  
  console.log('🧪 Testing resend verification...');
  console.log('Email:', testEmail);
  console.log('Backend URL:', BACKEND_URL);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Resend verification test passed!');
    } else {
      console.log('❌ Resend verification test failed!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testResendVerification(); 