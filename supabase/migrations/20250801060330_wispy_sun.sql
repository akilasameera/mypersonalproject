-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Set up storage policies
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Users can delete own attachments" ON storage.objects
FOR DELETE USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);