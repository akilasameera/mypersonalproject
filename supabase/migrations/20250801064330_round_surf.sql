/*
  # Create Storage Bucket for Attachments

  1. Storage Setup
    - Create 'attachments' bucket for file uploads
    - Set up security policies for authenticated users
    - Enable public access for viewing files

  2. Security
    - Users can only upload to their own folders
    - Users can only view attachments from their own notes
    - Public read access for authenticated file URLs
*/

-- Create the attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true);

-- Policy: Users can upload files to their own folders
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own attachments
CREATE POLICY "Users can view own attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete own attachments" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own attachments
CREATE POLICY "Users can update own attachments" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);