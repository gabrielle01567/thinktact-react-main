import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Starting security fields migration...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration missing' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, let's check if the columns already exist by trying to select them
    console.log('🔍 Checking if security columns already exist...');
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, email, security_question, security_answer')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Security columns already exist!');
      return res.status(200).json({ 
        success: true, 
        message: 'Security columns already exist',
        users: testUsers
      });
    }
    
    console.log('❌ Security columns missing, adding them...');
    
    // Add the columns using direct SQL
    const migrationSQL = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS security_question TEXT,
      ADD COLUMN IF NOT EXISTS security_answer TEXT;
    `;
    
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      
      // Try alternative approach - add columns one by one
      console.log('🔄 Trying alternative approach...');
      
      const { error: questionError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question TEXT;'
      });
      
      const { error: answerError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer TEXT;'
      });
      
      if (questionError || answerError) {
        console.error('❌ Alternative approach also failed');
        console.error('Question error:', questionError);
        console.error('Answer error:', answerError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to add security columns' 
        });
      }
    }
    
    console.log('✅ Security fields migration completed successfully!');
    
    // Verify the migration worked
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('id, email, security_question, security_answer')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      return res.status(500).json({ 
        success: false, 
        error: 'Migration completed but verification failed' 
      });
    }
    
    console.log('✅ Migration verification successful:', users);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Security fields migration completed successfully',
      users: users || []
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
} 