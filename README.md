# 🍴 SPOON Platform

> Sistema operativo para la cadena de suministro de restaurantes en Latinoamérica

## 📚 Documentación clave
- Arquitectura (overview): [docs/architecture/overview.md](./docs/architecture/overview.md)
- Módulo Menú del Día: [docs/menu-del-dia.md](./docs/menu-del-dia.md)
- Sistema de Caja (migración BD): [docs/db/MIGRACION_COMPLETADA.md](./docs/db/MIGRACION_COMPLETADA.md)
- Modal de Cierre de Caja (frontend): [docs/modal-cierre-caja-implementacion.md](./docs/modal-cierre-caja-implementacion.md)
- UI V2 y tokens: [docs/ui-v2-migration.md](./docs/ui-v2-migration.md), [docs/ui-tokens-usage.md](./docs/ui-tokens-usage.md)

## 🎯 Visión
Convertir a SPOON en el sistema operativo central para la cadena de suministro de los restaurantes independientes, comenzando por Colombia.

## 🏗️ Arquitectura

### Apps
- **web/**: Dashboard principal para restaurantes
- **admin/**: Panel administrativo interno  
- **mobile/**: Aplicación móvil (futuro)

### Packages
- **shared/**: Tipos, utils, hooks y componentes reutilizables
- **database/**: Esquemas, migraciones y seeds de Supabase
- **edge-functions/**: Funciones serverless de Supabase
- **integrations/**: Integraciones con APIs externas

## 🚀 Stack Tecnológico
- **Frontend**: React + TypeScript + TailwindCSS
- **Arquitectura**: Multitenant con Row Level Security
- **Deployment**: Vercel + Supabase Cloud

## 📦 Instalación

npm install
### Database snapshot (schema)

Provide DB connection via env vars (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, optional PGSCHEMA, PGSSLMODE). See `scripts/db/ENV_EXAMPLE.txt`.

- Generate snapshot: `npm run db:snapshot:generate`
- Compare with human doc: `npm run db:snapshot:compare`
- Both: `npm run db:snapshot`

Outputs to `docs/db/snapshots/` and prints file paths.

# Desarrollo
npm run dev

# Build
npm run build
\\\

## 🔧 Feature flags

- Sistema Maestro de Mesas (frontend):
	- Variable: `NEXT_PUBLIC_ENABLE_SISTEMA_MAESTRO` (default: false)
	- Archivo ejemplo: `apps/web/.env.example`
	- Uso: copiar a `.env.local` en `apps/web/` y ajustar a `true` para activar el nuevo sistema maestro en la UI.


## 🎯 Roadmap MVP
1. **Land**: Menú digital gratuito
2. **Expand**: Analytics y SaaS Premium  
3. **Scale**: Marketplace de insumos

---
**Hecho con ❤️ para empoderar restaurantes independientes**
