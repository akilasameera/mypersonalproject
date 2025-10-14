/*
  # Create Knowledge Base Tables

  1. New Tables
    - `knowledge_topics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `knowledge_sections`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to knowledge_topics)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for efficient querying
*/

-- Create knowledge_topics table
CREATE TABLE IF NOT EXISTS knowledge_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create knowledge_sections table
CREATE TABLE IF NOT EXISTS knowledge_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE knowledge_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_topics
CREATE POLICY "Users can manage own knowledge topics"
  ON knowledge_topics
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for knowledge_sections
CREATE POLICY "Users can manage sections in own topics"
  ON knowledge_sections
  FOR ALL
  TO authenticated
  USING (topic_id IN (
    SELECT id FROM knowledge_topics WHERE user_id = auth.uid()
  ))
  WITH CHECK (topic_id IN (
    SELECT id FROM knowledge_topics WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_user_id ON knowledge_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sections_topic_id ON knowledge_sections(topic_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_knowledge_topics_updated_at'
  ) THEN
    CREATE TRIGGER update_knowledge_topics_updated_at
      BEFORE UPDATE ON knowledge_topics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_knowledge_sections_updated_at'
  ) THEN
    CREATE TRIGGER update_knowledge_sections_updated_at
      BEFORE UPDATE ON knowledge_sections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;