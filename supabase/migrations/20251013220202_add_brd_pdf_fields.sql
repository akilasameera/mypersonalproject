/*
  # Add BRD PDF Fields

  1. Changes
    - Add `business_profile_url` column to store Business Profile PDF URL
    - Add `business_map_url` column to store Business MAP PDF URL
  
  2. Notes
    - Both fields are optional (nullable)
    - Text type to store full URLs to PDFs in storage
*/

-- Add Business Profile PDF URL column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_configurations' AND column_name = 'business_profile_url'
  ) THEN
    ALTER TABLE project_configurations ADD COLUMN business_profile_url text;
  END IF;
END $$;

-- Add Business MAP PDF URL column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_configurations' AND column_name = 'business_map_url'
  ) THEN
    ALTER TABLE project_configurations ADD COLUMN business_map_url text;
  END IF;
END $$;
