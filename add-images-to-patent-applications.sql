-- Add images field to patent_applications table
-- Run this SQL in your Supabase SQL Editor

-- Add images column to store uploaded image data as JSONB
ALTER TABLE patent_applications 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Add comment to document the field
COMMENT ON COLUMN patent_applications.images IS 'Array of uploaded image objects with filename, url, and metadata';

-- Add abstract, cross_reference, federal_research, and inventors columns
ALTER TABLE patent_applications
ADD COLUMN IF NOT EXISTS abstract text,
ADD COLUMN IF NOT EXISTS cross_reference text,
ADD COLUMN IF NOT EXISTS federal_research text,
ADD COLUMN IF NOT EXISTS inventors jsonb;

-- Update the updated_at timestamp when images are modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patent_applications_updated_at') THEN
        CREATE TRIGGER update_patent_applications_updated_at 
            BEFORE UPDATE ON patent_applications 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

RAISE NOTICE '✅ Images field added to patent_applications table successfully'; 