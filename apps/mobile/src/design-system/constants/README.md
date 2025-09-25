# Design System Constants

Este directorio contiene todas las constantes y design tokens del sistema de diseño.

## 📋 Constantes Planificadas

### Design Tokens
- **colors.ts**: Paleta completa de colores semánticos
- **typography.ts**: Escalas tipográficas y font families
- **spacing.ts**: Sistema de espaciado (4px, 8px, 16px, etc.)
- **shadows.ts**: Definiciones de elevación y sombras
- **borders.ts**: Radii, widths, y estilos de bordes

### Layout Constants
- **breakpoints.ts**: Breakpoints responsivos (mobile, tablet, desktop)
- **grid.ts**: Configuración del sistema de grid
- **zIndex.ts**: Jerarquía de z-index para modals, tooltips, etc.
- **sizes.ts**: Tamaños predefinidos para componentes

### Animation Constants
- **durations.ts**: Duraciones estándar para animaciones
- **easings.ts**: Curvas de animación (ease-in, ease-out, etc.)
- **transitions.ts**: Transiciones predefinidas

### Component Constants
- **variants.ts**: Variantes disponibles para cada componente
- **sizes.ts**: Tamaños estándar (xs, sm, md, lg, xl)
- **states.ts**: Estados de interacción (hover, focus, active, disabled)

### Platform Constants
- **platform.ts**: Constantes específicas de React Native
- **accessibility.ts**: Configuración de accesibilidad
- **performance.ts**: Configuración de optimización

### Brand Constants
- **brand.ts**: Colores, logos, y elementos de marca
- **theme-variants.ts**: Variantes de tema (light, dark, high-contrast)

## 🎯 Propósito

Las constantes del design system garantizan:

- **Consistencia**: Valores uniformes en toda la aplicación
- **Mantenibilidad**: Cambios centralizados en un solo lugar
- **Escalabilidad**: Fácil adición de nuevos tokens
- **Tipado**: TypeScript IntelliSense para todos los valores

## 📅 Estado: Pendiente

Estas constantes se consolidarán en la Phase 6-7 del roadmap, extrayendo valores hard-codeados de los componentes existentes.
