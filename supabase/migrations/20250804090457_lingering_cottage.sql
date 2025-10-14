/*
  # Add status_type column to notes table

  1. Changes
    - Add `status_type` column to `notes` table
    - Column allows 'me' or 'customer' values
    - Column is nullable (only used for current_status notes)
    - Add check constraint to ensure valid values

  2. Security
    - No changes to RLS policies needed
    - Existing policies will cover the new column
*/

-- Add status_type column to notes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'status_type'
  ) THEN
    ALTER TABLE notes ADD COLUMN status_type text;
  END IF;
END $$;

-- Add check constraint to ensure valid status_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'notes_status_type_check'
  ) THEN
    ALTER TABLE notes ADD CONSTRAINT notes_status_type_check 
    CHECK (status_type IS NULL OR status_type IN ('me', 'customer'));
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN notes.status_type IS 'Type of status note: me or customer. Only used when status_category is current_status';