import { supabase } from './supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables (mask sensitive data)
    const supabaseUrl = process.env.SUPABASE_URL || 'NOT_SET';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'NOT_SET';
    const supabaseKeyMasked = supabaseKey !== 'NOT_SET' ? 
      supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 10) : 
      'NOT_SET';

    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    res.status(200).json({
      success: true,
      config: {
        supabaseUrl: supabaseUrl,
        supabaseKey: supabaseKeyMasked,
        hasError: !!error,
        error: error ? error.message : null,
        data: data
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to debug Supabase config',
      message: error.message 
    });
  }
} 