# Spoon Design System

## Overlays y Transparencias

Para garantizar consistencia visual y evitar literales RGBA dispersos:

- Usa `getOverlay(level, colors)` para capas oscuras estándar sobre contenido.
  - Niveles: `light` (15%), `medium` (30%), `strong` (50%), `extra` (70%).
- Usa `applyAlpha(colorHex, alpha)` únicamente dentro del design-system cuando necesites derivar un fondo semitransparente específico de un token (por ejemplo fondos suaves de estados).
- Evita escribir `rgba(...)` directamente en pantallas o componentes de producto; si no encaja en un overlay estándar, considera si debería convertirse en token.

## Principios de Estilos

- Las hojas de estilo deben contener sólo propiedades estructurales (layout, spacing, radius). Colores y tipografía se aplican cerca del JSX usando hooks (`useColors`, `useTypography`).
- Cualquier color nuevo debe evaluarse: ¿es semántico? (success, warning, info) ¿es de marca? (primary, secondary) ¿es estado UI? (surface, background, overlay). Si no, probablemente no deba añadirse.

## Sombras

- Usa `useShadows()` y las claves `sm | md | lg | xl` o sombras especializadas (`componentShadows`, `SpoonShadows` si existe la factory) en lugar de definir `shadowColor`, `shadowOpacity` manualmente.
- `cardShadow` y `overlay` en `SpoonColors` se derivan con `withOpacity` para mantener coherencia.

## Colores de Marca Sociales

Definidos en `constants/socialColors.ts`. Consumirlos sólo cuando se muestre una identidad externa (Instagram, Twitter, Facebook). No reutilizar para semántica interna.

## Checklist al crear/editar un componente

1. ¿Usa hooks de diseño (`useColors`, `useSpacing`, `useTypography`, `useRadii`, `useShadows`)?
2. ¿Evita hex y rgba inline fuera de tokens? Si hay transparencia, ¿usa `getOverlay` o `applyAlpha`?
3. ¿Sombras vía API DS en vez de propiedades sueltas?
4. ¿Textos con estilos tipográficos predefinidos (no fuentes arbitrarias)?
5. ¿Colores de estado correctos (success, warning, error, info) en feedback/UI semántico?

## Ejemplo Rápido Overlay

```
import { getOverlay } from './utils/overlays';
const overlay = getOverlay('medium', colors);
<View style={{ backgroundColor: overlay }} />
```

## Ejemplo Rápido Alpha Derivado

```
import { applyAlpha } from './utils/overlays';
const subtleInfoBg = applyAlpha(colors.info, 0.08);
```

---
Mantén esta guía breve y específica. Si algo no encaja, probablemente necesite un nuevo token o reconsideración del diseño.
