import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function createAnalysisHistoryTable() {
  console.log('🔧 Creating analysis_history table in Supabase...');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
      console.log('SUPABASE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
      return;
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
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          argument_text TEXT NOT NULL,
          analysis_results JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for faster queries
        CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
        CREATE INDEX idx_analysis_history_timestamp ON analysis_history(timestamp);
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: createTableSQL
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        
        // Try alternative approach - create table step by step
        console.log('🔄 Trying alternative approach...');
        
        const { error: tableError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS analysis_history (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID NOT NULL,
              argument_text TEXT NOT NULL,
              analysis_results JSONB NOT NULL,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        if (tableError) {
          console.error('❌ Alternative approach also failed:', tableError);
          return;
        }
        
        console.log('✅ Table created successfully!');
      } else {
        console.log('✅ Table created successfully!');
      }
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return;
    } else {
      console.log('✅ Table already exists!');
    }
    
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
    } else {
      console.log('✅ Test insert successful:', testInsert);
      
      // Clean up test data
      await supabase
        .from('analysis_history')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error creating analysis_history table:', error);
    console.error('Error details:', error.message);
  }
}

createAnalysisHistoryTable(); 