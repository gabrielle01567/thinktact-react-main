import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('📝 To run this script, you need to set:');
  console.log('   SUPABASE_URL=your-supabase-url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPatentApplicationsTable() {
  try {
    console.log('🔧 Setting up patent_applications table...');
    
    // Check if table already exists
    console.log('🔍 Checking if patent_applications table exists...');
    const { data: existingTable, error: checkError } = await supabase
      .from('patent_applications')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.message.includes('relation "patent_applications" does not exist')) {
      console.log('📋 Table does not exist, creating it...');
      
      // Create the table using SQL
      const createTableSQL = `
        CREATE TABLE patent_applications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255),
          short_description TEXT,
          field TEXT,
          background TEXT,
          summary TEXT,
          drawings TEXT,
          detailed_description TEXT,
          critical TEXT,
          alternatives TEXT,
          boilerplate TEXT,
          completed_sections JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_patent_applications_user_id ON patent_applications(user_id);
        CREATE INDEX idx_patent_applications_status ON patent_applications(status);
        CREATE INDEX idx_patent_applications_created_at ON patent_applications(created_at);
        
        -- Add RLS (Row Level Security) policy
        ALTER TABLE patent_applications ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to only see their own patent applications
        CREATE POLICY "Users can view their own patent applications" ON patent_applications
          FOR SELECT USING (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to insert their own patent applications
        CREATE POLICY "Users can insert their own patent applications" ON patent_applications
          FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to update their own patent applications
        CREATE POLICY "Users can update their own patent applications" ON patent_applications
          FOR UPDATE USING (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to delete their own patent applications
        CREATE POLICY "Users can delete their own patent applications" ON patent_applications
          FOR DELETE USING (auth.uid()::text = user_id::text);
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        console.log('💡 Try running the SQL manually in Supabase dashboard:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click "SQL Editor"');
        console.log('3. Run the commands from create-patent-applications-table.sql');
        return;
      }
      
      console.log('✅ Table created successfully!');
      
      // Test inserting a sample record
      console.log('🧪 Testing table with sample data...');
      const { data: testInsert, error: insertError } = await supabase
        .from('patent_applications')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
          title: 'Test Patent Application',
          short_description: 'Test application for table creation',
          completed_sections: { Title: true },
          status: 'draft'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error testing insert:', insertError);
        return;
      }
      
      console.log('✅ Test insert successful:', testInsert);
      
      // Clean up test data
      await supabase
        .from('patent_applications')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Test data cleaned up');
      console.log('✅ patent_applications table setup complete!');
      
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
    } else {
      console.log('✅ patent_applications table already exists!');
    }
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

setupPatentApplicationsTable(); 