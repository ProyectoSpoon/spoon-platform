# ESTO ES SPOON - Informe Técnico Completo

## 📋 Resumen Ejecutivo

SPOON Platform es un sistema operativo para la cadena de suministro de restaurantes independientes en Latinoamérica, comenzando por Colombia. Su propósito fundamental es conectar comensales con restaurantes en tiempo real, permitiendo a los restaurantes predecir demanda y optimizar compras de insumos mediante data real de ventas.

**Visión Core:** Convertir a SPOON en el sistema operativo central para restaurantes independientes, monetizando a través de un marketplace de insumos basado en predicciones de demanda.

---

## 🏗️ Arquitectura General

### Estructura Monorepo
SPOON utiliza una arquitectura de monorepo con la siguiente estructura jerárquica:

```
spoon-platform/
├── apps/
│   ├── web/          # Dashboard principal para restaurantes
│   ├── mobile/       # App móvil para comensales
│   └── admin/        # Panel administrativo interno
├── packages/
│   ├── shared/       # Librería compartida (tipos, hooks, componentes)
│   ├── edge-functions/  # Funciones serverless Supabase
│   └── integrations/    # APIs externas
├── docs/             # Documentación técnica y de negocio
└── scripts/          # Utilidades de BD y deployment
```

### Patrón de Arquitectura
- **Multitenant con Row Level Security (RLS)**: Cada restaurante opera en aislamiento de datos
- **Schema Compatibility**: Manejo defensivo de cambios en base de datos
- **Separación clara**: Frontend/Backend/Edge functions bien delimitados
- **Reutilización máxima**: Packages shared promueven DRY principle

---

## 💻 Stack Tecnológico

### Frontend
- **Framework**: React 18/19 + TypeScript 5.x
- **Routing**: Next.js App Router (web) + React Navigation (mobile)
- **Styling**: TailwindCSS + Design System tokens semánticos
- **State Management**: Context API + hooks personalizados
- **Mobile**: React Native + Expo SDK 53

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **APIs**: PostgREST auto-generado + Edge Functions
- **Seguridad**: JWT + RLS policies + triggers de auditoría
- **Storage**: Supabase Storage para assets

### DevOps & Quality
- **Build**: Turborepo para monorepo orchestration
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint con reglas custom anti-hardcoded colors
- **Deployment**: Vercel (web) + EAS Build (mobile)

---

## 📱 Aplicaciones Individuales

### 1. SPOON Web (apps/web/)
**Propósito**: Dashboard administrativo completo para restaurantes

#### Arquitectura Técnica
- **Framework**: Next.js 14+ con App Router
- **Estructura de Rutas**:
  ```
  app/
  ├── auth/                    # Autenticación (login/register/callback)
  ├── dashboard/               # Dashboard principal
  │   ├── caja/               # Sistema de caja y facturación
  │   ├── menu-dia/           # Gestión de menús diarios
  │   ├── mesas/              # Sistema de mesas y comandas
  │   ├── domicilios/         # Gestión de entregas
  │   ├── configuracion/      # Configuración del restaurante
  │   └── carta/              # Gestión de carta completa
  ├── config-restaurante/     # Setup inicial del restaurante
  └── comandas/               # Sistema de comandas por mesa
  ```

#### Módulos Core Implementados

**Sistema de Caja (`dashboard/caja/`)**
- **Funcionalidad**: Apertura/cierre de caja, movimientos, gastos, arqueos
- **Componentes**: `CajaTerminal`, `ModalCierreCaja`, `SidebarResumen`
- **Hooks**: `useCaja`, `useCajaSesion`, `useSaldoCalculado`
- **Tipos**: `cajaTypes.ts` con interfaces completas
- **Integración**: Facturación integrada con `facturacion/` submodule

**Menú del Día (`dashboard/carta/menu-dia/`)**
- **Funcionalidad**: Creación de combinaciones, favoritos, plantillas
- **Componentes**: `CombinationCard`, `MenuWizardPage`, `MenuFavoritesPage`
- **Helpers Supabase**: `ensureFavoriteCombination`, `createMenuTemplate`
- **Features**: Generación automática de combinaciones, templates reutilizables

**Sistema de Mesas (`dashboard/mesas/`)**
- **Funcionalidad**: Gestión de mesas, creación de órdenes, estados
- **Componentes**: `MesaCard`, `CrearOrdenWizard`, `MesaDetailsPanel`
- **Hooks**: `useMesas` con realtime updates
- **Configuración**: Sistema maestro de mesas con `ConfiguracionMesasModal`

**Domicilios (`dashboard/domicilios/`)**
- **Funcionalidad**: Gestión de pedidos, asignación de domiciliarios
- **Componentes**: `PedidoDetailCard`, `DomiciliariosPanel`
- **Hooks**: `useDomiciliosPageController`, `usePedidos`
- **Flujos**: Cliente → Menú → Resumen → Pago

#### Design System Integration
- **UI V2 Tokens**: Variables CSS `--sp-*` para colores semánticos
- **Componentes Compartidos**: `packages/shared/components/ui/`
- **Accesibilidad**: ARIA labels, focus management, dark mode support

### 2. SPOON Mobile (apps/mobile/)
**Propósito**: App de descubrimiento gastronómico para comensales

#### Arquitectura Técnica
- **Framework**: React Native + Expo SDK 53
- **Navegación**: React Navigation 7.x con stacks anidados
- **Estructura**:
  ```
  src/
  ├── design-system/          # Design System propietario
  │   ├── components/         # Componentes modulares
  │   ├── theme/             # Tokens y configuración
  │   └── hooks/             # Hooks de tema
  ├── screens/               # Pantallas principales
  ├── navigation/            # Configuración de navegación
  ├── services/              # APIs y utilidades
  └── types/                 # Definiciones TypeScript
  ```

#### Design System Propietario
**Tokens Centralizados**:
- **Colors**: `SpoonColors` con paleta completa (primarios, semánticos, grises)
- **Typography**: `SpoonTypography` escalas Material Design adaptadas
- **Spacing**: Sistema de 8px con aliases semánticos
- **Shadows/Radii**: Predefinidos para consistencia

**Componentes Core**:
- `SpoonButton`: Variants (primary/secondary/danger/outlined/text)
- `SpoonTextField`: Inputs con validación integrada
- `SpoonCard`: Contenedores con sombras y padding
- `SpoonSection`: Layout semántico para secciones
- `SpoonSearchBar`: Búsqueda con filtros

#### Flujo de Navegación
```
Splash (2s) → LocationPermission → Auth Stack → Main Tabs
                                                    ├── Home (geolocalizado)
                                                    ├── Search (filtros avanzados)
                                                    ├── Favorites (guardados)
                                                    └── Profile Stack
```

#### Features Implementadas
- **Geolocalización**: Reverse geocoding con Nominatim, formateo colombiano
- **Autenticación**: Supabase Auth completo con biometría preparada
- **Reviews**: Sistema de calificaciones y comentarios
- **Configuración**: Perfil, privacidad, notificaciones, seguridad
- **Offline Support**: Caching básico de datos

### 3. SPOON Admin (apps/admin/)
**Propósito**: Panel administrativo interno mínimo

#### Estado Actual
- Estructura básica: `components/`, `pages/`, `services/`
- **Limitado**: Solo componentes esenciales, sin features completas
- **Uso**: Administración interna del sistema

---

## 📦 Packages Compartidos

### packages/shared/
**Propósito**: Librería central de componentes, hooks y utilidades reutilizables

#### Estructura Interna
```
packages/shared/
├── caja/                    # Lógica específica de caja
├── components/              # UI components por dominio
│   ├── caja/               # Componentes de caja
│   ├── mesas/              # Componentes de mesas
│   ├── ui/                 # UI primitives (Button, Input, etc.)
│   └── shared/             # Comunes
├── constants/               # Constantes por módulo
├── hooks/                   # Hooks personalizados
├── lib/                     # Utilidades core (Supabase, storage)
├── services/                # APIs especializadas
├── types/                   # Definiciones TypeScript
└── utils/                   # Helpers generales
```

#### Utilidades Core (`lib/`)

**Supabase Client (`lib/supabase.ts`)**:
```typescript
// Helpers para compatibilidad de schema
ensureFavoriteCombination(params)
deleteFavoriteCombinationByComponents(params)
createMenuTemplate({ name, products[] })

// Manejo de errores PGRST204 (columnas faltantes)
const handleSchemaDrift = (error) => {
  if (error.code === 'PGRST204') {
    return retryWithReducedPayload(originalPayload);
  }
};
```

**Storage (`lib/storage.ts`)**:
- Abstracción de AsyncStorage/localStorage
- Serialización automática
- Migraciones de schema

#### Hooks Especializados

**Caja (`caja/hooks/`)**:
- `useCajaSesion`: Gestión de sesiones de caja
- `useSaldoCalculado`: Cálculos de saldo con fórmulas complejas
- `useGastos`: Gestión de gastos con validaciones

**Mesas (`mesas/hooks/`)**:
- `useMesas`: Estado de mesas con realtime
- `useMesasState`: Lógica de estados de mesa

**Menú Día (`menu-dia/hooks/`)**:
- `useMenuData`: Fetch y cache de datos de menú
- `useMenuState`: Estado local de construcción de menú

#### Tipos TypeScript
- **Centralizados**: Un solo lugar para interfaces
- **Modulares**: `types/caja/`, `types/mesas/`, etc.
- **Supabase**: Auto-generados desde schema

---

## 🎯 Módulos y Solución de Problemas

### El Problema que Resuelve SPOON

**Para Comensales:**
1. **Información Asimétrica**: No saben qué menús hay disponibles HOY
2. **Toma de Decisiones**: Eligen restaurante sin conocer opciones actuales
3. **Pérdida de Tiempo**: Van a lugares que no tienen lo que quieren

**Para Restaurantes:**
1. **Predicción de Demanda**: Cocinando "a ojo" sin data real
2. **Compra Ineficiente**: Gastan más en insumos de los necesarios
3. **Clientes Perdidos**: Gente no los encuentra cuando tienen disponibilidad

### Cómo los Módulos Resuelven el Problema

#### 1. Menú del Día → Información en Tiempo Real
**Problema**: Comensales no saben qué hay disponible hoy
**Solución Técnica**:
- **Publicación Inmediata**: Restaurantes suben menú en 2 minutos
- **QR Integration**: `comandas/mesa/[numero]/` genera QR automático
- **Realtime Updates**: Cambios se reflejan instantáneamente
- **Geolocalización**: App móvil muestra menús cercanos

**Flujo Técnico**:
```typescript
// En mobile: HomeScreen con geolocalización
const { location } = useLocationService();
const menus = await supabase
  .from('daily_menus')
  .select('*')
  .eq('is_active', true)
  .filter('location', 'near', location, 5); // km
```

#### 2. Sistema de Caja → Captura Data Real de Ventas
**Problema**: Restaurantes no saben qué realmente se vende
**Solución Técnica**:
- **Registro Automático**: Cada venta se captura en `transacciones_caja`
- **Categorización**: Productos, cantidades, precios, horarios
- **Auditoría**: Triggers de BD previenen manipulación
- **Reportes**: Analytics de qué combina mejor

**Flujo Técnico**:
```sql
-- Trigger automático en ventas
CREATE TRIGGER audit_venta_trigger
  AFTER INSERT ON transacciones_caja
  FOR EACH ROW EXECUTE FUNCTION audit_transaction();
```

#### 3. Sistema de Mesas → Optimización de Operaciones
**Problema**: Gestión manual ineficiente de mesas
**Solución Técnica**:
- **Estado Realtime**: Mesas actualizan estado automáticamente
- **Comandas Digitales**: `comandas/mesa/[numero]/orden/[ordenId]/`
- **Flujo Optimizado**: Toma de orden → Cocina → Pago
- **Analytics**: Patrones de ocupación y tiempos

**Flujo Técnico**:
```typescript
// Hook useMesas con realtime
const { mesas, loading } = useMesas();
useEffect(() => {
  const subscription = supabase
    .channel('mesas_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' })
    .subscribe();
}, []);
```

#### 4. Domicilios → Expansión de Canales
**Problema**: Pérdida de ventas por no tener delivery
**Solución Técnica**:
- **Integración Menús**: Usa mismos productos del menú del día
- **Asignación Inteligente**: Algoritmo de domiciliarios por zona
- **Tracking**: Estados en tiempo real para clientes
- **Data Adicional**: Más ventas capturadas para predicciones

#### 5. App Móvil → Conexión con Comensales
**Problema**: Comensales no pueden acceder a información
**Solución Técnica**:
- **Descubrimiento**: Algoritmo de recomendación por ubicación
- **UX Optimizada**: Flujo de 3 taps para ordenar
- **Offline**: Funcionalidad básica sin conexión
- **Personalización**: Favoritos, reviews, preferencias

### El Marketplace: Monetización Final

**Data Collection → Prediction → Optimization**

1. **Captura**: Todos los módulos alimentan tabla central de ventas
2. **Análisis**: Algoritmos predicen demanda por producto/restaurante
3. **Optimización**: Recomendaciones de compra de insumos
4. **Marketplace**: Compra colectiva reduce costos
5. **Revenue**: Comisión por transacciones + premium features

**Flujo Técnico del Marketplace**:
```sql
-- Vista de predicciones
CREATE VIEW demand_predictions AS
SELECT
  product_id,
  restaurant_id,
  AVG(quantity_sold) as avg_daily_demand,
  STDDEV(quantity_sold) as demand_variance,
  COUNT(*) as data_points
FROM sales_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY product_id, restaurant_id;
```

---

## 🔄 Flujo de Negocio Completo

### Onboarding Restaurante
1. **Registro**: Auth + perfil básico
2. **Configuración**: `config-restaurante/` (horarios, ubicación, logo)
3. **Setup Inicial**: Primer menú del día
4. **QR Generation**: Código para mesas

### Operación Diaria
1. **Mañana**: Subir menú del día (2 minutos)
2. **Día**: Gestionar mesas/comandas/caja
3. **Tarde**: Procesar domicilios
4. **Noche**: Cierre de caja + análisis automático

### App Comensal
1. **Apertura**: Geolocalización automática
2. **Descubrimiento**: Ver menús cercanos disponibles
3. **Selección**: Elegir restaurante + productos
4. **Consumo**: Escanear QR → ordenar → pagar

### Data Flow
```
Ventas (Caja/Mesas/Domicilios) → BD Central → Analytics → Predicciones → Marketplace
```

---

## 🎯 Conclusión

SPOON Platform es una **solución integral y técnicamente sólida** para el problema de información asimétrica en el mercado gastronómico colombiano. Su arquitectura modular permite capturar data real de operaciones para alimentar un marketplace predictivo de insumos.

**Diferenciadores Técnicos**:
- **Multitenant Robusto**: RLS + schema compatibility
- **Apps Nativas**: Web completa + mobile madura
- **Design Systems**: Consistencia visual profesional
- **Data-Driven**: Todo construido para capturar y monetizar insights

**Riesgo Principal**: Adopción inicial - necesita masa crítica de restaurantes y comensales para que el flywheel comience.

**Estado Actual**: Producto viable con apps funcionales, listo para beta testing agresivo.

---
*Informe generado: Septiembre 2025*
*Versión: 1.0*
*Autor: Análisis Técnico Automatizado*
