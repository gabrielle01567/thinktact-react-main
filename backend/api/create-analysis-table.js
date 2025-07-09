import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Creating analysis_history table in Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        error: 'Database configuration missing',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if table already exists
    console.log('🔍 Checking if analysis_history table exists...');
    const { data: existingTable, error: checkError } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.message.includes('relation "analysis_history" does not exist')) {
      console.log('📋 Table does not exist, creating it...');
      
      // Create the table using SQL
      const createTableSQL = `
        CREATE TABLE analysis_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          argument_text TEXT NOT NULL,
          analysis_results JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: createTableSQL
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        return res.status(500).json({ 
          error: 'Failed to create table',
          details: createError.message
        });
      }
      
      console.log('✅ Table created successfully!');
      
      // Test inserting a sample record
      console.log('🧪 Testing table with sample data...');
      const { data: testInsert, error: insertError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
          argument_text: 'Test argument for table creation',
          analysis_results: { test: true }
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error testing insert:', insertError);
        return res.status(500).json({ 
          error: 'Table created but test insert failed',
          details: insertError.message
        });
      }
      
      console.log('✅ Test insert successful:', testInsert);
      
      // Clean up test data
      await supabase
        .from('analysis_history')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Test data cleaned up');
      
      res.status(200).json({ 
        success: true, 
        message: 'analysis_history table created successfully' 
      });
      
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return res.status(500).json({ 
        error: 'Error checking table existence',
        details: checkError.message
      });
    } else {
      console.log('✅ Table already exists!');
      res.status(200).json({ 
        success: true, 
        message: 'analysis_history table already exists' 
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating analysis_history table:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 