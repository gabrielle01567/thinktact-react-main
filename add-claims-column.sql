-- Add claims column to patent_applications table
-- Run this SQL in your Supabase SQL Editor

-- Add claims column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'patent_applications' 
        AND column_name = 'claims'
    ) THEN
        ALTER TABLE patent_applications ADD COLUMN claims TEXT;
        RAISE NOTICE '✅ claims column added to patent_applications table';
    ELSE
        RAISE NOTICE 'ℹ️ claims column already exists in patent_applications table';
    END IF;
END $$; 