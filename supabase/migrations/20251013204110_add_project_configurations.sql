/*
  # Add Project Configuration System

  1. New Tables
    - `project_configurations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `is_master` (boolean) - indicates if this is the master configuration
      - `brd_content` (text) - stores BRD (Business Requirements Document) content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `configurator_blocks`
      - `id` (uuid, primary key)
      - `configuration_id` (uuid, references project_configurations)
      - `block_name` (text) - name of the configuration block
      - `block_order` (integer) - order of the block (1-14)
      - `image_url` (text) - URL of the uploaded image
      - `image_name` (text) - original filename
      - `image_size` (integer) - file size in bytes
      - `text_content` (text) - text input for the block
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own configurations

  3. Default Block Names
    The system will support 14 predefined blocks:
    1. BOM Preferences
    2. Shifts
    3. Labor Codes
    4. Production Preferences
    5. Production Preferences Branch
    6. Production Order Type
    7. Production Labor codes
    8. Inventory Planning Preferences
    9. MPS Type
    10. MPS Type (duplicate as requested)
    11. Inventory Planning Bucket
    12. Estimate Preferences
    13. Estimate Classes
    14. Configurator Preferences
    15. Features
*/

-- Create project_configurations table
CREATE TABLE IF NOT EXISTS project_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  is_master boolean DEFAULT false,
  brd_content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create configurator_blocks table
CREATE TABLE IF NOT EXISTS configurator_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id uuid NOT NULL REFERENCES project_configurations(id) ON DELETE CASCADE,
  block_name text NOT NULL,
  block_order integer NOT NULL,
  image_url text,
  image_name text,
  image_size integer,
  text_content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurator_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_configurations
CREATE POLICY "Users can view own project configurations"
  ON project_configurations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project configurations"
  ON project_configurations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project configurations"
  ON project_configurations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project configurations"
  ON project_configurations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for configurator_blocks
CREATE POLICY "Users can view own configurator blocks"
  ON configurator_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_configurations
      JOIN projects ON projects.id = project_configurations.project_id
      WHERE project_configurations.id = configurator_blocks.configuration_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own configurator blocks"
  ON configurator_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_configurations
      JOIN projects ON projects.id = project_configurations.project_id
      WHERE project_configurations.id = configurator_blocks.configuration_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own configurator blocks"
  ON configurator_blocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_configurations
      JOIN projects ON projects.id = project_configurations.project_id
      WHERE project_configurations.id = configurator_blocks.configuration_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_configurations
      JOIN projects ON projects.id = project_configurations.project_id
      WHERE project_configurations.id = configurator_blocks.configuration_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own configurator blocks"
  ON configurator_blocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_configurations
      JOIN projects ON projects.id = project_configurations.project_id
      WHERE project_configurations.id = configurator_blocks.configuration_id
      AND projects.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_configurations_project_id ON project_configurations(project_id);
CREATE INDEX IF NOT EXISTS idx_configurator_blocks_configuration_id ON configurator_blocks(configuration_id);
CREATE INDEX IF NOT EXISTS idx_configurator_blocks_order ON configurator_blocks(configuration_id, block_order);
