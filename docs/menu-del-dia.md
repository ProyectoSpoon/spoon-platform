---
title: Módulo Menú del Día — Resumen funcional y técnico
lastUpdated: 2025-09-20
---

# 🍽️ Menú del Día — Guía funcional y técnica

Este documento resume el flujo funcional, decisiones técnicas y utilidades compartidas del módulo Menú del Día, incluyendo Favoritos y Plantillas.

## Objetivo
- Permitir configurar y publicar el Menú del Día por restaurante (TZ Bogotá).
- Acelerar la operación diaria con combinaciones generadas, favoritos y plantillas reutilizables.
- Mantener compatibilidad de esquema (Supabase/PostgREST) ante variaciones de columnas.

## Flujo funcional

### 1) Combinaciones generadas
- La UI genera combinaciones de productos (principio, proteína, entrada?, bebida?).
- Indicadores de publicación y expiración; métricas básicas.

### 2) Favoritos
- Un único botón/toggle “Favorito” por combinación (en `CombinationCard`), amarillo cuando está activo.
- ON → asegura la fila en `favorite_combinations` (si no existe, la crea).
- OFF → elimina el favorito por componentes (restaurant + ids de productos; entradas y bebidas pueden ser null).
- El tab “Favoritos” refleja los cambios y permite renombrar/eliminar.

### 3) Plantillas
- Guardado con nombre solicitado al usuario.
- Estructura: `menu_templates` (cabecera) + `menu_template_products` (detalle).
- “Aplicar plantilla” hidrata productos y los presenta en el asistente/wizard.
- Eliminación: cascada manual (primero detalle, luego cabecera) para evitar conflictos de FK.

## Modelo de datos (referencial)
- Tablas usadas:
  - `favorite_combinations`
  - `menu_templates`
  - `menu_template_products`
- RLS activas por restaurante; auditoría según políticas globales.
- Recomendado (pendiente opcional): constraint único por tupla de componentes en `favorite_combinations`:
  - (restaurant_id, principio_id, proteina_id, entrada_id?, bebida_id?)

## Helpers compartidos (Supabase)
Ubicación: `packages/shared/lib/supabase.ts`

- ensureFavoriteCombination(params):
  - Busca por componentes y crea si no existe.
  - Valida UUIDs; si faltan ids en la combinación seleccionada, hace fetch de respaldo para resolverlos.

- deleteFavoriteCombinationByComponents(params):
  - Elimina el favorito que coincide con la tupla de componentes (null-safe para entrada/bebida).

- createFavoriteCombination(payload):
  - Inserta omitiendo columnas opcionales o desconocidas; reintenta si PostgREST devuelve columna no válida.

- Plantillas:
  - createMenuTemplate({ name, products[] }): inserta cabecera y detalle; guarda metadatos (nombres/categorías) para robustez.
  - getMenuTemplates(): lista plantillas por restaurante.
  - getTemplateProducts(templateId): hidrata y normaliza campos faltantes (p. ej. `product_name`).
  - deleteMenuTemplate(templateId): elimina detalle y luego cabecera (cascada manual).

### Estrategia schema-compat (PostgREST)
- Los inserts/updates omiten columnas no presentes y reintentan sin ellas (p. ej., `combination_price`).
- Los helpers sanitizan tipos y previenen `22P02 invalid input syntax for uuid`.

## Integración UI (apps/web)
- Páginas:
  - `MenuCombinationsPage.tsx`: toggle de favorito (ON: ensure, OFF: delete-by-components), fallback fetch de ids.
  - `MenuFavoritesPage.tsx`: listar/renombrar/eliminar favoritos; aplicar favoritos.
  - `MenuWizardPage.tsx`: creación/aplicación de plantillas.
- Componentes:
  - `CombinationCard.tsx`: botón único “Favorito” en la parte inferior; sin iconos duplicados en cabecera.
- Se eliminaron los botones “Nuevo favorito” y “Nueva plantilla” en sus tabs para mantener flujos claros.

## Errores tratados y guardas
- 22P02 (invalid UUID): sanitización de ids + fetch de respaldo desde `generated_combinations` cuando falten.
- PGRST204 (columna desconocida): payloads reducidos + reintentos sin columnas opcionales.
- 409 (FK en delete de plantilla): cascada manual detallada (hijos → padre).

## Buenas prácticas adicionales
- Ordenamientos en cliente para evitar fallos por drifts de esquema en el servidor.
- TZ Bogotá para fechas de publicación/expiración.
- Tokens de UI (CSS variables) en vez de colores tailwind directos.

## Próximos pasos sugeridos (opcionales)
- Agregar constraint único en `favorite_combinations` para la tupla de componentes.
- Suscripción en tiempo real a `favorite_combinations` para sincronización instantánea del tab.
- Test de integración del flujo Favoritos/Plantillas en Jest.

---
Actualizado: 2025-09-20
