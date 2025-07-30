import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper to get a fresh Supabase client every time
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  console.log('🔍 Supabase configuration check:');
  console.log('🔍 SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('🔍 SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Not set');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  
  console.log('🔍 Creating Supabase client...');
  return createClient(supabaseUrl, supabaseServiceKey);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Debug database connection test');
    
    const supabase = getSupabaseClient();
    
    // Test basic connection
    console.log('🔍 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: testError.message 
      });
    }
    
    console.log('✅ Database connection successful');
    
    // Get all users (for debugging)
    console.log('🔍 Fetching all users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, is_verified, password_hash')
      .limit(10);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch users',
        details: usersError.message 
      });
    }
    
    console.log('✅ Users fetched successfully');
    
    // Return sanitized user data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      isVerified: user.is_verified,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0,
      passwordHashStarts: user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'N/A'
    }));
    
    res.status(200).json({
      success: true,
      message: 'Database connection and query successful',
      userCount: users.length,
      users: sanitizedUsers,
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('❌ Debug database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 