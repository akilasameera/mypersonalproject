/*
  # Add note status category

  1. Changes
    - Add `status_category` column to notes table
    - Valid values: 'general' or 'current_status'
    - Default to 'general' for existing notes
    - Add check constraint for valid values

  2. Security
    - No changes to RLS policies needed
*/

-- Add status_category column to notes table
ALTER TABLE notes ADD COLUMN status_category text DEFAULT 'general';

-- Add check constraint to ensure valid values
ALTER TABLE notes ADD CONSTRAINT notes_status_category_check 
CHECK (status_category IN ('general', 'current_status'));

-- Update existing notes to have 'general' status
UPDATE notes SET status_category = 'general' WHERE status_category IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE notes ALTER COLUMN status_category SET NOT NULL;