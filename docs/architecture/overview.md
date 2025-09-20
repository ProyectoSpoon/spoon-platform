---
title: Arquitectura de SPOON — Overview (Living Doc)
lastUpdated: 2025-09-20
---

# 🏗️ Arquitectura de SPOON — Overview

Este documento vivo consolida una visión general de la arquitectura, enlazando con documentos especializados (DB, UI, módulos) y sirviendo como punto de partida para nuevos contribuidores.

## Índice
- [Monorepo y paquetes](#monorepo-y-paquetes)
- [Plataforma y datos](#plataforma-y-datos)
- [Frontend](#frontend)
- [Diagrama de capas](#diagrama-de-capas)
- [Módulos principales](#módulos-principales)
- [Patrones clave](#patrones-clave)
- [Testing y calidad](#testing-y-calidad)
- [Roadmap técnico (alto nivel)](#roadmap-técnico-alto-nivel)
- [Glosario rápido](#glosario-rápido)

## Monorepo y paquetes
- Apps: `apps/web`, `apps/mobile`, `apps/admin` (Next.js/React Native)
- Shared: `packages/shared` (componentes UI V2, hooks, tipos, servicios a Supabase)
- Integraciones/edge: `packages/integrations`, `packages/edge-functions`

## Plataforma y datos
- BaaS: Supabase (Postgres + PostgREST + RLS + Realtime + Storage + Auth)
- Estrategia: compatibilidad de esquema en cliente (inserts/updates defensivos, omitir columnas no presentes)
- Auditoría: ver `docs/db/MIGRACION_COMPLETADA.md`; triggers, funciones, RLS y logs

## Frontend
- App Router (Next.js), React 18 con componentes server/client donde aplica
- Design System: UI V2 con tokens semánticos (`--sp-*`) y Tailwind (valores arbitrarios)
- Accesibilidad: roles/aria, focus-visible consistente, dark mode por tokens

## Diagrama de capas

```
┌──────────────────────────────────────────────────────────────┐
│                         Usuarios (Web/Mobile/Admin)          │
└───────────────▲───────────────────────────────────────▲──────┘
                │                                       │
                │ UI V2 (Tokens, Accesibilidad)         │
                │ Next.js (App Router, SSR/CSR)          │
┌───────────────┴───────────────────────────────────────┴──────┐
│                  Capa de Aplicación (Frontend)                │
│  - Páginas y flujos (Caja, Menú del Día, Mesas)              │
│  - Hooks y servicios compartidos (@spoon/shared)             │
│  - Helpers Supabase (schema-compat, retries, guards)         │
└───────────────▲───────────────────────────────────────▲──────┘
                │                                       │
                │ REST (PostgREST)                      │ Realtime (subcripciones)
                │ Storage (archivos)                    │ Auth (JWT)
┌───────────────┴───────────────────────────────────────┴──────┐
│                         Supabase Platform                     │
│   - Postgres (RLS, índices, funciones, triggers, políticas)   │
│   - Edge Functions / Integrations (cuando aplique)            │
└──────────────────────────────────────────────────────────────┘
```

Notas:
- Los helpers en `packages/shared/lib/supabase.ts` centralizan la compatibilidad de esquema y manejo de errores (PGRST204, 22P02).
- Preferimos ordenamiento/normalización en cliente cuando hay drift de columnas en vistas/consultas.

## Módulos principales
- Caja: ver `docs/modal-cierre-caja-implementacion.md` y `docs/db/*`
- Menú del Día: ver `docs/menu-del-dia.md` (favoritos/plantillas, helpers Supabase)
- Mesas: ver `docs/mesas-module-analysis.md` y `docs/mesas-refactoring-progress.md`

## Patrones clave
- Helpers compartidos en `packages/shared/lib/supabase.ts` encapsulan lógica de compatibilidad y fallback
- Evitar ordenamiento pesado en SQL si hay drift de columnas; preferir cliente
- Estrategia de reintentos ante PGRST204 (columna no válida) y guardas para 22P02 (UUID inválidos)

## Testing y calidad
- Jest para suites de integración/unidad (ver tasks en VS Code)
- ESLint con regla anti-colores fuera de tokens; Storybook con a11y addon

## Roadmap técnico (alto nivel)
- Constraint único para `favorite_combinations`
- Suscripción Realtime para sincronización inmediata en tabs clave
- Dashboards de auditoría para administradores

## Glosario rápido
- RLS (Row Level Security): políticas de Postgres que restringen filas por usuario/tenant.
- PostgREST: capa REST auto-generada sobre tablas/vistas de Postgres empleada por Supabase.
- Realtime: servicio de Supabase para subscribirse a cambios en tablas/canales (websockets).
- Tokens de UI: variables CSS `--sp-*` (semantic colors/surfaces) usadas con Tailwind (valores arbitrarios).
- Schema-compat: estrategia de payloads defensivos (omitir columnas opcionales/desconocidas y reintentar) para tolerar variaciones.
- Cascada manual: eliminación ordenada de hijos → padre para evitar conflictos de FK cuando no hay ON DELETE CASCADE.
- PGRST204: error típico de PostgREST por columna inexistente en el recurso consultado.
- 22P02: error de Postgres por sintaxis inválida (común en UUIDs undefined); se mitiga con guardas y saneo.

---
Actualiza este doc cuando cambien:
- Esquema de BD relevante o políticas RLS
- Guías de UI/tokens
- Flujos críticos de módulos (Caja, Menú del Día, Mesas)
