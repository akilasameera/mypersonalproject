/*
  # Add start date to todos table

  1. Changes
    - Add `start_date` column to `todos` table
    - Rename `due_date` to `end_date` for clarity
    - Update existing data to maintain compatibility

  2. Migration Details
    - Adds start_date column (nullable)
    - Keeps due_date as end_date for backward compatibility
    - No data loss during migration
*/

-- Add start_date column to todos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE todos ADD COLUMN start_date date;
  END IF;
END $$;

-- Add end_date column and copy data from due_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE todos ADD COLUMN end_date date;
    -- Copy existing due_date values to end_date
    UPDATE todos SET end_date = due_date WHERE due_date IS NOT NULL;
  END IF;
END $$;