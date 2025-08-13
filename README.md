# 🍴 SPOON Platform

> Sistema operativo para la cadena de suministro de restaurantes en Latinoamérica

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

## 🎯 Roadmap MVP
1. **Land**: Menú digital gratuito
2. **Expand**: Analytics y SaaS Premium  
3. **Scale**: Marketplace de insumos

---
**Hecho con ❤️ para empoderar restaurantes independientes**
