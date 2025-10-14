/*
  # Project Management System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `color` (text)
      - `due_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notes`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `content` (text)
      - `due_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `attachments`
      - `id` (uuid, primary key)
      - `note_id` (uuid, references notes)
      - `name` (text)
      - `size` (integer)
      - `type` (text)
      - `url` (text)
      - `created_at` (timestamp)
    
    - `links`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `url` (text)
      - `username` (text, optional)
      - `password` (text, optional)
      - `description` (text, optional)
      - `created_at` (timestamp)
    
    - `todos`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `description` (text, optional)
      - `completed` (boolean)
      - `due_date` (date, optional)
      - `priority` (text)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  name text NOT NULL,
  size integer NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  username text,
  password text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for notes
CREATE POLICY "Users can read notes from own projects"
  ON notes
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes in own projects"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in own projects"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes from own projects"
  ON notes
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create policies for attachments
CREATE POLICY "Users can read attachments from own notes"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (
    note_id IN (
      SELECT n.id FROM notes n
      JOIN projects p ON n.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments in own notes"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    note_id IN (
      SELECT n.id FROM notes n
      JOIN projects p ON n.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments from own notes"
  ON attachments
  FOR DELETE
  TO authenticated
  USING (
    note_id IN (
      SELECT n.id FROM notes n
      JOIN projects p ON n.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Create policies for links
CREATE POLICY "Users can read links from own projects"
  ON links
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create links in own projects"
  ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update links in own projects"
  ON links
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links from own projects"
  ON links
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create policies for todos
CREATE POLICY "Users can read todos from own projects"
  ON todos
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create todos in own projects"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update todos in own projects"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete todos from own projects"
  ON todos
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_links_project_id ON links(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_project_id ON todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_due_date ON notes(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();