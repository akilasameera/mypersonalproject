/*
  # Create meetings system

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `title` (text)
      - `description` (text, optional)
      - `meeting_date` (timestamp)
      - `duration` (integer, minutes)
      - `status` (text: scheduled, in_progress, completed, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `meeting_transcripts`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `content` (text)
      - `speaker` (text, optional)
      - `timestamp` (text, optional - time within meeting)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `meeting_summaries`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `content` (text)
      - `key_points` (text, optional)
      - `action_items` (text, optional)
      - `decisions` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `meeting_todos`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `title` (text)
      - `description` (text, optional)
      - `assigned_to` (text, optional)
      - `due_date` (date, optional)
      - `priority` (text: low, medium, high)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage meetings in their own projects
    
  3. Indexes
    - Add indexes for performance on foreign keys and frequently queried columns
*/

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  meeting_date timestamptz DEFAULT now(),
  duration integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meeting transcripts table
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  content text NOT NULL,
  speaker text DEFAULT '',
  timestamp_in_meeting text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meeting summaries table
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  content text NOT NULL,
  key_points text DEFAULT '',
  action_items text DEFAULT '',
  decisions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meeting todos table
CREATE TABLE IF NOT EXISTS meeting_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to text DEFAULT '',
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_todos ENABLE ROW LEVEL SECURITY;

-- Create policies for meetings
CREATE POLICY "Users can manage meetings in own projects"
  ON meetings
  FOR ALL
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  ))
  WITH CHECK (project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  ));

-- Create policies for meeting transcripts
CREATE POLICY "Users can manage transcripts in own meetings"
  ON meeting_transcripts
  FOR ALL
  TO authenticated
  USING (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Create policies for meeting summaries
CREATE POLICY "Users can manage summaries in own meetings"
  ON meeting_summaries
  FOR ALL
  TO authenticated
  USING (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Create policies for meeting todos
CREATE POLICY "Users can manage meeting todos in own meetings"
  ON meeting_todos
  FOR ALL
  TO authenticated
  USING (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (meeting_id IN (
    SELECT m.id FROM meetings m
    JOIN projects p ON m.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_meeting_id ON meeting_transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_meeting_id ON meeting_summaries(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_todos_meeting_id ON meeting_todos(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_todos_completed ON meeting_todos(completed);
CREATE INDEX IF NOT EXISTS idx_meeting_todos_due_date ON meeting_todos(due_date);

-- Create triggers for updated_at columns
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
    WHERE trigger_name = 'update_meetings_updated_at'
  ) THEN
    CREATE TRIGGER update_meetings_updated_at
      BEFORE UPDATE ON meetings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_meeting_transcripts_updated_at'
  ) THEN
    CREATE TRIGGER update_meeting_transcripts_updated_at
      BEFORE UPDATE ON meeting_transcripts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_meeting_summaries_updated_at'
  ) THEN
    CREATE TRIGGER update_meeting_summaries_updated_at
      BEFORE UPDATE ON meeting_summaries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_meeting_todos_updated_at'
  ) THEN
    CREATE TRIGGER update_meeting_todos_updated_at
      BEFORE UPDATE ON meeting_todos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;