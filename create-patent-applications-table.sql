-- Create patent_applications table for storing Patent Buddy data
-- Run this SQL in your Supabase SQL Editor

-- Check if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patent_applications') THEN
        -- Create the patent_applications table
        CREATE TABLE patent_applications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255),
            short_description TEXT,
            cross_reference TEXT, -- Optional. Only if claiming priority to another application
            federal_research TEXT, -- Optional. Only if invention was federally funded
            abstract TEXT,
            field TEXT,
            background TEXT,
            summary TEXT,
            drawings TEXT,
            detailed_description TEXT,
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
        
        RAISE NOTICE '✅ patent_applications table created successfully';
    ELSE
        RAISE NOTICE 'ℹ️ patent_applications table already exists';
    END IF;
END $$; 