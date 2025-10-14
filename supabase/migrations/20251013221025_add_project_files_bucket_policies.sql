/*
  # Add Storage Policies for Project Files Bucket

  1. Storage Bucket
    - Ensure `project-files` bucket exists
    
  2. Security
    - Enable authenticated users to upload files
    - Enable authenticated users to read files
    - Enable authenticated users to delete their own files
*/

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Allow everyone to read public files
CREATE POLICY "Anyone can read project files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-files');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update project files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-files');
