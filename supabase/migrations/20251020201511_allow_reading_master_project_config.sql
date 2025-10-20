/*
  # Allow reading Master project and its configuration
  
  1. Changes
    - Add RLS policy to allow all authenticated users to read Master project
    - Add RLS policy to allow all authenticated users to read Master project configuration
    - This enables non-admin users to view Master template files in configurator
  
  2. Security
    - Users can only read Master project, not modify it
    - Write access remains restricted to project owners
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow reading Master project" ON projects;
DROP POLICY IF EXISTS "Allow reading Master project configuration" ON project_configurations;

-- Create policy to allow reading Master project
CREATE POLICY "Allow reading Master project"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    title ILIKE 'master'
  );

-- Create policy to allow reading Master project configuration
CREATE POLICY "Allow reading Master project configuration"
  ON project_configurations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_configurations.project_id
      AND projects.title ILIKE 'master'
      AND project_configurations.is_master = true
    )
  );