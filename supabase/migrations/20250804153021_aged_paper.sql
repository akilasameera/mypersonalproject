/*
  # Add project status system

  1. Schema Changes
    - Add `status` column to `projects` table with enum values: 'active', 'hold', 'completed'
    - Set default value to 'active'
    - Add index for better query performance

  2. Data Migration
    - Update all existing projects to have 'active' status

  3. Security
    - No RLS changes needed as existing policies cover the new column
*/

-- Add status column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'hold', 'completed'));
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Update existing projects to have 'active' status
UPDATE projects SET status = 'active' WHERE status IS NULL;