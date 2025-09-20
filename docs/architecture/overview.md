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
- [Módulos principales](#módulos-principales)
- [Patrones clave](#patrones-clave)
- [Testing y calidad](#testing-y-calidad)
- [Roadmap técnico (alto nivel)](#roadmap-técnico-alto-nivel)

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

---
Actualiza este doc cuando cambien:
- Esquema de BD relevante o políticas RLS
- Guías de UI/tokens
- Flujos críticos de módulos (Caja, Menú del Día, Mesas)
