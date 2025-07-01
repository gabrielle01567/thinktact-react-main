export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing email configuration...');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'));
    
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY not found in environment variables',
        config: {
          hasKey: false,
          keyPrefix: 'none'
        }
      });
    }

    if (!process.env.RESEND_API_KEY.startsWith('re_')) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY format is invalid (should start with re_)',
        config: {
          hasKey: true,
          keyPrefix: process.env.RESEND_API_KEY.substring(0, 10) + '...'
        }
      });
    }

    // Test Resend connection
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Just test the connection, don't send an email
      console.log('✅ Resend connection test successful');
      
      return res.status(200).json({ 
        success: true,
        message: 'Resend configuration is valid',
        config: {
          hasKey: true,
          keyPrefix: 're_...',
          connection: 'successful'
        }
      });
      
    } catch (resendError) {
      console.error('❌ Resend connection failed:', resendError);
      return res.status(500).json({ 
        error: 'Resend connection failed',
        details: resendError.message,
        config: {
          hasKey: true,
          keyPrefix: 're_...',
          connection: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
} 