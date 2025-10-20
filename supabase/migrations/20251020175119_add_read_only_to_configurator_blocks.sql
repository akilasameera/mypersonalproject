/*
  # Add read-only flag to configurator blocks
  
  1. Changes
    - Add `is_read_only` column to configurator_blocks table (boolean, default false)
    - Add `source_block_id` column to track which master block this was copied from
  
  2. Purpose
    - Allow marking configurator blocks as read-only
    - Track which blocks were copied from the Master project
    - Enable showing Master project files as read-only in all projects
*/

-- Add is_read_only column to configurator_blocks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configurator_blocks' AND column_name = 'is_read_only'
  ) THEN
    ALTER TABLE configurator_blocks ADD COLUMN is_read_only boolean DEFAULT false;
  END IF;
END $$;

-- Add source_block_id column to track copied blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configurator_blocks' AND column_name = 'source_block_id'
  ) THEN
    ALTER TABLE configurator_blocks ADD COLUMN source_block_id uuid;
  END IF;
END $$;