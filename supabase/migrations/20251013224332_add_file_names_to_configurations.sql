/*
  # Add file name fields to project configurations

  1. Changes
    - Add `business_profile_name` column to store original file name
    - Add `business_map_name` column to store original file name
    - These fields help display appropriate file type information in the UI
  
  2. Notes
    - Existing rows will have NULL values for these fields
    - These fields will be populated on new uploads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_configurations' AND column_name = 'business_profile_name'
  ) THEN
    ALTER TABLE project_configurations ADD COLUMN business_profile_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_configurations' AND column_name = 'business_map_name'
  ) THEN
    ALTER TABLE project_configurations ADD COLUMN business_map_name text;
  END IF;
END $$;
