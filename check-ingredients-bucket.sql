-- Verificar contenido del bucket images-ingredients
-- Ejecutar en Supabase SQL Editor

-- Verificar si el bucket existe y está público
SELECT * FROM storage.buckets WHERE id = 'images-ingredients';

-- Listar todos los archivos en el bucket (últimos 50)
SELECT * FROM storage.objects
WHERE bucket_id = 'images-ingredients'
ORDER BY created_at DESC
LIMIT 50;

-- Buscar específicamente archivos relacionados con "espinaca"
SELECT * FROM storage.objects
WHERE bucket_id = 'images-ingredients'
  AND name ILIKE '%espinaca%'
ORDER BY created_at DESC;

-- Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%ingredient%';

/* Alternativamente, desde el Storage Dashboard:
1. Ve a Supabase Dashboard → Storage → images-ingredients
2. Verifica que estén las imágenes subidas
3. Verifica que el bucket esté marcado como público
*/
