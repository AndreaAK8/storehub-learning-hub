-- Add region column to training_resources table
ALTER TABLE training_resources ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'ALL';

-- Add comment for documentation
COMMENT ON COLUMN training_resources.region IS 'Region for the resource: ALL, MY, PH';
