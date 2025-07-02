-- Migration: Add security question and answer columns to users table
-- Run this script to add the security fields to existing databases

-- Add security_question column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'security_question'
    ) THEN
        ALTER TABLE users ADD COLUMN security_question VARCHAR(255);
        RAISE NOTICE 'Added security_question column to users table';
    ELSE
        RAISE NOTICE 'security_question column already exists in users table';
    END IF;
END $$;

-- Add security_answer column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'security_answer'
    ) THEN
        ALTER TABLE users ADD COLUMN security_answer VARCHAR(255);
        RAISE NOTICE 'Added security_answer column to users table';
    ELSE
        RAISE NOTICE 'security_answer column already exists in users table';
    END IF;
END $$; 