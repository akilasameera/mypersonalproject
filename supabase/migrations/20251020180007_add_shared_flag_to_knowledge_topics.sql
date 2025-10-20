/*
  # Add sharing flags to knowledge topics
  
  1. Changes
    - Add `is_shared` column to knowledge_topics (default false)
    - Add `is_read_only` column to knowledge_topics (to mark admin-created topics for other users)
    - Add `created_by_admin` column to track if topic was created by admin
  
  2. Purpose
    - Allow admin to share knowledge base topics with all users
    - Users can view admin's shared topics but cannot edit/delete them
    - Users can create their own topics
*/

-- Add is_shared column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_topics' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE knowledge_topics ADD COLUMN is_shared boolean DEFAULT false;
  END IF;
END $$;

-- Add created_by_admin column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_topics' AND column_name = 'created_by_admin'
  ) THEN
    ALTER TABLE knowledge_topics ADD COLUMN created_by_admin boolean DEFAULT false;
  END IF;
END $$;

-- Update existing topics from admin user
UPDATE knowledge_topics 
SET created_by_admin = true 
WHERE user_id IN (SELECT id FROM profiles WHERE is_admin = true);

-- Create policy to allow reading shared topics from admin
DROP POLICY IF EXISTS "Allow reading shared knowledge topics" ON knowledge_topics;

CREATE POLICY "Allow reading shared knowledge topics"
  ON knowledge_topics
  FOR SELECT
  TO authenticated
  USING (
    is_shared = true AND created_by_admin = true
  );

-- Same for knowledge_sections
DROP POLICY IF EXISTS "Allow reading shared knowledge sections" ON knowledge_sections;

CREATE POLICY "Allow reading shared knowledge sections"
  ON knowledge_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_topics kt
      WHERE kt.id = knowledge_sections.topic_id
      AND kt.is_shared = true
      AND kt.created_by_admin = true
    )
  );

-- Same for knowledge_tiles
DROP POLICY IF EXISTS "Allow reading shared knowledge tiles" ON knowledge_tiles;

CREATE POLICY "Allow reading shared knowledge tiles"
  ON knowledge_tiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_sections ks
      JOIN knowledge_topics kt ON kt.id = ks.topic_id
      WHERE ks.id = knowledge_tiles.section_id
      AND kt.is_shared = true
      AND kt.created_by_admin = true
    )
  );