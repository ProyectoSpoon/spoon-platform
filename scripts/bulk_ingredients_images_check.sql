-- Script para verificar y gestionar imágenes de 1000+ ingredientes
-- Ejecutar en Supabase SQL Editor

-- Limpiar tabla temporal si existe de runs previas
DROP TABLE IF EXISTS ingredient_images_analysis;

-- Crear tabla temporal - SIMPLIFICADO: analizar TODOS los productos
-- Si tienes muchos productos, ajusta el LIMIT
CREATE TEMPORARY TABLE ingredient_images_analysis AS
SELECT DISTINCT
    p.id as product_id,
    p.name as product_name,
    'Producto' as category_name,

    -- SOLO UNA VARIACIÓN: la más inteligente
    CASE
        WHEN LENGTH(p.name) > 0 THEN
            -- Filtrar palabras comunes + Title Case + espacios a guiones
            REGEXP_REPLACE(
                INITCAP(
                    TRIM(
                        REGEXP_REPLACE(
                            p.name,
                            '\\b(de|del|la|el|y|con|a|por|para|en|bbq|salsa|picante|dulce|light|clasico|tradicional)\\b',
                            '',
                            'gi'
                        )
                    )
                ),
                '\\s+',
                '-',
                'g'
            )
        ELSE NULL
    END as image_name_suggested

FROM universal_products p
-- ANALIZAR TODOS LOS PRODUCTOS - quita el LIMIT si necesitas más de 500
ORDER BY p.name
LIMIT 500;

-- 2. MOSTRAR ANÁLISIS COMPLETO
SELECT
    product_name as "Nombre del Producto",
    image_name_suggested as "Nombre de Imagen Sugerido",
    CONCAT('https://lwwmmufsdtbetgieoefo.supabase.co/storage/v1/object/public/images-ingredients/',
           image_name_suggested, '.png') as "URL para Subir Imagen"
FROM ingredient_images_analysis
ORDER BY product_name;

-- 3. VERIFICAR IMÁGENES EXISTENTES EN STORAGE
SELECT
    'IMÁGENES EXISTENTES:' as status,
    name as "Archivo Existente",
    metadata->>'size' as "Tamaño (bytes)",
    created_at as "Fecha Upload"
FROM storage.objects
WHERE bucket_id = 'images-ingredients'
ORDER BY created_at DESC;

-- 4. IDENTIFICAR PRODUCTOS SIN IMÁGENES (CUÁLES SUBIR)
SELECT
    'FALTAN SUBIR:' as status,
    ia.product_name as "Producto",
    ia.image_name_suggested as "Nombre Final para la Imagen",
    'Copiar este nombre exacto para el archivo PNG' as "Instrucción"
FROM ingredient_images_analysis ia
LEFT JOIN storage.objects so ON so.bucket_id = 'images-ingredients'
    AND so.name = CONCAT(ia.image_name_suggested, '.png')
WHERE so.name IS NULL
ORDER BY ia.product_name;

-- 5. ESTADÍSTICAS GENERALES
SELECT
    'ESTADÍSTICAS:' as tipo,
    COUNT(*) as "Total Productos Analizados",
    (SELECT COUNT(*) FROM ingredient_images_analysis ia
     JOIN storage.objects so ON so.bucket_id = 'images-ingredients'
     AND so.name = CONCAT(ia.image_name_suggested, '.png')) as "Productos con Imágenes",
    (SELECT COUNT(*) FROM ingredient_images_analysis ia
     LEFT JOIN storage.objects so ON so.bucket_id = 'images-ingredients'
     AND so.name = CONCAT(ia.image_name_suggested, '.png')
     WHERE so.name IS NULL) as "Productos sin Imágenes"
FROM ingredient_images_analysis;

/* EXPORT RESULTS:

1. COPIAR LA PRIMERA TABLA (producto -> nombres sugeridos) y guardar como CSV
2. LA SEGUNDA TABLA muestra imágenes existentes
3. LA TERCERA TABLA muestra productos sin imágenes correspondientes

ESTRATEGIA PARA 1000 INGREDIENTES:
1. Subir imágenes con nombres = "Nombre Sugerido 1"
2. Usar Excel/Google Sheets para gestión masiva
3. Script de importación para cargar en lote
*/
