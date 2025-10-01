-- Update script for ingredients images storage bucket policies
-- Only updates RLS policies if bucket already exists
-- Run this in your Supabase SQL Editor

-- Check if bucket exists, if not create it
DO $$
BEGIN
    -- Try to insert bucket, ignore if it already exists
    BEGIN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('images-ingredients', 'images-ingredients', true);
        RAISE NOTICE 'Bucket images-ingredients created successfully';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Bucket images-ingredients already exists, updating policies only';
    END;

    -- Remove existing policies if they exist (safe operation)
    BEGIN
        DROP POLICY IF EXISTS "Service role can upload ingredient images" ON storage.objects;
        DROP POLICY IF EXISTS "Service role can update ingredient images" ON storage.objects;
        DROP POLICY IF EXISTS "Service role can delete ingredient images" ON storage.objects;
        DROP POLICY IF EXISTS "Everyone can view ingredient images" ON storage.objects;
        RAISE NOTICE 'Old policies removed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No old policies to remove or error removing them';
    END;
END $$;

-- Create new RLS policies for ingredients images
-- Only authenticated users can upload (preloaded by admins)
CREATE POLICY "Authenticated users can upload ingredient images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images-ingredients'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can update (admin control)
CREATE POLICY "Authenticated users can update ingredient images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images-ingredients'
    AND auth.role() = 'authenticated'
  );

-- Only authenticated users can delete (admin control)
CREATE POLICY "Authenticated users can delete ingredient images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images-ingredients'
    AND auth.role() = 'authenticated'
  );

-- Public can read ingredient images for display
CREATE POLICY "Everyone can view ingredient images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images-ingredients');
