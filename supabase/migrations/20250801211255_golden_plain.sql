/*
  # Add project category feature

  1. Schema Changes
    - Add `category` column to `projects` table
    - Set default value to 'main'
    - Add check constraint for valid categories

  2. Security
    - No RLS changes needed (inherits existing policies)
*/

-- Add category column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'category'
  ) THEN
    ALTER TABLE projects ADD COLUMN category text DEFAULT 'main';
  END IF;
END $$;

-- Add check constraint for valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_category_check'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_category_check 
    CHECK (category IN ('main', 'mine'));
  END IF;
END $$;