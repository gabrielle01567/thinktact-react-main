-- Add missing columns to patent_applications table
-- Run this SQL in your Supabase SQL Editor

-- Add all missing columns that the backend expects
ALTER TABLE patent_applications 
ADD COLUMN IF NOT EXISTS inventors JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS abstract TEXT,
ADD COLUMN IF NOT EXISTS cross_reference TEXT,
ADD COLUMN IF NOT EXISTS federal_research TEXT,
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS background TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS drawings TEXT,
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS completed_sections JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add comments to document the fields
COMMENT ON COLUMN patent_applications.inventors IS 'Array of inventor objects with name, address, citizenship, and residence';
COMMENT ON COLUMN patent_applications.abstract IS 'Abstract of the invention';
COMMENT ON COLUMN patent_applications.cross_reference IS 'Cross-reference to related applications';
COMMENT ON COLUMN patent_applications.federal_research IS 'Federally sponsored research information';
COMMENT ON COLUMN patent_applications.field IS 'Field of the invention';
COMMENT ON COLUMN patent_applications.background IS 'Background of the invention';
COMMENT ON COLUMN patent_applications.summary IS 'Summary of the invention';
COMMENT ON COLUMN patent_applications.drawings IS 'Description of drawings';
COMMENT ON COLUMN patent_applications.detailed_description IS 'Detailed description of the invention';
COMMENT ON COLUMN patent_applications.images IS 'Array of uploaded image objects with filename, url, and metadata';
COMMENT ON COLUMN patent_applications.completed_sections IS 'JSON object tracking completion status of each section';
COMMENT ON COLUMN patent_applications.status IS 'Application status: draft or complete';

-- Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'patent_applications' 
AND column_name IN ('inventors', 'abstract', 'cross_reference', 'federal_research', 'field', 'background', 'summary', 'drawings', 'detailed_description', 'images', 'completed_sections', 'status')
ORDER BY column_name;

RAISE NOTICE '✅ All missing columns added to patent_applications table successfully'; 