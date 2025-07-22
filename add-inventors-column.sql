-- Add inventors column to patent_applications table
-- Run this SQL in your Supabase SQL Editor

-- Add inventors column to store inventor information as JSONB
ALTER TABLE patent_applications 
ADD COLUMN IF NOT EXISTS inventors JSONB DEFAULT '[]';

-- Add comment to document the field
COMMENT ON COLUMN patent_applications.inventors IS 'Array of inventor objects with name, address, citizenship, and residence';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'patent_applications' 
AND column_name = 'inventors';

RAISE NOTICE '✅ Inventors column added to patent_applications table successfully'; 