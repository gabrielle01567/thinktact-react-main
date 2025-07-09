-- Create analysis_history table for storing user analysis data
-- Run this SQL in your Supabase SQL Editor

-- Check if table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analysis_history') THEN
        -- Create the analysis_history table
        CREATE TABLE analysis_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            argument_text TEXT NOT NULL,
            analysis_results JSONB NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
        CREATE INDEX idx_analysis_history_timestamp ON analysis_history(timestamp);
        
        -- Add RLS (Row Level Security) policy
        ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to only see their own analyses
        CREATE POLICY "Users can view their own analyses" ON analysis_history
            FOR SELECT USING (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to insert their own analyses
        CREATE POLICY "Users can insert their own analyses" ON analysis_history
            FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to update their own analyses
        CREATE POLICY "Users can update their own analyses" ON analysis_history
            FOR UPDATE USING (auth.uid()::text = user_id::text);
        
        -- Create policy to allow users to delete their own analyses
        CREATE POLICY "Users can delete their own analyses" ON analysis_history
            FOR DELETE USING (auth.uid()::text = user_id::text);
        
        RAISE NOTICE 'analysis_history table created successfully with RLS policies';
    ELSE
        RAISE NOTICE 'analysis_history table already exists';
    END IF;
END $$;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'analysis_history'
ORDER BY ordinal_position; 