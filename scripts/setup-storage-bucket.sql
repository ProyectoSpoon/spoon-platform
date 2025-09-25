-- Setup Storage Bucket for Restaurant Images
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload to their restaurant folder
-- Path structure: restaurants/{restaurantId}/{type}/{filename}
CREATE POLICY "Users can upload restaurant images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'restaurants'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- 4. Policy: Allow authenticated users to update their own restaurant images
CREATE POLICY "Users can update restaurant images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'restaurant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'restaurants'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- 5. Policy: Allow authenticated users to delete their own restaurant images
CREATE POLICY "Users can delete restaurant images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'restaurant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'restaurants'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- 6. Policy: Allow everyone to view restaurant images (public bucket)
CREATE POLICY "Anyone can view restaurant images" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-images');

-- 7. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
