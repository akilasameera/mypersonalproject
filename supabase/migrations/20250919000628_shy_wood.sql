/*
  # Add image support to knowledge tiles

  1. Schema Changes
    - Add `image_url` column to `knowledge_tiles` table for storing uploaded images
    - Add `image_name` column for original filename
    - Add `image_size` column for file size tracking

  2. Security
    - Update existing RLS policies to include new columns
    - Maintain user data isolation
*/

DO $$
BEGIN
  -- Add image columns to knowledge_tiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_tiles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE knowledge_tiles ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_tiles' AND column_name = 'image_name'
  ) THEN
    ALTER TABLE knowledge_tiles ADD COLUMN image_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_tiles' AND column_name = 'image_size'
  ) THEN
    ALTER TABLE knowledge_tiles ADD COLUMN image_size integer;
  END IF;
END $$;