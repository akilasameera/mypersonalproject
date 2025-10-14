/*
  # Create knowledge tiles table

  1. New Tables
    - `knowledge_tiles`
      - `id` (uuid, primary key)
      - `section_id` (uuid, foreign key to knowledge_sections)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `knowledge_tiles` table
    - Add policy for users to manage tiles in own sections
*/

CREATE TABLE IF NOT EXISTS knowledge_tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES knowledge_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_tiles ENABLE ROW LEVEL SECURITY;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_tiles_section_id ON knowledge_tiles(section_id);

-- RLS Policy: Users can manage tiles in sections they own
CREATE POLICY "Users can manage tiles in own sections"
  ON knowledge_tiles
  FOR ALL
  TO authenticated
  USING (
    section_id IN (
      SELECT ks.id 
      FROM knowledge_sections ks
      JOIN knowledge_topics kt ON ks.topic_id = kt.id
      WHERE kt.user_id = auth.uid()
    )
  )
  WITH CHECK (
    section_id IN (
      SELECT ks.id 
      FROM knowledge_sections ks
      JOIN knowledge_topics kt ON ks.topic_id = kt.id
      WHERE kt.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_tiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_tiles_updated_at
  BEFORE UPDATE ON knowledge_tiles
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_tiles_updated_at();