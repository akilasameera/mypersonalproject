/*
  # Allow reading Master project configurator blocks
  
  1. Changes
    - Add RLS policy to allow all authenticated users to read configurator blocks from Master project
    - This enables non-admin users to view Master template files
  
  2. Security
    - Users can only read Master blocks, not modify them
    - Write access remains restricted to project owners
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow reading Master configurator blocks" ON configurator_blocks;

-- Create policy to allow reading Master project configurator blocks
CREATE POLICY "Allow reading Master configurator blocks"
  ON configurator_blocks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_configurations pc
      JOIN projects p ON p.id = pc.project_id
      WHERE pc.id = configurator_blocks.configuration_id
      AND p.title ILIKE 'master'
      AND pc.is_master = true
    )
  );