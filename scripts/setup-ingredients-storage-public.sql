-- Setup script for preloaded ingredients images storage bucket
-- Images will be uploaded by administrators/owners only
-- Public read access for display
-- Run this in your Supabase SQL Editor

-- Create the storage bucket for ingredients images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images-ingredients', 'images-ingredients', true);

-- RLS policies for ingredients images (read-only for public)
-- Only service role can upload (admin control)
CREATE POLICY "Service role can upload ingredient images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images-ingredients'
    AND (auth.role() = 'service_role' OR auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE role = 'admin'
    ))
  );

-- Only service role can update (admin control)
CREATE POLICY "Service role can update ingredient images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images-ingredients'
    AND (auth.role() = 'service_role' OR auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE role = 'admin'
    ))
  );

-- Only service role can delete (admin control)
CREATE POLICY "Service role can delete ingredient images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images-ingredients'
    AND (auth.role() = 'service_role' OR auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE role = 'admin'
    ))
  );

-- Public can read ingredient images for display
CREATE POLICY "Everyone can view ingredient images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images-ingredients');
